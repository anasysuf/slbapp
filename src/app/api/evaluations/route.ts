import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Score } from "@prisma/client";
import { logActivity } from "@/lib/activityLog";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Akses ditolak: Anda belum terautentikasi" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "GURU" && role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak: Hanya Guru atau Admin yang dapat mengisi evaluasi" }, { status: 403 });
    }

    const body = await req.json();
    const { ppiPlanId, score, narrativeNotes, evaluationDate } = body;

    if (!ppiPlanId || !score) {
      return NextResponse.json({ error: "Target PPI dan Skor wajib diisi" }, { status: 400 });
    }

    if (!Object.values(Score).includes(score)) {
      return NextResponse.json({ error: "Skor evaluasi tidak valid" }, { status: 400 });
    }

    const evaluation = await prisma.ppiEvaluation.create({
      data: {
        ppiPlanId,
        score,
        narrativeNotes: narrativeNotes ? narrativeNotes.trim() : null,
        evaluationDate: evaluationDate ? new Date(evaluationDate) : new Date(),
      },
      include: {
        ppiPlan: {
          include: {
            student: true,
          },
        },
      },
    });

    // Log Activity
    await logActivity({
      userId: (session.user as any).id,
      userName: session.user.name || "Guru",
      userRole: role,
      action: "EVALUATION",
      entity: "PpiEvaluation",
      entityId: evaluation.id,
      description: `Mencatat evaluasi skor harian [${score}] untuk target PPI ${evaluation.ppiPlan.student.name}`,
      foundationId: evaluation.ppiPlan.student.foundationId,
    });

    return NextResponse.json(evaluation, { status: 201 });
  } catch (error: any) {
    console.error("Error creating evaluation:", error);
    return NextResponse.json({ error: "Gagal menyimpan evaluasi: " + error.message }, { status: 500 });
  }
}
