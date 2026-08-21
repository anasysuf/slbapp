import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/activityLog";

import { sanitizeString, sanitizeTextarea } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Akses ditolak: Belum terautentikasi" }, { status: 401 });
    }

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

    const cleanName = sanitizeString(name);
    const cleanCode = sanitizeString(code).toUpperCase();
    const cleanAddress = address ? sanitizeTextarea(address) : null;
    const cleanPhone = phone ? sanitizeString(phone) : null;

    if (!cleanName || !cleanCode) {
      return NextResponse.json({ error: "Nama yayasan dan kode unik wajib diisi" }, { status: 400 });
    }

    const existing = await prisma.foundation.findUnique({
      where: { code: cleanCode },
    });
    if (existing) {
      return NextResponse.json({ error: "Kode yayasan sudah terdaftar" }, { status: 400 });
    }

    const foundation = await prisma.foundation.create({
      data: {
        name: cleanName,
        code: cleanCode,
        address: cleanAddress,
        phone: cleanPhone,
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

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Akses ditolak: Belum terautentikasi" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak: Hanya Super Admin yang dapat mengubah identitas sekolah/yayasan" }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, code, address, phone, logo, academicYear, semester } = body;

    // Find the foundation to update (either by passed ID or user's foundationId or first foundation)
    let targetId = id || (session.user as any).foundationId;
    if (!targetId) {
      const firstFound = await prisma.foundation.findFirst();
      targetId = firstFound?.id;
    }

    if (!targetId) {
      return NextResponse.json({ error: "Data lembaga/sekolah tidak ditemukan" }, { status: 404 });
    }

    const cleanName = name ? sanitizeString(name) : undefined;
    const cleanCode = code ? sanitizeString(code).toUpperCase() : undefined;
    const cleanAddress = address !== undefined ? (address ? sanitizeTextarea(address) : null) : undefined;
    const cleanPhone = phone !== undefined ? (phone ? sanitizeString(phone) : null) : undefined;
    const cleanLogo = logo !== undefined ? (logo ? sanitizeString(logo) : null) : undefined;
    const cleanAcademicYear = academicYear !== undefined ? (academicYear ? sanitizeString(academicYear) : null) : undefined;
    const cleanSemester = semester !== undefined ? (semester ? sanitizeString(semester) : null) : undefined;

    const updated = await prisma.foundation.update({
      where: { id: targetId },
      data: {
        name: cleanName,
        code: cleanCode,
        address: cleanAddress,
        phone: cleanPhone,
        logo: cleanLogo,
        academicYear: cleanAcademicYear,
        semester: cleanSemester,
      },
    });

    // Log Activity
    await logActivity({
      userId: (session.user as any).id,
      userName: session.user.name || "Super Admin",
      userRole: role,
      action: "UPDATE",
      entity: "Foundation",
      entityId: updated.id,
      description: `Super Admin memperbarui identitas & profil sekolah/yayasan: ${updated.name}`,
      foundationId: updated.id,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating foundation:", error);
    return NextResponse.json({ error: "Gagal memperbarui data sekolah: " + error.message }, { status: 500 });
  }
}
