import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Score } from "@prisma/client";
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
    const category = searchParams.get("category");
    const classId = searchParams.get("classId");

    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (category) where.category = category;

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

    const assessments = await prisma.assessment.findMany({
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
      },
      orderBy: {
        assessmentDate: "desc",
      },
    });

    return NextResponse.json(assessments);
  } catch (error: any) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json({ error: "Gagal memuat data asesmen" }, { status: 500 });
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
      return NextResponse.json({ error: "Akses ditolak: Hanya Guru atau Admin yang dapat membuat asesmen" }, { status: 403 });
    }

    const body = await req.json();
    const { studentId, category, title, aspect, score, findings, recommendation } = body;

    const cleanTitle = sanitizeString(title);
    const cleanAspect = sanitizeString(aspect);
    const cleanFindings = sanitizeTextarea(findings);
    const cleanRecommendation = recommendation ? sanitizeTextarea(recommendation) : null;
    const cleanCategory = sanitizeString(category);

    if (!studentId || !cleanCategory || !cleanTitle || !cleanAspect || !score || !cleanFindings) {
      return NextResponse.json({ error: "Semua kolom wajib diisi" }, { status: 400 });
    }

    if (!Object.values(Score).includes(score)) {
      return NextResponse.json({ error: "Nilai skor asesmen tidak valid" }, { status: 400 });
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
        return NextResponse.json({ error: "Akses ditolak: Anda hanya dapat membuat asesmen untuk siswa pada kelas yang Anda ampu" }, { status: 403 });
      }
    }

    const assessment = await prisma.assessment.create({
      data: {
        studentId,
        teacherId,
        category: cleanCategory,
        title: cleanTitle,
        aspect: cleanAspect,
        score,
        findings: cleanFindings,
        recommendation: cleanRecommendation,
      },
      include: {
        student: true,
        teacher: true,
      },
    });

    // Log Activity
    await logActivity({
      userId: teacherId,
      userName: session.user.name || "Guru",
      userRole: role,
      action: "ASSESSMENT",
      entity: "Assessment",
      entityId: assessment.id,
      description: `Melakukan asesmen [${cleanCategory} - ${assessment.aspect}] pada siswa ${assessment.student.name} dengan capaian ${score}`,
      foundationId: assessment.student.foundationId,
    });

    // Notify Parent
    if (assessment.student?.parentId) {
      const scoreBadge = score === "MANDIRI" ? "🟢 Mandiri" : score === "DENGAN_BANTUAN" ? "🟡 Dengan Bantuan" : "🔴 Belum Mampu";
      await createNotification({
        userId: assessment.student.parentId,
        title: `Asesmen Baru: ${assessment.student.name}`,
        message: `Guru telah mencatat asesmen aspek "${assessment.aspect}" (${cleanCategory}) dengan hasil ${scoreBadge}.`,
        type: "ASSESSMENT",
        link: "/ortu",
      });
    }

    return NextResponse.json(assessment, { status: 201 });

  } catch (error: any) {
    console.error("Error creating assessment:", error);
    return NextResponse.json({ error: "Gagal menyimpan asesmen: " + error.message }, { status: 500 });
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
      return NextResponse.json({ error: "Akses ditolak: Hanya Guru atau Admin yang dapat menghapus asesmen" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID asesmen wajib disertakan" }, { status: 400 });
    }

    const assessment = await prisma.assessment.findUnique({
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

    if (!assessment) {
      return NextResponse.json({ error: "Data asesmen tidak ditemukan" }, { status: 404 });
    }

    // Strict Authorization check for GURU
    if (role === "GURU") {
      const isCreator = assessment.teacherId === userId;
      const isTeacherOfStudent = assessment.student.classes.some((c) => c.class?.teacherId === userId);

      if (!isCreator && !isTeacherOfStudent) {
        return NextResponse.json({ error: "Akses ditolak: Anda hanya dapat menghapus asesmen yang Anda buat atau siswa kelas Anda" }, { status: 403 });
      }
    }

    await prisma.assessment.delete({
      where: { id },
    });

    // Log Activity
    await logActivity({
      userId: userId,
      userName: session.user.name || "Guru",
      userRole: role,
      action: "DELETE",
      entity: "Assessment",
      entityId: id,
      description: `Menghapus data asesmen [${assessment.category} - ${assessment.aspect}] untuk siswa ${assessment.student.name}`,
      foundationId: assessment.student.foundationId,
    });

    return NextResponse.json({ message: "Asesmen berhasil dihapus" });
  } catch (error: any) {
    console.error("Error deleting assessment:", error);
    return NextResponse.json({ error: "Gagal menghapus asesmen: " + error.message }, { status: 500 });
  }
}

