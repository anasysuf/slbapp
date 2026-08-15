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
        evaluationGroups,
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
        prisma.ppiEvaluation.groupBy({
          by: ["score"],
          where: {
            ppiPlan: {
              student: teacherStudentWhere,
            },
          },
          _count: {
            score: true,
          },
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
          select: {
            id: true,
            name: true,
            jenjang: true,
            teacher: { select: { name: true } },
            _count: { select: { students: true } },
          },
        }),
      ]);

      const scoreMap: Record<string, number> = {};
      let totalEvaluations = 0;
      evaluationGroups.forEach((g) => {
        scoreMap[g.score] = g._count.score;
        totalEvaluations += g._count.score;
      });

      const scoreStats = {
        MANDIRI: scoreMap[Score.MANDIRI] || 0,
        DENGAN_BANTUAN: scoreMap[Score.DENGAN_BANTUAN] || 0,
        BELUM_MAMPU: scoreMap[Score.BELUM_MAMPU] || 0,
      };

      const totalEvals = totalEvaluations || 1;
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
      evaluationGroups,
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
      prisma.ppiEvaluation.groupBy({
        by: ["score"],
        where: foundationId
          ? {
              ppiPlan: {
                student: {
                  foundationId,
                },
              },
            }
          : {},
        _count: {
          score: true,
        },
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
        select: {
          id: true,
          name: true,
          jenjang: true,
          teacher: { select: { name: true } },
          _count: { select: { students: true } },
        },
      }),
    ]);

    const scoreMap: Record<string, number> = {};
    let totalEvaluations = 0;
    evaluationGroups.forEach((g) => {
      scoreMap[g.score] = g._count.score;
      totalEvaluations += g._count.score;
    });

    const scoreStats = {
      MANDIRI: scoreMap[Score.MANDIRI] || 0,
      DENGAN_BANTUAN: scoreMap[Score.DENGAN_BANTUAN] || 0,
      BELUM_MAMPU: scoreMap[Score.BELUM_MAMPU] || 0,
    };

    const totalEvals = totalEvaluations || 1;
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
