import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/activityLog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const foundations = await prisma.foundation.findMany({
      include: {
        _count: {
          select: {
            students: true,
            classes: true,
            users: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(foundations);
  } catch (error: any) {
    console.error("Error fetching foundations:", error);
    return NextResponse.json({ error: "Gagal memuat data yayasan" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Akses ditolak: Belum terautentikasi" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak: Hanya Admin yang dapat mendaftarkan yayasan baru" }, { status: 403 });
    }

    const body = await req.json();
    const { name, code, address, phone } = body;

    if (!name || !code) {
      return NextResponse.json({ error: "Nama yayasan dan kode unik wajib diisi" }, { status: 400 });
    }

    const existing = await prisma.foundation.findUnique({
      where: { code: code.toUpperCase().trim() },
    });
    if (existing) {
      return NextResponse.json({ error: "Kode yayasan sudah terdaftar" }, { status: 400 });
    }

    const foundation = await prisma.foundation.create({
      data: {
        name: name.trim(),
        code: code.toUpperCase().trim(),
        address: address ? address.trim() : null,
        phone: phone ? phone.trim() : null,
      },
    });

    // Log Activity
    await logActivity({
      userId: (session.user as any).id,
      userName: session.user.name || "Admin",
      userRole: role,
      action: "CREATE",
      entity: "Foundation",
      entityId: foundation.id,
      description: `Mendaftarkan yayasan baru: ${foundation.name} (${foundation.code})`,
      foundationId: foundation.id,
    });

    return NextResponse.json(foundation, { status: 201 });
  } catch (error: any) {
    console.error("Error creating foundation:", error);
    return NextResponse.json({ error: "Gagal membuat yayasan: " + error.message }, { status: 500 });
  }
}
