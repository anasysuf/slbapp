import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

import { sanitizeString, sanitizeTextarea } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Akses ditolak: Anda belum terautentikasi" }, { status: 401 });
    }

    const subjects = await prisma.subject.findMany({
      include: {
        _count: {
          select: {
            materials: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(subjects);
  } catch (error: any) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json({ error: "Gagal memuat mata pelajaran" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Hanya Admin yang dapat menambahkan mata pelajaran" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description } = body;

    const cleanName = sanitizeString(name);
    const cleanDesc = description ? sanitizeTextarea(description) : null;

    if (!cleanName) {
      return NextResponse.json({ error: "Nama mata pelajaran wajib diisi" }, { status: 400 });
    }

    const subject = await prisma.subject.create({
      data: {
        name: cleanName,
        description: cleanDesc,
      },
    });

    return NextResponse.json(subject, { status: 201 });
  } catch (error: any) {
    console.error("Error creating subject:", error);
    return NextResponse.json({ error: "Gagal membuat mata pelajaran: " + error.message }, { status: 500 });
  }
}
