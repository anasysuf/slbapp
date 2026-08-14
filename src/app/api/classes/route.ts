import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Jenjang } from "@prisma/client";
import { logActivity } from "@/lib/activityLog";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const foundationId = (session?.user as any)?.foundationId;

    const { searchParams } = new URL(req.url);
    const jenjang = searchParams.get("jenjang");
    const teacherId = searchParams.get("teacherId");

    const where: any = {};
    if (jenjang && jenjang !== "SEMUA") where.jenjang = jenjang as Jenjang;
    if (teacherId) where.teacherId = teacherId;

    // Scope to Admin / User's Yayasan
    if (foundationId) {
      where.foundationId = foundationId;
    }

    const classes = await prisma.class.findMany({
      where,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        foundation: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        students: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                nisn: true,
                disabilityType: true,
                jenjang: true,
              },
            },
          },
        },
        _count: {
          select: {
            students: true,
            materials: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(classes);
  } catch (error: any) {
    console.error("Error fetching classes:", error);
    return NextResponse.json({ error: "Gagal memuat rombel kelas" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const foundationId = (session.user as any).foundationId;

    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Hanya Admin yang dapat membuat rombel kelas baru" }, { status: 403 });
    }

    const body = await req.json();
    const { name, jenjang, teacherId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nama kelas wajib diisi" }, { status: 400 });
    }

    const newClass = await prisma.class.create({
      data: {
        name: name.trim(),
        jenjang: jenjang ? (jenjang as Jenjang) : Jenjang.SDLB,
        teacherId: teacherId || null,
        foundationId: foundationId || null,
      },
      include: {
        teacher: true,
      },
    });

    // Log Activity
    await logActivity({
      userId: (session.user as any).id,
      userName: session.user.name || "Admin",
      userRole: role,
      action: "CREATE",
      entity: "Class",
      entityId: newClass.id,
      description: `Admin membuat rombel kelas baru: ${newClass.name} (Jenjang: ${newClass.jenjang})`,
      foundationId: newClass.foundationId,
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error: any) {
    console.error("Error creating class:", error);
    return NextResponse.json({ error: "Gagal membuat kelas: " + error.message }, { status: 500 });
  }
}
