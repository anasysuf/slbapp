import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const foundationId = (session.user as any).foundationId;
    const role = (session.user as any).role;

    if (role !== "ADMIN" && role !== "YAYASAN") {
      return NextResponse.json(
        { error: "Akses ditolak: Hanya Admin dan Yayasan yang dapat merekap seluruh data" },
        { status: 403 }
      );
    }

    // Fetch all entities across foundation
    const [
      foundation,
      students,
      users,
      classes,
      subjects,
      assessments,
      ppiPlans,
      evaluations,
      journals,
      materials,
      logs,
    ] = await Promise.all([
      prisma.foundation.findUnique({
        where: { id: foundationId },
      }),
      prisma.student.findMany({
        where: { foundationId },
        include: {
          parent: { select: { name: true, phone: true, email: true } },
          classes: { include: { class: { select: { name: true, jenjang: true } } } },
          _count: { select: { assessments: true, ppiPlans: true } },
        },
        orderBy: { name: "asc" },
      }),

      prisma.user.findMany({
        where: { foundationId },
        include: {
          classesTaught: { select: { name: true, jenjang: true } },
          students: { select: { name: true } },
        },
        orderBy: { name: "asc" },
      }),
      prisma.class.findMany({
        where: { foundationId },
        include: {
          teacher: { select: { name: true } },
          _count: { select: { students: true } },
        },
        orderBy: { name: "asc" },
      }),
      prisma.subject.findMany({
        include: {
          _count: { select: { materials: true } },
        },
        orderBy: { name: "asc" },
      }),
      prisma.assessment.findMany({
        where: { student: { foundationId } },
        include: {
          student: { select: { name: true, nisn: true, disabilityType: true } },
          teacher: { select: { name: true } },
        },
        orderBy: { assessmentDate: "desc" },
      }),
      prisma.ppiPlan.findMany({
        where: { student: { foundationId } },
        include: {
          student: { select: { name: true, nisn: true } },
          evaluations: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.ppiEvaluation.findMany({
        where: { ppiPlan: { student: { foundationId } } },
        include: {
          ppiPlan: {
            include: {
              student: { select: { name: true } },
            },
          },
        },
        orderBy: { evaluationDate: "desc" },
      }),
      prisma.dailyJournal.findMany({
        where: { student: { foundationId } },
        include: {
          student: { select: { name: true } },
          teacher: { select: { name: true } },
        },
        orderBy: { date: "desc" },
      }),

      prisma.material.findMany({
        where: { class: { foundationId } },
        include: {
          subject: { select: { name: true } },
          createdBy: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),

      prisma.activityLog.findMany({
        where: { foundationId },
        orderBy: { createdAt: "desc" },
        take: 500,
      }),
    ]);

    const teachers = users.filter((u) => u.role === "GURU");
    const parents = users.filter((u) => u.role === "ORANG_TUA");
    const yayasans = users.filter((u) => u.role === "YAYASAN");
    const admins = users.filter((u) => u.role === "ADMIN");

    return NextResponse.json({
      foundation,
      summary: {
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalParents: parents.length,
        totalYayasan: yayasans.length,
        totalAdmins: admins.length,
        totalClasses: classes.length,
        totalSubjects: subjects.length,
        totalAssessments: assessments.length,
        totalPpiPlans: ppiPlans.length,
        totalEvaluations: evaluations.length,
        totalJournals: journals.length,
        totalMaterials: materials.length,
        totalLogs: logs.length,
      },
      students,
      teachers,
      parents,
      yayasans,
      admins,
      classes,
      subjects,
      assessments,
      ppiPlans,
      evaluations,
      journals,
      materials,
      logs,
    });
  } catch (error: any) {
    console.error("Error fetching all rekap:", error);
    return NextResponse.json(
      { error: "Gagal mengambil rekap komprehensif: " + error.message },
      { status: 500 }
    );
  }
}
