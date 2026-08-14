import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Akses ditolak: Anda belum terautentikasi" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    const where: any = {};
    if (classId) where.classId = classId;

    const materials = await prisma.material.findMany({
      where,
      include: {
        class: true,
        subject: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        assignments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(materials);
  } catch (error: any) {
    console.error("Error fetching materials:", error);
    return NextResponse.json({ error: "Gagal memuat materi pembelajaran" }, { status: 500 });
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
      return NextResponse.json({ error: "Akses ditolak: Hanya Guru atau Admin yang dapat mengunggah materi" }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, classId, subjectId, attachmentUrl, assignmentInstructions, assignmentDeadline } = body;

    if (!title || !content || !classId || !subjectId) {
      return NextResponse.json({ error: "Judul, isi, kelas, dan mapel wajib diisi" }, { status: 400 });
    }

    const teacherId = (session.user as any).id;

    const material = await prisma.material.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        classId,
        subjectId,
        createdById: teacherId,
        attachmentUrl: attachmentUrl || null,
        assignments: assignmentInstructions
          ? {
              create: {
                instructions: assignmentInstructions.trim(),
                deadline: assignmentDeadline ? new Date(assignmentDeadline) : null,
              },
            }
          : undefined,
      },
      include: {
        assignments: true,
      },
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error: any) {
    console.error("Error creating material:", error);
    return NextResponse.json({ error: "Gagal membuat materi pembelajaran: " + error.message }, { status: 500 });
  }
}
