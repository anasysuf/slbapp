import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logActivity } from "@/lib/activityLog";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Akses ditolak: Anda belum terautentikasi" },
        { status: 401 }
      );
    }

    // Feature is temporarily disabled by request
    const IS_CHANGE_PASSWORD_ENABLED = false;
    if (!IS_CHANGE_PASSWORD_ENABLED) {
      return NextResponse.json(
        { error: "Fitur ganti kata sandi mandiri sedang dinonaktifkan sementara oleh administrator sistem." },
        { status: 403 }
      );
    }


    const userId = (session.user as any).id;

    const body = await req.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: "Kata sandi lama dan kata sandi baru wajib diisi" },
        { status: 400 }
      );
    }

    if (newPassword.trim().length < 6) {
      return NextResponse.json(
        { error: "Kata sandi baru minimal 6 karakter" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Akun pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Kata sandi lama yang Anda masukkan tidak sesuai" },
        { status: 400 }
      );
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword.trim(), 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    // Log Activity
    await logActivity({
      userId: user.id,
      userName: user.name || "User",
      userRole: user.role,
      action: "UPDATE",
      entity: "User",
      entityId: user.id,
      description: `Pengguna ${user.name || user.email} (${user.email} - ${user.role}) berhasil memperbarui kata sandi mandiri`,
      foundationId: user.foundationId,
    });


    return NextResponse.json({
      success: true,
      message: "Kata sandi Anda berhasil diperbarui.",
    });
  } catch (error: any) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui kata sandi: " + error.message },
      { status: 500 }
    );
  }
}
