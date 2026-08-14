import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/activityLog";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Akses ditolak: Anda belum terautentikasi" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const classId = searchParams.get("classId");

    const where: any = {};
    if (studentId) where.studentId = studentId;

    // Isolate data for teachers
    if (role === "GURU") {
      where.student = {
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
        classes: {
          some: {
            classId: classId,
          },
        },
      };
    }

    // Isolate data for parents
    if (role === "ORANG_TUA") {
      where.student = {
        parentId: userId,
      };
    }

    const journals = await prisma.dailyJournal.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            disabilityType: true,
            parentId: true,
            foundationId: true,
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
        date: "desc",
      },
    });

    return NextResponse.json(journals);
  } catch (error: any) {
    console.error("Error fetching journals:", error);
    return NextResponse.json({ error: "Gagal memuat buku penghubung" }, { status: 500 });
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
      return NextResponse.json({ error: "Akses ditolak: Hanya Guru atau Admin yang dapat menulis catatan buku penghubung" }, { status: 403 });
    }

    const body = await req.json();
    const { studentId, mood, healthCondition, eatingNote, learningActivity } = body;

    if (!studentId || !mood || !learningActivity) {
      return NextResponse.json({ error: "Siswa, suasana hati (mood), dan aktivitas wajib diisi" }, { status: 400 });
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
        return NextResponse.json({ error: "Akses ditolak: Anda hanya dapat menulis buku penghubung untuk siswa pada kelas yang Anda ampu" }, { status: 403 });
      }
    }

    const journal = await prisma.dailyJournal.create({
      data: {
        studentId,
        teacherId,
        mood: mood.trim(),
        healthCondition: healthCondition ? healthCondition.trim() : "Sehat bugar",
        eatingNote: eatingNote ? eatingNote.trim() : "Makan bekal habis mandiri",
        learningActivity: learningActivity.trim(),
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
      action: "JOURNAL",
      entity: "DailyJournal",
      entityId: journal.id,
      description: `Menulis catatan buku penghubung untuk ${journal.student.name} (Mood: ${journal.mood})`,
      foundationId: journal.student.foundationId,
    });

    return NextResponse.json(journal, { status: 201 });
  } catch (error: any) {
    console.error("Error creating journal:", error);
    return NextResponse.json({ error: "Gagal menyimpan catatan buku penghubung: " + error.message }, { status: 500 });
  }
}

// PATCH for Parent Feedback
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Akses ditolak: Anda belum terautentikasi" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    const body = await req.json();
    const { journalId, parentFeedback } = body;

    if (!journalId || !parentFeedback || !parentFeedback.trim()) {
      return NextResponse.json({ error: "ID jurnal dan respon orang tua wajib diisi" }, { status: 400 });
    }

    const journal = await prisma.dailyJournal.findUnique({
      where: { id: journalId },
      include: { student: true },
    });

    if (!journal) {
      return NextResponse.json({ error: "Catatan jurnal tidak ditemukan" }, { status: 404 });
    }

    // If role is ORANG_TUA, verify they are indeed the parent of this student
    if (role === "ORANG_TUA" && journal.student.parentId !== userId) {
      return NextResponse.json({ error: "Akses ditolak: Anda hanya dapat memberi tanggapan pada anak Anda sendiri" }, { status: 403 });
    }

    const updated = await prisma.dailyJournal.update({
      where: { id: journalId },
      data: { parentFeedback: parentFeedback.trim() },
    });

    // Log Activity
    await logActivity({
      userId: userId,
      userName: session.user.name || "Orang Tua",
      userRole: role,
      action: "UPDATE",
      entity: "DailyJournal",
      entityId: journalId,
      description: `Orang tua mengirim respon balasan pada buku penghubung ${journal.student.name}`,
      foundationId: journal.student.foundationId,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating parent feedback:", error);
    return NextResponse.json({ error: "Gagal menyimpan respon orang tua" }, { status: 500 });
  }
}
