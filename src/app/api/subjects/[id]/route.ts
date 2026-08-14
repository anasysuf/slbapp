import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
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
      return NextResponse.json({ error: "Hanya Admin yang dapat mengubah mata pelajaran" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description } = body;

    const existing = await prisma.subject.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Mata pelajaran tidak ditemukan" }, { status: 404 });
    }

    const updated = await prisma.subject.update({
      where: { id: params.id },
      data: {
        name: name ? name.trim() : existing.name,
        description: description !== undefined ? (description ? description.trim() : null) : existing.description,
      },
    });

    await logActivity({
      userId: (session.user as any).id,
      userName: session.user.name || "Admin",
      userRole: role,
      action: "UPDATE",
      entity: "Subject",
      entityId: updated.id,
      description: `Memperbarui mata pelajaran: ${updated.name}`,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating subject:", error);
    return NextResponse.json({ error: "Gagal memperbarui mata pelajaran: " + error.message }, { status: 500 });
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
      return NextResponse.json({ error: "Hanya Admin yang dapat menghapus mata pelajaran" }, { status: 403 });
    }

    const existing = await prisma.subject.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Mata pelajaran tidak ditemukan" }, { status: 404 });
    }

    await prisma.subject.delete({
      where: { id: params.id },
    });

    await logActivity({
      userId: (session.user as any).id,
      userName: session.user.name || "Admin",
      userRole: role,
      action: "DELETE",
      entity: "Subject",
      entityId: params.id,
      description: `Menghapus mata pelajaran: ${existing.name}`,
    });

    return NextResponse.json({ success: true, message: "Mata pelajaran berhasil dihapus" });
  } catch (error: any) {
    console.error("Error deleting subject:", error);
    return NextResponse.json({ error: "Gagal menghapus mata pelajaran: " + error.message }, { status: 500 });
  }
}
