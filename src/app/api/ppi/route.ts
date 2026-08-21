import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/activityLog";
import { createNotification } from "@/lib/notifications";

import { sanitizeString, sanitizeTextarea } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Akses ditolak: Anda belum terautentikasi" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const userId = (session.user as any).id;
    const foundationId = (session.user as any).foundationId;

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const classId = searchParams.get("classId");

    const where: any = {};
    if (studentId) where.studentId = studentId;

    // Foundation scope for Admin / Yayasan
    if (foundationId && (role === "ADMIN" || role === "YAYASAN")) {
      where.student = {
        ...where.student,
        foundationId,
      };
    }

    // Data isolation for teachers
    if (role === "GURU") {
      where.student = {
        ...where.student,
        classes: {
          some: {
            class: {
              teacherId: userId,
            },
            ...(classId && classId !== "SEMUA" ? { classId } : {}),
          },
        },
      };
    } else if (classId && classId !== "SEMUA") {
      where.student = {
        ...where.student,
        classes: {
          some: {
            classId: classId,
          },
        },
      };
    }

    // Data isolation for parents
    if (role === "ORANG_TUA") {
      where.student = {
        ...where.student,
        parentId: userId,
      };
    }

    const ppiPlans = await prisma.ppiPlan.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            nisn: true,
            gender: true,
            jenjang: true,
            disabilityType: true,
            parentId: true,
            foundation: {
              select: {
                name: true,
                code: true,
                address: true,
                phone: true,
              },
            },
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
        evaluations: {
          orderBy: {
            evaluationDate: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(ppiPlans);
  } catch (error: any) {
    console.error("Error fetching PPI:", error);
    return NextResponse.json({ error: "Gagal memuat rencana PPI" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Akses ditolak: Anda belum terautentikasi" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "GURU" && role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak: Hanya Guru atau Admin yang dapat menyusun PPI" }, { status: 403 });
    }

    const body = await req.json();
    const { studentId, academicYear, currentCapability, longTermGoal, shortTermGoal } = body;

    const cleanAcademicYear = sanitizeString(academicYear);
    const cleanCapability = sanitizeTextarea(currentCapability);
    const cleanLongTerm = sanitizeTextarea(longTermGoal);
    const cleanShortTerm = sanitizeTextarea(shortTermGoal);

    if (!studentId || !cleanAcademicYear || !cleanCapability || !cleanLongTerm || !cleanShortTerm) {
      return NextResponse.json({ error: "Semua kolom target PPI wajib diisi" }, { status: 400 });
    }

    const teacherId = (session.user as any).id;

    if (role === "GURU") {
      const studentInClass = await prisma.student.findFirst({
        where: {
          id: studentId,
          classes: {
            some: {
              class: {
                teacherId: teacherId,
              },
            },
          },
        },
      });
      if (!studentInClass) {
        return NextResponse.json({ error: "Akses ditolak: Anda hanya dapat menyusun PPI untuk siswa pada kelas yang Anda ampu" }, { status: 403 });
      }
    }

    const ppiPlan = await prisma.ppiPlan.create({
      data: {
        studentId,
        teacherId,
        academicYear: cleanAcademicYear,
        currentCapability: cleanCapability,
        longTermGoal: cleanLongTerm,
        shortTermGoal: cleanShortTerm,
      },
      include: {
        student: true,
        teacher: true,
        evaluations: true,
      },
    });

    // Log Activity
    await logActivity({
      userId: teacherId,
      userName: session.user.name || "Guru",
      userRole: role,
      action: "CREATE",
      entity: "PpiPlan",
      entityId: ppiPlan.id,
      description: `Menyusun rencana Program Pembelajaran Individual (PPI) baru untuk ${ppiPlan.student.name} TA ${ppiPlan.academicYear}`,
      foundationId: ppiPlan.student.foundationId,
    });

    // Notify Parent
    if (ppiPlan.student?.parentId) {
      await createNotification({
        userId: ppiPlan.student.parentId,
        title: `Program PPI Baru Disusun: ${ppiPlan.student.name}`,
        message: `Guru telah merancang target pembelajaran individual (PPI) baru: "${ppiPlan.shortTermGoal}".`,
        type: "PPI",
        link: "/ortu",
      });
    }

    return NextResponse.json(ppiPlan, { status: 201 });

  } catch (error: any) {
    console.error("Error creating PPI plan:", error);
    return NextResponse.json({ error: "Gagal membuat PPI: " + error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Akses ditolak: Anda belum terautentikasi" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    if (role !== "GURU" && role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak: Hanya Guru atau Admin yang dapat menghapus PPI" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID PPI wajib disertakan" }, { status: 400 });
    }

    const ppi = await prisma.ppiPlan.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            classes: {
              include: {
                class: true,
              },
            },
          },
        },
      },
    });

    if (!ppi) {
      return NextResponse.json({ error: "Data PPI tidak ditemukan" }, { status: 404 });
    }

    // Strict Authorization check for GURU
    if (role === "GURU") {
      const isCreator = ppi.teacherId === userId;
      const isTeacherOfStudent = ppi.student.classes.some((c) => c.class?.teacherId === userId);

      if (!isCreator && !isTeacherOfStudent) {
        return NextResponse.json({ error: "Akses ditolak: Anda hanya dapat menghapus PPI yang Anda buat atau siswa kelas Anda" }, { status: 403 });
      }
    }

    await prisma.ppiPlan.delete({
      where: { id },
    });

    // Log Activity
    await logActivity({
      userId: userId,
      userName: session.user.name || "Guru",
      userRole: role,
      action: "DELETE",
      entity: "PpiPlan",
      entityId: id,
      description: `Menghapus dokumen PPI untuk siswa ${ppi.student.name}`,
      foundationId: ppi.student.foundationId,
    });

    return NextResponse.json({ message: "PPI berhasil dihapus" });
  } catch (error: any) {
    console.error("Error deleting PPI plan:", error);
    return NextResponse.json({ error: "Gagal menghapus PPI: " + error.message }, { status: 500 });
  }
}

