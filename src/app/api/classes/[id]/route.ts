import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Jenjang } from "@prisma/client";
import { logActivity } from "@/lib/activityLog";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Hanya Admin yang dapat mengubah rombel kelas" }, { status: 403 });
    }

    const body = await req.json();
    const { name, jenjang, teacherId, foundationId } = body;

    const existing = await prisma.class.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
    }

    const updated = await prisma.class.update({
      where: { id: params.id },
      data: {
        name: name ? name.trim() : existing.name,
        jenjang: jenjang ? (jenjang as Jenjang) : existing.jenjang,
        teacherId: teacherId !== undefined ? (teacherId || null) : existing.teacherId,
        foundationId: foundationId !== undefined ? (foundationId || null) : existing.foundationId,
      },
    });

    // Log Activity
    await logActivity({
      userId: (session.user as any).id,
      userName: session.user.name || "Admin",
      userRole: role,
      action: "UPDATE",
      entity: "Class",
      entityId: updated.id,
      description: `Memperbarui data kelas: ${updated.name} (Jenjang: ${updated.jenjang})`,
      foundationId: updated.foundationId,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating class:", error);
    return NextResponse.json({ error: "Gagal memperbarui kelas: " + error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Hanya Admin yang dapat menghapus rombel kelas" }, { status: 403 });
    }

    const existingClass = await prisma.class.findUnique({
      where: { id: params.id },
    });

    if (!existingClass) {
      return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
    }

    await prisma.class.delete({
      where: { id: params.id },
    });

    // Log Activity
    await logActivity({
      userId: (session.user as any).id,
      userName: session.user.name || "Admin",
      userRole: role,
      action: "DELETE",
      entity: "Class",
      entityId: params.id,
      description: `Menghapus rombel kelas: ${existingClass.name}`,
      foundationId: existingClass.foundationId,
    });

    return NextResponse.json({ success: true, message: "Kelas berhasil dihapus" });
  } catch (error: any) {
    console.error("Error deleting class:", error);
    return NextResponse.json({ error: "Gagal menghapus kelas: " + error.message }, { status: 500 });
  }
}
