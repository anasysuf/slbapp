import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { logActivity } from "@/lib/activityLog";

import { sanitizeString } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const foundationId = (session.user as any).foundationId;

    if (role !== "ADMIN" && role !== "YAYASAN" && role !== "GURU") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const filterRole = searchParams.get("role");

    const where: any = {};
    if (filterRole && filterRole !== "SEMUA") {
      where.role = filterRole as Role;
    }

    // 1 Yayasan = 1 Admin: Scope queries strictly to the admin's yayasan
    if (foundationId) {
      where.foundationId = foundationId;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        foundationId: true,
        foundation: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        classesTaught: {
          select: {
            id: true,
            name: true,
            jenjang: true,
            _count: {
              select: {
                students: true,
              },
            },
          },
        },
        students: {
          select: {
            id: true,
            name: true,
            nisn: true,
            disabilityType: true,
            jenjang: true,
          },
        },
        createdAt: true,
        _count: {
          select: {
            students: true,
            classesTaught: true,
            assessments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Gagal memuat pengguna" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
    }

    const currentRole = (session.user as any).role;
    const adminFoundationId = (session.user as any).foundationId;

    if (currentRole !== "ADMIN") {
      return NextResponse.json({ error: "Hanya Admin Yayasan yang berwenang menambah pengguna" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, role, phone } = body;

    const cleanName = sanitizeString(name);
    const cleanEmail = email ? email.toLowerCase().trim() : "";
    const cleanPhone = phone ? sanitizeString(phone) : null;

    if (!cleanName || !cleanEmail || !password || !role) {
      return NextResponse.json({ error: "Nama, email, kata sandi, dan role wajib diisi" }, { status: 400 });
    }

    if (password.trim().length < 6) {
      return NextResponse.json({ error: "Kata sandi minimal 6 karakter" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existing) {
      return NextResponse.json({ error: "Email sudah digunakan oleh akun lain" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password.trim(), 10);

    const user = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        passwordHash,
        role: role as Role,
        phone: cleanPhone,
        foundationId: adminFoundationId || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        foundationId: true,
      },
    });

    // Log Activity
    await logActivity({
      userId: (session.user as any).id,
      userName: session.user.name || "Admin Yayasan",
      userRole: currentRole,
      action: "CREATE",
      entity: "User",
      entityId: user.id,
      description: `Admin Yayasan membuat akun pengguna: ${user.name} (${user.email} - Role: ${user.role})`,
      foundationId: adminFoundationId,
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Gagal membuat pengguna: " + error.message }, { status: 500 });
  }
}
