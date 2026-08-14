import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Jenjang } from "@prisma/client";
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
    const foundationId = (session.user as any).foundationId;

    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get("parentId");
    const disabilityType = searchParams.get("disabilityType");
    const jenjang = searchParams.get("jenjang");
    const classId = searchParams.get("classId");

    const where: any = {};
    if (disabilityType && disabilityType !== "SEMUA") where.disabilityType = disabilityType;
    if (jenjang && jenjang !== "SEMUA") where.jenjang = jenjang as Jenjang;

    // Data isolation for teachers: only students in classes taught by this teacher
    if (role === "GURU") {
      if (classId && classId !== "SEMUA") {
        where.classes = {
          some: {
            classId: classId,
            class: {
              teacherId: userId,
            },
          },
        };
      } else {
        where.classes = {
          some: {
            class: {
              teacherId: userId,
            },
          },
        };
      }
    } else if (classId && classId !== "SEMUA") {
      where.classes = {
        some: {
          classId: classId,
        },
      };
    }

    // 1 Yayasan = 1 Admin: Scope queries to the user's Yayasan
    if (foundationId) {
      where.foundationId = foundationId;
    }

    // Data isolation for parents
    if (role === "ORANG_TUA") {
      where.parentId = userId;
    } else if (parentId) {
      where.parentId = parentId;
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        foundation: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        classes: {
          include: {
            class: {
              include: {
                teacher: {
                  select: {
                    id: true,
                    name: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        ppiPlans: {
          include: {
            evaluations: {
              orderBy: {
                evaluationDate: "desc",
              },
            },
          },
        },
        assessments: {
          orderBy: {
            assessmentDate: "desc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(students);
  } catch (error: any) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Gagal memuat data siswa" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Akses ditolak: Anda belum login" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const userFoundationId = (session.user as any).foundationId;

    if (role !== "ADMIN" && role !== "GURU") {
      return NextResponse.json({ error: "Akses ditolak: Hanya Admin atau Guru yang dapat mendaftarkan data siswa" }, { status: 403 });
    }

    const body = await req.json();
    const { name, nisn, disabilityType, jenjang, parentId, gender, classId } = body;

    if (!name || !nisn || !disabilityType) {
      return NextResponse.json({ error: "Nama, NISN, dan Jenis Disabilitas wajib diisi" }, { status: 400 });
    }

    // Check duplicate NISN
    const existing = await prisma.student.findUnique({
      where: { nisn: nisn.trim() },
    });
    if (existing) {
      return NextResponse.json({ error: "NISN sudah terdaftar pada siswa lain" }, { status: 400 });
    }

    // For GURU: ensure they assign the student to their own class
    if (role === "GURU") {
      if (!classId) {
        return NextResponse.json({ error: "Guru wajib memilih rombel kelas yang diampu untuk siswa baru" }, { status: 400 });
      }
      const targetClass = await prisma.class.findUnique({
        where: { id: classId },
      });
      if (!targetClass || targetClass.teacherId !== (session.user as any).id) {
        return NextResponse.json({ error: "Akses ditolak: Anda hanya dapat mendaftarkan siswa ke kelas yang Anda ampu" }, { status: 403 });
      }
    }

    const student = await prisma.student.create({
      data: {
        name: name.trim(),
        nisn: nisn.trim(),
        disabilityType: disabilityType.trim(),
        jenjang: jenjang ? (jenjang as Jenjang) : Jenjang.SDLB,
        parentId: parentId || null,
        gender: gender || "L",
        foundationId: userFoundationId || null,
        classes: classId
          ? {
              create: {
                classId: classId,
              },
            }
          : undefined,
      },
      include: {
        classes: {
          include: {
            class: true,
          },
        },
      },
    });

    // Log Activity
    await logActivity({
      userId: (session.user as any).id,
      userName: session.user.name || "Guru/Admin",
      userRole: role,
      action: "CREATE",
      entity: "Student",
      entityId: student.id,
      description: `Mendaftarkan siswa baru: ${student.name} (NISN: ${student.nisn}, Jenjang: ${student.jenjang})`,
      foundationId: student.foundationId,
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error: any) {
    console.error("Error creating student:", error);
    return NextResponse.json({ error: "Gagal menambahkan data siswa: " + error.message }, { status: 500 });
  }
}
