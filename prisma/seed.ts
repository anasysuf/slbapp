import { PrismaClient, Role, Score, Jenjang } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Mulai seeding database Multi-Yayasan SLB App...");

  // Clean existing data
  await prisma.activityLog.deleteMany({});
  await prisma.dailyJournal.deleteMany({});
  await prisma.ppiEvaluation.deleteMany({});
  await prisma.ppiPlan.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.material.deleteMany({});
  await prisma.classStudent.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.foundation.deleteMany({});

  const defaultPassword = await bcrypt.hash("admin123", 10);
  const teacherPassword = await bcrypt.hash("guru123", 10);
  const parentPassword = await bcrypt.hash("ortu123", 10);
  const yayasanPassword = await bcrypt.hash("yayasan123", 10);

  // 1. Create Foundations (Yayasan)
  const yayasanHarapan = await prisma.foundation.create({
    data: {
      name: "Yayasan Pendidikan Harapan Mulia",
      code: "YAYASAN-HARAPAN",
      address: "Jl. Pendidikan Inklusi No. 45, Kota Bandung",
      phone: "022-78901234",
    },
  });

  const yayasanNusantara = await prisma.foundation.create({
    data: {
      name: "Yayasan Kasih Inklusi Nusantara",
      code: "YAYASAN-NUSANTARA",
      address: "Jl. Raya Inklusif No. 12, Jakarta Selatan",
      phone: "021-88990011",
    },
  });

  console.log("✅ Foundations created (Harapan Mulia & Kasih Nusantara)");

  // 2. Create Users
  const adminUser = await prisma.user.create({
    data: {
      name: "Super Administrator SLB",
      email: "admin@slb.sch.id",
      passwordHash: defaultPassword,
      role: Role.ADMIN,
      phone: "081234567890",
      foundationId: yayasanHarapan.id,
    },
  });

  const yayasanUser = await prisma.user.create({
    data: {
      name: "Drs. H. Bambang Soediro",
      email: "yayasan@slb.sch.id",
      passwordHash: yayasanPassword,
      role: Role.YAYASAN,
      phone: "081298765432",
      foundationId: yayasanHarapan.id,
    },
  });

  const guruDewi = await prisma.user.create({
    data: {
      name: "Dewi Rahmawati, S.Pd",
      email: "guru@slb.sch.id",
      passwordHash: teacherPassword,
      role: Role.GURU,
      phone: "081345678901",
      foundationId: yayasanHarapan.id,
    },
  });

  const guruAhmad = await prisma.user.create({
    data: {
      name: "Ahmad Fauzi, S.Pd",
      email: "guru2@slb.sch.id",
      passwordHash: teacherPassword,
      role: Role.GURU,
      phone: "081398761234",
      foundationId: yayasanHarapan.id,
    },
  });

  const ortuHendra = await prisma.user.create({
    data: {
      name: "Hendra Wijaya (Ayah Rizky)",
      email: "ortu@slb.sch.id",
      passwordHash: parentPassword,
      role: Role.ORANG_TUA,
      phone: "085211223344",
      foundationId: yayasanHarapan.id,
    },
  });

  const ortuRatna = await prisma.user.create({
    data: {
      name: "Ratna Sari (Ibu Siti)",
      email: "ortu2@slb.sch.id",
      passwordHash: parentPassword,
      role: Role.ORANG_TUA,
      phone: "085299887766",
      foundationId: yayasanHarapan.id,
    },
  });

  console.log("✅ Users created with foundation relations");

  // 3. Create Classes with Jenjang
  const classTklb = await prisma.class.create({
    data: {
      name: "Kelas Sensori & Terapi Dini (TKLB)",
      jenjang: Jenjang.TKLB,
      teacherId: guruDewi.id,
      foundationId: yayasanHarapan.id,
    },
  });

  const classSdlbAutis = await prisma.class.create({
    data: {
      name: "Kelas 2 SDLB - Autisme & Bina Diri",
      jenjang: Jenjang.SDLB,
      teacherId: guruDewi.id,
      foundationId: yayasanHarapan.id,
    },
  });

  const classSmplbTunarungu = await prisma.class.create({
    data: {
      name: "Kelas 8 SMPLB - Bahasa Isyarat BISINDO",
      jenjang: Jenjang.SMPLB,
      teacherId: guruDewi.id,
      foundationId: yayasanHarapan.id,
    },
  });

  const classSmalbTunanetra = await prisma.class.create({
    data: {
      name: "Kelas 11 SMALB - Vokasional & Orientasi Braille",
      jenjang: Jenjang.SMALB,
      teacherId: guruAhmad.id,
      foundationId: yayasanHarapan.id,
    },
  });

  console.log("✅ Classes created across Jenjang (TKLB, SDLB, SMPLB, SMALB)");

  // 4. Create Students
  const studentRizky = await prisma.student.create({
    data: {
      name: "Rizky Pratama",
      nisn: "0081234501",
      gender: "L",
      disabilityType: "Autisme",
      jenjang: Jenjang.SDLB,
      parentId: ortuHendra.id,
      foundationId: yayasanHarapan.id,
    },
  });

  const studentSiti = await prisma.student.create({
    data: {
      name: "Siti Nurhaliza",
      nisn: "0081234502",
      gender: "P",
      disabilityType: "Tunarungu",
      jenjang: Jenjang.SMPLB,
      parentId: ortuRatna.id,
      foundationId: yayasanHarapan.id,
    },
  });

  const studentDimas = await prisma.student.create({
    data: {
      name: "Dimas Anggara",
      nisn: "0081234503",
      gender: "L",
      disabilityType: "Tunanetra",
      jenjang: Jenjang.SMALB,
      foundationId: yayasanHarapan.id,
    },
  });

  const studentAnnisa = await prisma.student.create({
    data: {
      name: "Annisa Putri",
      nisn: "0081234504",
      gender: "P",
      disabilityType: "Tunagrahita Ringan",
      jenjang: Jenjang.TKLB,
      foundationId: yayasanHarapan.id,
    },
  });

  const studentBudi = await prisma.student.create({
    data: {
      name: "Budi Santoso",
      nisn: "0081234505",
      gender: "L",
      disabilityType: "Tunadaksa",
      jenjang: Jenjang.SDLB,
      foundationId: yayasanHarapan.id,
    },
  });

  // Assign Students to Classes
  await prisma.classStudent.createMany({
    data: [
      { classId: classSdlbAutis.id, studentId: studentRizky.id },
      { classId: classSdlbAutis.id, studentId: studentBudi.id },
      { classId: classSmplbTunarungu.id, studentId: studentSiti.id },
      { classId: classSmalbTunanetra.id, studentId: studentDimas.id },
      { classId: classTklb.id, studentId: studentAnnisa.id },
    ],
  });

  console.log("✅ Students and Class assignments created");

  // 5. Create Subjects
  const subjBinaDiri = await prisma.subject.create({
    data: {
      name: "Bina Diri & Activity of Daily Living (ADL)",
      description: "Latihan kemandirian makan, minum, memakai pakaian, dan kebersihan diri.",
    },
  });

  const subjKomunikasi = await prisma.subject.create({
    data: {
      name: "Komunikasi & Bahasa Isyarat / PECS",
      description: "Pengembangan komunikasi verbal, non-verbal, simbol PECS, dan BISINDO.",
    },
  });

  const subjMotorik = await prisma.subject.create({
    data: {
      name: "Sensori Integrasi & Motorik Fungsional",
      description: "Stimulasi motorik halus dan motorik kasar keseimbangan tubuh.",
    },
  });

  const subjVokasional = await prisma.subject.create({
    data: {
      name: "Keterampilan Vokasional & Kerajinan Tangan",
      description: "Kemandirian berkarya, tata boga sederhana, dan budidaya tanaman.",
    },
  });

  // 6. Create Assessments
  await prisma.assessment.create({
    data: {
      studentId: studentRizky.id,
      teacherId: guruDewi.id,
      category: "Bina Diri (ADL)",
      title: "Asesmen Kemandirian Perawatan Diri Awal Semester",
      aspect: "Kemampuan Memakai Sepatu Perekat Sendiri",
      score: Score.DENGAN_BANTUAN,
      findings: "Rizky sudah mampu membedakan sepatu kiri dan kanan dengan label warna, namun masih memerlukan prompting verbal untuk mengencangkan perekat velcro.",
      recommendation: "Latihan rutin setiap pagi sebelum masuk kelas dan jadikan target jangka pendek di PPI.",
    },
  });

  await prisma.assessment.create({
    data: {
      studentId: studentSiti.id,
      teacherId: guruDewi.id,
      category: "Bahasa & Komunikasi",
      title: "Asesmen Bahasa Isyarat BISINDO & Fonemik",
      aspect: "Penguasaan 50 Kosakata Isyarat Benda di Lingkungan Sekolah",
      score: Score.MANDIRI,
      findings: "Siti sangat ekspresif dan menguasai isyarat untuk meja, kursi, buku, guru, teman, dan kantin dengan akurat.",
      recommendation: "Mulai diperkenalkan pembentukan kalimat berpola Subjek-Predikat-Objek.",
    },
  });

  // 7. Create PPI Plans
  const ppiRizky = await prisma.ppiPlan.create({
    data: {
      studentId: studentRizky.id,
      teacherId: guruDewi.id,
      academicYear: "2026/2027 Ganjil",
      currentCapability: "Rizky mampu fokus selama 5-8 menit dengan stimulus visual. Menunjukkan kontak mata 3-5 detik saat dipanggil namanya. Menguasai 10 simbol PECS.",
      longTermGoal: "Meningkatkan rentang konsentrasi mandiri hingga 15 menit, merespons interaksi dua arah, dan mampu merapikan alat makan sendiri.",
      shortTermGoal: "1) Menyelesaikan puzzle 12 keping dalam 10 menit. 2) Mencuci tangan mandiri setelah makan.",
    },
  });

  await prisma.ppiEvaluation.create({
    data: {
      ppiPlanId: ppiRizky.id,
      score: Score.MANDIRI,
      narrativeNotes: "Rizky mencuci tangan 6 langkah mandiri sesuai urutan poster visual.",
    },
  });

  // 8. Create Daily Journal
  await prisma.dailyJournal.create({
    data: {
      studentId: studentRizky.id,
      teacherId: guruDewi.id,
      mood: "Gembira & Sangat Fokus",
      healthCondition: "Sehat bugar",
      eatingNote: "Makan bekal nasi & telur habis mandiri",
      learningActivity: "Hari ini Rizky sangat kooperatif mengikuti sesi meronce balok geometri dan latihan cuci tangan 6 langkah. Kontak mata meningkat hingga 8 detik.",
      parentFeedback: "Alhamdulillah terima kasih banyak Bu Dewi atas bimbingannya. Di rumah Rizky juga mulai terbiasa merapikan kotak makannya sendiri.",
    },
  });

  // 9. Create Activity Logs
  await prisma.activityLog.createMany({
    data: [
      {
        userId: adminUser.id,
        userName: adminUser.name || "Admin",
        userRole: Role.ADMIN,
        action: "CREATE",
        entity: "Foundation",
        description: "Mendaftarkan Yayasan Pendidikan Harapan Mulia ke sistem",
        foundationId: yayasanHarapan.id,
      },
      {
        userId: adminUser.id,
        userName: adminUser.name || "Admin",
        userRole: Role.ADMIN,
        action: "CREATE",
        entity: "User",
        description: "Menambahkan akun guru Dewi Rahmawati, S.Pd",
        foundationId: yayasanHarapan.id,
      },
      {
        userId: guruDewi.id,
        userName: guruDewi.name || "Guru Dewi",
        userRole: Role.GURU,
        action: "ASSESSMENT",
        entity: "Assessment",
        description: "Melakukan asesmen awal kemampuan bina diri pada siswa Rizky Pratama",
        foundationId: yayasanHarapan.id,
      },
      {
        userId: guruDewi.id,
        userName: guruDewi.name || "Guru Dewi",
        userRole: Role.GURU,
        action: "CREATE",
        entity: "PpiPlan",
        description: "Menyusun Program Pembelajaran Individual (PPI) untuk Rizky Pratama TA 2026/2027",
        foundationId: yayasanHarapan.id,
      },
    ],
  });

  console.log("✨ Seeding selesai sukses dengan Multi-Yayasan & Activity Logs!");
}

main()
  .catch((e) => {
    console.error("❌ Error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
