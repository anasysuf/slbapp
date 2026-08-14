import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Akses ditolak: Silakan masuk terlebih dahulu" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const userId = (session.user as any).id;
    const foundationId = (session.user as any).foundationId;

    const { searchParams } = new URL(req.url);
    const academicYear = searchParams.get("academicYear") || "2026/2027";
    const semester = searchParams.get("semester") || "Ganjil";
    const requestedClassId = searchParams.get("classId");

    // Fetch active foundation info for Kop Surat & default periods
    const foundation = await prisma.foundation.findFirst({
      where: foundationId ? { id: foundationId } : undefined,
    });

    let targetClassIds: string[] = [];

    if (role === "GURU") {
      const teacherClass = await prisma.class.findFirst({
        where: { teacherId: userId },
      });
      if (teacherClass) {
        targetClassIds = [teacherClass.id];
      }
    } else if (requestedClassId && requestedClassId !== "SEMUA") {
      targetClassIds = [requestedClassId];
    }

    // Build student query condition
    const studentWhere: any = {};
    if (role === "ORANG_TUA") {
      studentWhere.parentId = userId;
    } else if (targetClassIds.length > 0) {
      studentWhere.classes = {
        some: {
          classId: { in: targetClassIds },
        },
      };
    }

    // Fetch students with all assessments, PPI plans, and journals in the given period
    const students = await prisma.student.findMany({
      where: studentWhere,
      include: {
        parent: {
          select: { id: true, name: true, phone: true, email: true },
        },
        classes: {
          include: {
            class: {
              include: {
                teacher: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
          },
        },
        assessments: {
          where: {
            academicYear: academicYear,
            semester: semester,
          },
          orderBy: { createdAt: "desc" },
        },
        ppiPlans: {
          where: {
            academicYear: academicYear,
            ...(semester ? { semester: semester } : {}),
          },
          include: {
            evaluations: {
              orderBy: { evaluationDate: "desc" },
            },
          },
        },
        dailyJournals: {
          where: {
            academicYear: academicYear,
            semester: semester,
          },
          orderBy: { date: "desc" },
        },
      },
      orderBy: { name: "asc" },
    });

    // Compute student recap analytics
    let totalMandiriCount = 0;
    let totalBantuanCount = 0;
    let totalBelumMampuCount = 0;
    let totalAssessmentsCount = 0;
    let totalEvaluationsCount = 0;

    const studentRecapList = students.map((s) => {
      const assessments = s.assessments || [];
      const ppiPlans = s.ppiPlans || [];
      const journals = s.dailyJournals || [];

      // Collect all evaluations across PPI plans in this semester
      const allEvaluations = ppiPlans.flatMap((p) => p.evaluations || []);

      const mandiriAssessments = assessments.filter((a) => a.score === "MANDIRI").length;
      const bantuanAssessments = assessments.filter((a) => a.score === "DENGAN_BANTUAN").length;
      const belumMampuAssessments = assessments.filter((a) => a.score === "BELUM_MAMPU").length;

      const mandiriEvaluations = allEvaluations.filter((e) => e.score === "MANDIRI").length;
      const bantuanEvaluations = allEvaluations.filter((e) => e.score === "DENGAN_BANTUAN").length;
      const belumMampuEvaluations = allEvaluations.filter((e) => e.score === "BELUM_MAMPU").length;

      const totalStudentScores = assessments.length + allEvaluations.length;
      const studentMandiriTotal = mandiriAssessments + mandiriEvaluations;
      const studentBantuanTotal = bantuanAssessments + bantuanEvaluations;
      const studentBelumTotal = belumMampuAssessments + belumMampuEvaluations;

      totalMandiriCount += studentMandiriTotal;
      totalBantuanCount += studentBantuanTotal;
      totalBelumMampuCount += studentBelumTotal;
      totalAssessmentsCount += assessments.length;
      totalEvaluationsCount += allEvaluations.length;

      const independenceRate =
        totalStudentScores > 0 ? Math.round((studentMandiriTotal / totalStudentScores) * 100) : 0;

      // Primary class info
      const studentClass = s.classes?.[0]?.class;

      // Most frequent journal mood
      const moodCounts: { [key: string]: number } = {};
      journals.forEach((j) => {
        if (j.mood) {
          moodCounts[j.mood] = (moodCounts[j.mood] || 0) + 1;
        }
      });
      const topMood = Object.keys(moodCounts).sort((a, b) => moodCounts[b] - moodCounts[a])[0] || "Belum ada catatan";

      return {
        id: s.id,
        name: s.name,
        nisn: s.nisn,
        gender: s.gender,
        disabilityType: s.disabilityType,
        jenjang: s.jenjang,
        parentName: s.parent?.name || "Belum ditautkan",
        parentPhone: s.parent?.phone || "-",
        className: studentClass?.name || "Belum ada rombel",
        classTeacherName: studentClass?.teacher?.name || "-",
        assessmentsCount: assessments.length,
        evaluationsCount: allEvaluations.length,
        ppiPlansCount: ppiPlans.length,
        journalsCount: journals.length,
        feedbackReceivedCount: journals.filter((j) => j.parentFeedback).length,
        scores: {
          mandiri: studentMandiriTotal,
          denganBantuan: studentBantuanTotal,
          belumMampu: studentBelumTotal,
          total: totalStudentScores,
        },
        independenceRate,
        topMood,
        activePpi: ppiPlans[0] || null,
        recentAssessments: assessments.slice(0, 3),
        recentEvaluations: allEvaluations.slice(0, 3),
      };
    });

    const totalOverallScores = totalMandiriCount + totalBantuanCount + totalBelumMampuCount;
    const overallIndependenceRate =
      totalOverallScores > 0 ? Math.round((totalMandiriCount / totalOverallScores) * 100) : 0;

    // Available academic years and semesters in system
    const availableAcademicYears = ["2026/2027", "2025/2026", "2024/2025"];
    const availableSemesters = ["Ganjil", "Genap"];

    // Fetch classes for filter dropdown (if Admin / Yayasan)
    const allClasses =
      role === "ADMIN" || role === "YAYASAN"
        ? await prisma.class.findMany({
            select: { id: true, name: true, jenjang: true, teacher: { select: { name: true } } },
            orderBy: { name: "asc" },
          })
        : [];

    return NextResponse.json({
      period: {
        academicYear,
        semester,
      },
      foundation: {
        id: foundation?.id,
        name: foundation?.name || "Sekolah Luar Biasa",
        code: foundation?.code || "NPSN",
        address: foundation?.address || "",
        phone: foundation?.phone || "",
        logo: foundation?.logo || "🏫",
      },
      summary: {
        totalStudents: students.length,
        totalAssessments: totalAssessmentsCount,
        totalEvaluations: totalEvaluationsCount,
        mandiriCount: totalMandiriCount,
        denganBantuanCount: totalBantuanCount,
        belumMampuCount: totalBelumMampuCount,
        totalScores: totalOverallScores,
        overallIndependenceRate,
      },
      students: studentRecapList,
      availableAcademicYears,
      availableSemesters,
      classes: allClasses,
    });
  } catch (error: any) {
    console.error("Error generating semester recap:", error);
    return NextResponse.json({ error: "Gagal menyusun rekapitulasi semester: " + error.message }, { status: 500 });
  }
}
