import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { logActivity } from "@/lib/activityLog";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
    }

    const currentRole = (session.user as any).role;
    if (currentRole !== "ADMIN" && currentRole !== "YAYASAN") {
      return NextResponse.json({ error: "Hanya Admin dan Pengurus Yayasan yang berwenang mengubah akun pengguna" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, role, phone, password, foundationId } = body;

    const existing = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    // Kebijakan Khusus Yayasan: Hanya boleh edit profil Guru, dan TIDAK BOLEH ubah password
    if (currentRole === "YAYASAN") {
      if (existing.role !== "GURU") {
        return NextResponse.json({ error: "Yayasan hanya memiliki wewenang untuk mengedit data profil Guru" }, { status: 403 });
      }
      if (password && password.trim().length > 0) {
        return NextResponse.json({ error: "Yayasan tidak memiliki hak akses untuk merubah kata sandi Guru. Perubahan kata sandi harus melalui Admin." }, { status: 403 });
      }
    }

    const updateData: any = {
      name: name ? name.trim() : existing.name,
      email: email ? email.toLowerCase().trim() : existing.email,
      role: currentRole === "ADMIN" && role ? (role as Role) : existing.role,
      phone: phone !== undefined ? phone : existing.phone,
      foundationId: foundationId !== undefined ? (foundationId || null) : existing.foundationId,
    };

    // Hanya Admin yang bisa mengubah password
    if (currentRole === "ADMIN" && password && password.trim().length > 0) {
      updateData.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
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
      userName: session.user.name || (currentRole === "YAYASAN" ? "Yayasan" : "Admin"),
      userRole: currentRole,
      action: "UPDATE",
      entity: "User",
      entityId: updated.id,
      description: `${currentRole === "YAYASAN" ? "Yayasan" : "Admin"} memperbarui data akun guru: ${updated.name} (${updated.email})`,
      foundationId: updated.foundationId,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Gagal memperbarui pengguna: " + error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
    }

    const currentRole = (session.user as any).role;
    if (currentRole !== "ADMIN") {
      return NextResponse.json({ error: "Hanya Admin yang berwenang menghapus akun pengguna" }, { status: 403 });
    }

    // Prevent admin from deleting themselves
    if (params.id === (session.user as any).id) {
      return NextResponse.json({ error: "Anda tidak dapat menghapus akun Anda sendiri" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id: params.id },
    });

    // Log Activity
    await logActivity({
      userId: (session.user as any).id,
      userName: session.user.name || "Admin",
      userRole: currentRole,
      action: "DELETE",
      entity: "User",
      entityId: params.id,
      description: `Menghapus akun pengguna: ${user.name} (${user.email})`,
      foundationId: user.foundationId,
    });

    return NextResponse.json({ success: true, message: "Pengguna berhasil dihapus" });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Gagal menghapus pengguna: " + error.message }, { status: 500 });
  }
}
