import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Score } from "@prisma/client";
import { logActivity } from "@/lib/activityLog";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Akses ditolak: Anda belum terautentikasi" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const category = searchParams.get("category");

    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (category) where.category = category;

    // Data isolation for parents
    if (role === "ORANG_TUA") {
      where.student = {
        parentId: userId,
      };
    }

    const assessments = await prisma.assessment.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            nisn: true,
            gender: true,
            jenjang: true,
            disabilityType: true,
            parentId: true,
            foundation: {
              select: {
                name: true,
                code: true,
                address: true,
                phone: true,
              },
            },
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        assessmentDate: "desc",
      },
    });

    return NextResponse.json(assessments);
  } catch (error: any) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json({ error: "Gagal memuat data asesmen" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Akses ditolak: Anda belum terautentikasi" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "GURU" && role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak: Hanya Guru atau Admin yang dapat membuat asesmen" }, { status: 403 });
    }

    const body = await req.json();
    const { studentId, category, title, aspect, score, findings, recommendation } = body;

    if (!studentId || !category || !title || !aspect || !score || !findings) {
      return NextResponse.json({ error: "Semua kolom wajib diisi" }, { status: 400 });
    }

    if (!Object.values(Score).includes(score)) {
      return NextResponse.json({ error: "Nilai skor asesmen tidak valid" }, { status: 400 });
    }

    const teacherId = (session.user as any).id;

    const assessment = await prisma.assessment.create({
      data: {
        studentId,
        teacherId,
        category,
        title: title.trim(),
        aspect: aspect.trim(),
        score,
        findings: findings.trim(),
        recommendation: recommendation ? recommendation.trim() : null,
      },
      include: {
        student: true,
        teacher: true,
      },
    });

    // Log Activity
    await logActivity({
      userId: teacherId,
      userName: session.user.name || "Guru",
      userRole: role,
      action: "ASSESSMENT",
      entity: "Assessment",
      entityId: assessment.id,
      description: `Melakukan asesmen [${category} - ${assessment.aspect}] pada siswa ${assessment.student.name} dengan capaian ${score}`,
      foundationId: assessment.student.foundationId,
    });

    return NextResponse.json(assessment, { status: 201 });
  } catch (error: any) {
    console.error("Error creating assessment:", error);
    return NextResponse.json({ error: "Gagal menyimpan asesmen: " + error.message }, { status: 500 });
  }
}
