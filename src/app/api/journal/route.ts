import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/activityLog";
import { createNotification } from "@/lib/notifications";

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
            parent: {
              select: {
                id: true,
                name: true,
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
        author: {
          select: {
            id: true,
            name: true,
            role: true,
            avatar: true,
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
    const userId = (session.user as any).id;
    const authorName = session.user.name || (role === "ORANG_TUA" ? "Orang Tua" : role === "ADMIN" ? "Administrator" : "Guru");

    if (role !== "GURU" && role !== "ADMIN" && role !== "ORANG_TUA") {
      return NextResponse.json({ error: "Akses ditolak: Anda tidak memiliki izin untuk menulis catatan buku penghubung" }, { status: 403 });
    }

    const body = await req.json();
    const { studentId, mood, healthCondition, eatingNote, learningActivity, photoUrl, parentFeedback } = body;

    if (!studentId || !mood || (!learningActivity && !parentFeedback)) {
      return NextResponse.json({ error: "Siswa, suasana hati (mood), dan catatan aktivitas/kabar wajib diisi" }, { status: 400 });
    }

    let finalTeacherId = userId;

    if (role === "GURU") {
      const studentInClass = await prisma.student.findFirst({
        where: {
          id: studentId,
          classes: {
            some: {
              class: {
                teacherId: userId,
              },
            },
          },
        },
      });
      if (!studentInClass) {
        return NextResponse.json({ error: "Akses ditolak: Anda hanya dapat menulis buku penghubung untuk siswa pada kelas yang Anda ampu" }, { status: 403 });
      }
    } else if (role === "ORANG_TUA") {
      const parentStudent = await prisma.student.findFirst({
        where: {
          id: studentId,
          parentId: userId,
        },
        include: {
          classes: {
            include: {
              class: {
                select: { teacherId: true },
              },
            },
          },
        },
      });

      if (!parentStudent) {
        return NextResponse.json({ error: "Akses ditolak: Anda hanya dapat menulis catatan untuk anak Anda sendiri" }, { status: 403 });
      }

      // Find assigned class teacher or fallback to any teacher
      const classTeacher = parentStudent.classes?.[0]?.class?.teacherId;
      if (classTeacher) {
        finalTeacherId = classTeacher;
      } else {
        const fallbackTeacher = await prisma.user.findFirst({
          where: { role: "GURU", foundationId: parentStudent.foundationId },
        });
        finalTeacherId = fallbackTeacher?.id || userId;
      }
    }

    const journal = await prisma.dailyJournal.create({
      data: {
        studentId,
        teacherId: finalTeacherId,
        authorId: userId,
        authorName: authorName,
        authorRole: role,
        mood: mood.trim(),
        healthCondition: healthCondition ? healthCondition.trim() : "Sehat bugar",
        eatingNote: eatingNote ? eatingNote.trim() : "Makan mandiri",
        learningActivity: learningActivity ? learningActivity.trim() : `Kabar dan catatan aktivitas harian dari rumah oleh ${authorName}`,
        photoUrl: photoUrl ? photoUrl.trim() : null,
        parentFeedback: parentFeedback ? parentFeedback.trim() : (role === "ORANG_TUA" ? (learningActivity || "Kabar dari rumah telah dikirim.") : null),
      },
      include: {
        student: true,
        teacher: true,
        author: true,
      },
    });


    // Log Activity
    await logActivity({
      userId: userId,
      userName: session.user.name || (role === "ORANG_TUA" ? "Orang Tua" : "Guru"),
      userRole: role,
      action: "JOURNAL",
      entity: "DailyJournal",
      entityId: journal.id,
      description: `${role === "ORANG_TUA" ? "Orang tua" : "Guru"} menulis catatan buku penghubung untuk ${journal.student.name} (Mood: ${journal.mood})`,
      foundationId: journal.student.foundationId,
    });

    // Automatic Notifications
    if (role === "GURU" || role === "ADMIN") {
      // Notify the parent
      if (journal.student?.parentId) {
        await createNotification({
          userId: journal.student.parentId,
          title: `Kabar Sekolah Ananda: ${journal.student.name}`,
          message: `Guru ${session.user.name || "Wali Kelas"} telah mencatat aktivitas harian & terapi ananda (Mood: ${journal.mood}).`,
          type: "JOURNAL",
          link: "/ortu",
        });
      }
    } else if (role === "ORANG_TUA") {
      // Notify the teacher
      if (journal.teacherId) {
        await createNotification({
          userId: journal.teacherId,
          title: `Catatan Rumah: ${journal.student.name}`,
          message: `Ayah/Bunda ${session.user.name || "Orang Tua"} mengirim kabar kondisi ananda dari rumah (Mood: ${journal.mood}).`,
          type: "FEEDBACK",
          link: "/guru/jurnal",
        });
      }
    }

    return NextResponse.json(journal, { status: 201 });
  } catch (error: any) {
    console.error("Error creating journal:", error);
    return NextResponse.json({ error: "Gagal menyimpan catatan buku penghubung: " + error.message }, { status: 500 });
  }
}

// PATCH for Parent Feedback / Editing Notes
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Akses ditolak: Anda belum terautentikasi" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    const body = await req.json();
    const { journalId, parentFeedback, mood, healthCondition, eatingNote, learningActivity } = body;

    if (!journalId) {
      return NextResponse.json({ error: "ID jurnal wajib diisi" }, { status: 400 });
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

    const updateData: any = {};
    if (parentFeedback !== undefined) updateData.parentFeedback = parentFeedback.trim();
    if (mood !== undefined) updateData.mood = mood.trim();
    if (healthCondition !== undefined) updateData.healthCondition = healthCondition.trim();
    if (eatingNote !== undefined) updateData.eatingNote = eatingNote.trim();
    if (learningActivity !== undefined && (role === "GURU" || role === "ADMIN")) {
      updateData.learningActivity = learningActivity.trim();
    }

    const updated = await prisma.dailyJournal.update({
      where: { id: journalId },
      data: updateData,
    });

    // Log Activity
    await logActivity({
      userId: userId,
      userName: session.user.name || "Pengguna",
      userRole: role,
      action: "UPDATE",
      entity: "DailyJournal",
      entityId: journalId,
      description: `Memperbarui catatan buku penghubung ${journal.student.name}`,
      foundationId: journal.student.foundationId,
    });

    // If parent updated feedback, notify teacher
    if (role === "ORANG_TUA" && journal.teacherId && parentFeedback) {
      await createNotification({
        userId: journal.teacherId,
        title: `Respon Orang Tua: ${journal.student.name}`,
        message: `Ayah/Bunda ${session.user.name || "Orang Tua"} telah merespon catatan buku penghubung.`,
        type: "FEEDBACK",
        link: "/guru/jurnal",
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating parent feedback:", error);
    return NextResponse.json({ error: "Gagal menyimpan respon orang tua: " + error.message }, { status: 500 });
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

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID catatan jurnal wajib disertakan" }, { status: 400 });
    }

    const journal = await prisma.dailyJournal.findUnique({
      where: { id },
      include: { student: true },
    });

    if (!journal) {
      return NextResponse.json({ error: "Catatan jurnal tidak ditemukan" }, { status: 404 });
    }

    // Authorization: GURU can only delete journals of their students or they authored, ORANG_TUA can only delete journals they authored, ADMIN can delete any
    if (role === "GURU") {
      const isAuthor = journal.authorId === userId || journal.teacherId === userId;
      if (!isAuthor) {
        return NextResponse.json({ error: "Akses ditolak: Anda hanya dapat menghapus catatan jurnal kelas Anda" }, { status: 403 });
      }
    } else if (role === "ORANG_TUA") {
      const isAuthor = journal.authorId === userId;
      if (!isAuthor) {
        return NextResponse.json({ error: "Akses ditolak: Anda hanya dapat menghapus catatan yang Anda buat sendiri" }, { status: 403 });
      }
    } else if (role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    await prisma.dailyJournal.delete({
      where: { id },
    });

    // Log Activity
    await logActivity({
      userId: userId,
      userName: session.user.name || "Pengguna",
      userRole: role,
      action: "DELETE",
      entity: "DailyJournal",
      entityId: id,
      description: `Menghapus catatan buku penghubung siswa ${journal.student.name}`,
      foundationId: journal.student.foundationId,
    });

    return NextResponse.json({ success: true, message: "Catatan jurnal berhasil dihapus" });
  } catch (error: any) {
    console.error("Error deleting journal:", error);
    return NextResponse.json({ error: "Gagal menghapus catatan jurnal: " + error.message }, { status: 500 });
  }
}


