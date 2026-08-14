import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Jenjang } from "@prisma/client";
import { logActivity } from "@/lib/activityLog";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        parent: true,
        foundation: true,
        classes: {
          include: {
            class: {
              include: {
                teacher: true,
              },
            },
          },
        },
        ppiPlans: {
          include: {
            evaluations: true,
          },
        },
        assessments: true,
        dailyJournals: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
    }

    // Role-based access checks
    if (role === "GURU") {
      const isTeacherClass = student.classes.some((c) => c.class?.teacherId === userId);
      if (!isTeacherClass) {
        return NextResponse.json({ error: "Akses ditolak: Anda hanya dapat mengakses siswa pada kelas yang Anda ampu" }, { status: 403 });
      }
    } else if (role === "ORANG_TUA") {
      if (student.parentId !== userId) {
        return NextResponse.json({ error: "Akses ditolak: Anda hanya dapat mengakses data anak Anda sendiri" }, { status: 403 });
      }
    }

    return NextResponse.json(student);
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal memuat data siswa" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    if (role !== "ADMIN" && role !== "GURU") {
      return NextResponse.json({ error: "Hanya Guru atau Admin yang dapat mengubah data siswa" }, { status: 403 });
    }

    const body = await req.json();
    const { name, nisn, disabilityType, jenjang, gender, parentId, classId } = body;

    const existing = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        classes: {
          include: {
            class: true,
          },
        },
      },
    });
    if (!existing) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
    }

    // Validate that GURU only updates their own students and assigns to their own classes
    if (role === "GURU") {
      const isEnrolledInTeacherClass = existing.classes.some((c) => c.class?.teacherId === userId);
      if (!isEnrolledInTeacherClass) {
        return NextResponse.json({ error: "Akses ditolak: Anda hanya dapat mengubah data siswa pada kelas yang Anda ampu" }, { status: 403 });
      }

      if (classId) {
        const targetClass = await prisma.class.findUnique({
          where: { id: classId },
        });
        if (!targetClass || targetClass.teacherId !== userId) {
          return NextResponse.json({ error: "Akses ditolak: Anda hanya dapat memindahkan siswa ke rombel kelas yang Anda ampu" }, { status: 403 });
        }
      }
    }

    // Update student data
    const updated = await prisma.student.update({
      where: { id: params.id },
      data: {
        name: name ? name.trim() : existing.name,
        nisn: nisn ? nisn.trim() : existing.nisn,
        disabilityType: disabilityType ? disabilityType.trim() : existing.disabilityType,
        jenjang: jenjang ? (jenjang as Jenjang) : existing.jenjang,
        gender: gender || existing.gender,
        parentId: parentId !== undefined ? (parentId || null) : existing.parentId,
      },
    });

    // Update class assignment if provided
    if (classId) {
      await prisma.classStudent.deleteMany({
        where: { studentId: params.id },
      });
      await prisma.classStudent.create({
        data: {
          studentId: params.id,
          classId: classId,
        },
      });
    }

    // Log Activity
    await logActivity({
      userId: (session.user as any).id,
      userName: session.user.name || "Guru/Admin",
      userRole: role,
      action: "UPDATE",
      entity: "Student",
      entityId: updated.id,
      description: `Memperbarui data siswa: ${updated.name} (${updated.nisn} - ${updated.disabilityType} - ${updated.jenjang})`,
      foundationId: updated.foundationId,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating student:", error);
    return NextResponse.json({ error: "Gagal memperbarui siswa: " + error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    if (role !== "ADMIN" && role !== "GURU") {
      return NextResponse.json({ error: "Hanya Guru atau Admin yang dapat menghapus data siswa" }, { status: 403 });
    }

    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        classes: {
          include: {
            class: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
    }

    if (role === "GURU") {
      const isEnrolledInTeacherClass = student.classes.some((c) => c.class?.teacherId === userId);
      if (!isEnrolledInTeacherClass) {
        return NextResponse.json({ error: "Akses ditolak: Anda hanya dapat menghapus data siswa pada kelas yang Anda ampu" }, { status: 403 });
      }
    }

    await prisma.student.delete({
      where: { id: params.id },
    });

    // Log Activity
    await logActivity({
      userId: (session.user as any).id,
      userName: session.user.name || "Guru/Admin",
      userRole: role,
      action: "DELETE",
      entity: "Student",
      entityId: params.id,
      description: `Menghapus data siswa: ${student.name} (NISN: ${student.nisn})`,
      foundationId: student.foundationId,
    });

    return NextResponse.json({ success: true, message: "Data siswa berhasil dihapus" });
  } catch (error: any) {
    console.error("Error deleting student:", error);
    return NextResponse.json({ error: "Gagal menghapus siswa: " + error.message }, { status: 500 });
  }
}
