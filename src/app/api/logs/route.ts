import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const foundationId = (session.user as any).foundationId;

    if (role !== "ADMIN" && role !== "YAYASAN") {
      return NextResponse.json({ error: "Akses ditolak: Hanya Admin dan Yayasan yang dapat melihat log aktivitas" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    const where: any = {};
    if (action && action !== "SEMUA") where.action = action;

    // Scope strictly to Admin's Foundation
    if (foundationId) {
      where.foundationId = foundationId;
    }

    const logs = await prisma.activityLog.findMany({
      where,
      include: {
        foundation: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    console.error("Error fetching logs:", error);
    return NextResponse.json({ error: "Gagal memuat log aktivitas" }, { status: 500 });
  }
}
