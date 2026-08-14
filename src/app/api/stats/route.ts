import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Role, Score } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Akses ditolak: Anda belum terautentikasi" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const userId = (session.user as any).id;
    const foundationId = (session.user as any).foundationId;

    if (role !== "YAYASAN" && role !== "ADMIN" && role !== "GURU") {
      return NextResponse.json({ error: "Akses ditolak: Anda tidak memiliki wewenang melihat statistik agregat" }, { status: 403 });
    }

    if (role === "GURU") {
      const teacherStudentWhere = {
        classes: {
          some: {
            class: {
              teacherId: userId,
            },
          },
        },
      };

      const [
        totalStudents,
        totalClasses,
        totalPpiPlans,
        totalAssessments,
        evaluations,
        studentsByDisability,
        classes,
      ] = await Promise.all([
        prisma.student.count({ where: teacherStudentWhere }),
        prisma.class.count({ where: { teacherId: userId } }),
        prisma.ppiPlan.count({
          where: {
            student: teacherStudentWhere,
          },
        }),
        prisma.assessment.count({
          where: {
            student: teacherStudentWhere,
          },
        }),
        prisma.ppiEvaluation.findMany({
          where: {
            ppiPlan: {
              student: teacherStudentWhere,
            },
          },
          select: { score: true },
        }),
        prisma.student.groupBy({
          by: ["disabilityType"],
          where: teacherStudentWhere,
          _count: {
            id: true,
          },
        }),
        prisma.class.findMany({
          where: { teacherId: userId },
          include: {
            teacher: { select: { name: true } },
            _count: { select: { students: true } },
          },
        }),
      ]);

      const scoreStats = {
        MANDIRI: evaluations.filter((e) => e.score === Score.MANDIRI).length,
        DENGAN_BANTUAN: evaluations.filter((e) => e.score === Score.DENGAN_BANTUAN).length,
        BELUM_MAMPU: evaluations.filter((e) => e.score === Score.BELUM_MAMPU).length,
      };

      const totalEvals = evaluations.length || 1;
      const independenceRate = Math.round((scoreStats.MANDIRI / totalEvals) * 100);

      return NextResponse.json({
        totalStudents,
        totalTeachers: 1,
        totalClasses,
        totalPpiPlans,
        totalAssessments,
        independenceRate,
        scoreStats,
        studentsByDisability,
        classes,
      });
    }

    const whereFoundation: any = foundationId ? { foundationId } : {};

    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      totalPpiPlans,
      totalAssessments,
      evaluations,
      studentsByDisability,
      classes,
    ] = await Promise.all([
      prisma.student.count({ where: whereFoundation }),
      prisma.user.count({ where: { role: Role.GURU, ...whereFoundation } }),
      prisma.class.count({ where: whereFoundation }),
      prisma.ppiPlan.count({
        where: foundationId
          ? {
              student: {
                foundationId,
              },
            }
          : {},
      }),
      prisma.assessment.count({
        where: foundationId
          ? {
              student: {
                foundationId,
              },
            }
          : {},
      }),
      prisma.ppiEvaluation.findMany({
        where: foundationId
          ? {
              ppiPlan: {
                student: {
                  foundationId,
                },
              },
            }
          : {},
        select: { score: true },
      }),
      prisma.student.groupBy({
        by: ["disabilityType"],
        where: whereFoundation,
        _count: {
          id: true,
        },
      }),
      prisma.class.findMany({
        where: whereFoundation,
        include: {
          teacher: { select: { name: true } },
          _count: { select: { students: true } },
        },
      }),
    ]);

    // Calculate score distribution
    const scoreStats = {
      MANDIRI: evaluations.filter((e) => e.score === Score.MANDIRI).length,
      DENGAN_BANTUAN: evaluations.filter((e) => e.score === Score.DENGAN_BANTUAN).length,
      BELUM_MAMPU: evaluations.filter((e) => e.score === Score.BELUM_MAMPU).length,
    };

    const totalEvals = evaluations.length || 1;
    const independenceRate = Math.round((scoreStats.MANDIRI / totalEvals) * 100);

    return NextResponse.json({
      totalStudents,
      totalTeachers,
      totalClasses,
      totalPpiPlans,
      totalAssessments,
      independenceRate,
      scoreStats,
      studentsByDisability,
      classes,
    });
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Gagal memuat statistik sistem" }, { status: 500 });
  }
}
