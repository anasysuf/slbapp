import { PrismaClient, Role, Score, Jenjang } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Mulai seeding database Multi-Yayasan SLB App (1 Guru = 1 Kelas Terpisah)...");

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

  console.log("✅ Foundations created");

  // 2. Create Users: Admin & Yayasan
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

  // 3. Create Teachers (4 Guru untuk 4 Kelas berbeda: 1 Guru = 1 Kelas)
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

  const guruSiti = await prisma.user.create({
    data: {
      name: "Siti Rahayu, S.Pd",
      email: "guru3@slb.sch.id",
      passwordHash: teacherPassword,
      role: Role.GURU,
      phone: "081355443322",
      foundationId: yayasanHarapan.id,
    },
  });

  const guruAgus = await prisma.user.create({
    data: {
      name: "Agus Setiawan, S.Pd",
      email: "guru4@slb.sch.id",
      passwordHash: teacherPassword,
      role: Role.GURU,
      phone: "081366778899",
      foundationId: yayasanHarapan.id,
    },
  });

  // 4. Create Parents
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

  const ortuMaya = await prisma.user.create({
    data: {
      name: "Maya Anggraini (Ibu Annisa)",
      email: "ortu3@slb.sch.id",
      passwordHash: parentPassword,
      role: Role.ORANG_TUA,
      phone: "085277665544",
      foundationId: yayasanHarapan.id,
    },
  });

  console.log("✅ Users created (Admin, Yayasan, 4 Guru, 3 Ortu)");

  // 5. Create 4 Classes (1 Kelas untuk 1 Guru)
  // Kelas 1: SDLB -> Guru Dewi
  const classSdlbAutis = await prisma.class.create({
    data: {
      name: "Kelas 2 SDLB - Autisme & Bina Diri",
      jenjang: Jenjang.SDLB,
      teacherId: guruDewi.id,
      foundationId: yayasanHarapan.id,
    },
  });

  // Kelas 2: SMALB -> Guru Ahmad
  const classSmalbTunanetra = await prisma.class.create({
    data: {
      name: "Kelas 11 SMALB - Vokasional & Orientasi Braille",
      jenjang: Jenjang.SMALB,
      teacherId: guruAhmad.id,
      foundationId: yayasanHarapan.id,
    },
  });

  // Kelas 3: SMPLB -> Guru Siti
  const classSmplbTunarungu = await prisma.class.create({
    data: {
      name: "Kelas 8 SMPLB - Bahasa Isyarat BISINDO",
      jenjang: Jenjang.SMPLB,
      teacherId: guruSiti.id,
      foundationId: yayasanHarapan.id,
    },
  });

  // Kelas 4: TKLB -> Guru Agus
  const classTklbSensori = await prisma.class.create({
    data: {
      name: "Kelas Sensori & Terapi Dini (TKLB)",
      jenjang: Jenjang.TKLB,
      teacherId: guruAgus.id,
      foundationId: yayasanHarapan.id,
    },
  });

  console.log("✅ 4 Rombel Classes created (Setiap kelas diampu oleh tepat 1 guru)");

  // 6. Create Students for Each Class
  // Siswa Kelas 2 SDLB (Guru Dewi)
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

  const studentBudi = await prisma.student.create({
    data: {
      name: "Budi Santoso",
      nisn: "0081234502",
      gender: "L",
      disabilityType: "Tunadaksa",
      jenjang: Jenjang.SDLB,
      parentId: ortuHendra.id,
      foundationId: yayasanHarapan.id,
    },
  });

  // Siswa Kelas 11 SMALB (Guru Ahmad)
  const studentDimas = await prisma.student.create({
    data: {
      name: "Dimas Anggara",
      nisn: "0081234503",
      gender: "L",
      disabilityType: "Tunanetra",
      jenjang: Jenjang.SMALB,
      parentId: ortuRatna.id,
      foundationId: yayasanHarapan.id,
    },
  });

  const studentFajar = await prisma.student.create({
    data: {
      name: "Fajar Hidayat",
      nisn: "0081234504",
      gender: "L",
      disabilityType: "Tunanetra",
      jenjang: Jenjang.SMALB,
      parentId: ortuRatna.id,
      foundationId: yayasanHarapan.id,
    },
  });

  // Siswa Kelas 8 SMPLB (Guru Siti)
  const studentSiti = await prisma.student.create({
    data: {
      name: "Siti Nurhaliza",
      nisn: "0081234505",
      gender: "P",
      disabilityType: "Tunarungu",
      jenjang: Jenjang.SMPLB,
      parentId: ortuRatna.id,
      foundationId: yayasanHarapan.id,
    },
  });

  const studentFarhan = await prisma.student.create({
    data: {
      name: "Farhan Maulana",
      nisn: "0081234506",
      gender: "L",
      disabilityType: "Tunarungu",
      jenjang: Jenjang.SMPLB,
      parentId: ortuMaya.id,
      foundationId: yayasanHarapan.id,
    },
  });

  // Siswa Kelas TKLB (Guru Agus)
  const studentAnnisa = await prisma.student.create({
    data: {
      name: "Annisa Putri",
      nisn: "0081234507",
      gender: "P",
      disabilityType: "Tunagrahita Ringan",
      jenjang: Jenjang.TKLB,
      parentId: ortuMaya.id,
      foundationId: yayasanHarapan.id,
    },
  });

  const studentKenzo = await prisma.student.create({
    data: {
      name: "Kenzo Alvino",
      nisn: "0081234508",
      gender: "L",
      disabilityType: "Autisme",
      jenjang: Jenjang.TKLB,
      parentId: ortuMaya.id,
      foundationId: yayasanHarapan.id,
    },
  });

  // Assign Students to their respective classes exclusively
  await prisma.classStudent.createMany({
    data: [
      // Kelas 2 SDLB (Guru Dewi)
      { classId: classSdlbAutis.id, studentId: studentRizky.id },
      { classId: classSdlbAutis.id, studentId: studentBudi.id },

      // Kelas 11 SMALB (Guru Ahmad)
      { classId: classSmalbTunanetra.id, studentId: studentDimas.id },
      { classId: classSmalbTunanetra.id, studentId: studentFajar.id },

      // Kelas 8 SMPLB (Guru Siti)
      { classId: classSmplbTunarungu.id, studentId: studentSiti.id },
      { classId: classSmplbTunarungu.id, studentId: studentFarhan.id },

      // Kelas TKLB (Guru Agus)
      { classId: classTklbSensori.id, studentId: studentAnnisa.id },
      { classId: classTklbSensori.id, studentId: studentKenzo.id },
    ],
  });

  console.log("✅ 8 Siswa terdistribusi rapi ke 4 kelas terpisah");

  // 7. Create Subjects
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
      name: "Keterampilan Vokasional & Orientasi Braille",
      description: "Kemandirian berkarya, tata boga sederhana, dan orientasi mobilitas Braille.",
    },
  });

  // 8. Create Sample Materials for Each Teacher's Class
  await prisma.material.createMany({
    data: [
      {
        title: "Panduan Memakai Sepatu Mandiri dengan Velcro",
        content: "1. Siapkan sepatu dengan perekat terbuka lebar. 2. Masukkan ujung jari kaki hingga tumit pas. 3. Tarik perekat velcro dan rekatkan kuat.",
        classId: classSdlbAutis.id,
        subjectId: subjBinaDiri.id,
        createdById: guruDewi.id,
      },
      {
        title: "Modul Membaca Huruf Braille Tingkat Pemula",
        content: "Mengenali pola 6 titik timbul untuk huruf abjad A sampai J menggunakan indra peraba jari telunjuk.",
        classId: classSmalbTunanetra.id,
        subjectId: subjVokasional.id,
        createdById: guruAhmad.id,
      },
      {
        title: "Kamus Isyarat BISINDO: 50 Kata Aktivitas Sekolah",
        content: "Video dan panduan gerak isyarat untuk kata: belajar, menulis, membaca, berdiskusi, istirahat, dan salam guru.",
        classId: classSmplbTunarungu.id,
        subjectId: subjKomunikasi.id,
        createdById: guruSiti.id,
      },
      {
        title: "Stimulasi Sensori Tekstur & Meronce Manik Geometri",
        content: "Latihan memegang manik kayu dengan penjepit jari untuk melatih kekuatan genggaman dan fokus visual anak.",
        classId: classTklbSensori.id,
        subjectId: subjMotorik.id,
        createdById: guruAgus.id,
      },
    ],
  });

  // 9. Create Assessments per Teacher
  // Guru Dewi -> Rizky & Budi
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
      studentId: studentBudi.id,
      teacherId: guruDewi.id,
      category: "Motorik Kasar & Halus",
      title: "Asesmen Motorik Halus Menulis",
      aspect: "Memegang Alat Tulis Adaptif Segitiga",
      score: Score.MANDIRI,
      findings: "Budi mampu menggenggam pensil grip adaptif dan menarik garis lurus mandiri.",
      recommendation: "Tingkatkan ke latihan mewarnai pola sederhana.",
    },
  });

  // Guru Ahmad -> Dimas
  await prisma.assessment.create({
    data: {
      studentId: studentDimas.id,
      teacherId: guruAhmad.id,
      category: "Kognitif / Akademik",
      title: "Asesmen Orientasi & Huruf Braille",
      aspect: "Pengenalan Titik Timbul Huruf Vokal A, I, U, E, O",
      score: Score.MANDIRI,
      findings: "Dimas meraba dan membedakan posisi titik 1, 2, 4 dengan sangat cepat dan akurat.",
      recommendation: "Lanjutkan ke pengenalan huruf konsonan B, C, D.",
    },
  });

  // Guru Siti -> Siti Nurhaliza
  await prisma.assessment.create({
    data: {
      studentId: studentSiti.id,
      teacherId: guruSiti.id,
      category: "Bahasa & Komunikasi",
      title: "Asesmen Bahasa Isyarat BISINDO & Fonemik",
      aspect: "Penguasaan 50 Kosakata Isyarat Benda Sekolah",
      score: Score.MANDIRI,
      findings: "Siti sangat ekspresif dan menguasai isyarat untuk meja, kursi, buku, guru, teman, dan kantin.",
      recommendation: "Mulai diperkenalkan pembentukan kalimat berpola Subjek-Predikat-Objek.",
    },
  });

  // Guru Agus -> Annisa
  await prisma.assessment.create({
    data: {
      studentId: studentAnnisa.id,
      teacherId: guruAgus.id,
      category: "Sosial Emosional",
      title: "Asesmen Interaksi Teman Sebaya Dini",
      aspect: "Berbagi Mainan Sensori Pasir Ajaib",
      score: Score.DENGAN_BANTUAN,
      findings: "Annisa mau bermain berdampingan dan berbagi cetakan saat diarahkan oleh guru.",
      recommendation: "Perbanyak aktivitas bermain kelompok kecil 2-3 anak.",
    },
  });

  // 10. Create PPI Plans & Evaluations
  // PPI Rizky (Guru Dewi)
  const ppiRizky = await prisma.ppiPlan.create({
    data: {
      studentId: studentRizky.id,
      teacherId: guruDewi.id,
      academicYear: "2026/2027 Ganjil",
      currentCapability: "Rizky mampu fokus selama 5-8 menit dengan stimulus visual. Menunjukkan kontak mata 3-5 detik saat dipanggil namanya. Menguasai 10 simbol PECS.",
      longTermGoal: "Meningkatkan rentang konsentrasi mandiri hingga 15 menit, merespons interaksi dua arah, dan mampu merapikan alat makan sendiri.",
      shortTermGoal: "1) Menyelesaikan puzzle 12 keping dalam 10 menit. 2) Mencuci tangan mandiri 6 langkah setelah makan.",
    },
  });

  await prisma.ppiEvaluation.create({
    data: {
      ppiPlanId: ppiRizky.id,
      score: Score.MANDIRI,
      narrativeNotes: "Rizky mencuci tangan 6 langkah mandiri sesuai urutan poster visual tanpa bantuan guru.",
    },
  });

  // PPI Dimas (Guru Ahmad)
  const ppiDimas = await prisma.ppiPlan.create({
    data: {
      studentId: studentDimas.id,
      teacherId: guruAhmad.id,
      academicYear: "2026/2027 Ganjil",
      currentCapability: "Dimas menguasai huruf Braille vokal dan mampu melakukan navigasi mandiri di dalam ruang kelas menggunakan tongkat.",
      longTermGoal: "Mampu membaca 1 paragraf teks Braille mandiri dan bernavigasi dari kelas menuju perpustakaan.",
      shortTermGoal: "1) Mengetik 10 kata pada mesin Reglet Braille. 2) Menghafal rute lorong lantai 1.",
    },
  });

  await prisma.ppiEvaluation.create({
    data: {
      ppiPlanId: ppiDimas.id,
      score: Score.DENGAN_BANTUAN,
      narrativeNotes: "Dimas berhasil mengetik 7 dari 10 kata pada Reglet dengan bimbingan posisi baris.",
    },
  });

  // PPI Siti (Guru Siti)
  const ppiSiti = await prisma.ppiPlan.create({
    data: {
      studentId: studentSiti.id,
      teacherId: guruSiti.id,
      academicYear: "2026/2027 Ganjil",
      currentCapability: "Menguasai 50 kosakata tunggal BISINDO dengan artikulasi visual yang jelas.",
      longTermGoal: "Mampu berkomunikasi kalimat tanya dan pernyataan 3 kata dalam BISINDO secara lancar.",
      shortTermGoal: "1) Mengisyaratkan 'Saya mau minum air'. 2) Merespons sapaan pagi guru dan teman.",
    },
  });

  await prisma.ppiEvaluation.create({
    data: {
      ppiPlanId: ppiSiti.id,
      score: Score.MANDIRI,
      narrativeNotes: "Siti dengan penuh senyum mengisyaratkan sapaan pagi kepada seluruh teman di kelas.",
    },
  });

  // 11. Create Daily Journals per Teacher
  await prisma.dailyJournal.createMany({
    data: [
      {
        studentId: studentRizky.id,
        teacherId: guruDewi.id,
        mood: "Gembira & Sangat Fokus",
        healthCondition: "Sehat bugar",
        eatingNote: "Makan bekal nasi & telur habis mandiri",
        learningActivity: "Hari ini Rizky sangat kooperatif mengikuti sesi meronce balok geometri dan latihan cuci tangan 6 langkah. Kontak mata meningkat hingga 8 detik.",
        parentFeedback: "Alhamdulillah terima kasih banyak Bu Dewi atas bimbingannya. Di rumah Rizky juga mulai terbiasa merapikan kotak makannya sendiri.",
      },
      {
        studentId: studentDimas.id,
        teacherId: guruAhmad.id,
        mood: "Tenang & Kooperatif",
        healthCondition: "Sehat",
        eatingNote: "Makan bekal roti habis",
        learningActivity: "Dimas sangat antusias belajar membaca pola timbul cerita fabel pendek dengan teks Braille.",
        parentFeedback: "Terima kasih Pak Ahmad, Dimas di rumah senang menceritakan kembali cerita fabelnya.",
      },
      {
        studentId: studentSiti.id,
        teacherId: guruSiti.id,
        mood: "Gembira & Sangat Fokus",
        healthCondition: "Sehat bugar",
        eatingNote: "Makan buah apel dan bekal",
        learningActivity: "Siti memimpin kelompok belajar dalam mempraktikkan isyarat nama-nama hari dan bulan.",
        parentFeedback: "Hebat Siti! Terima kasih Bu Siti atas motivasinya.",
      },
    ],
  });

  // 12. Create Activity Logs
  await prisma.activityLog.createMany({
    data: [
      {
        userId: adminUser.id,
        userName: adminUser.name || "Admin",
        userRole: Role.ADMIN,
        action: "CREATE",
        entity: "Foundation",
        description: "Inisialisasi sistem Multi-Yayasan Pendidikan Khusus SLB",
        foundationId: yayasanHarapan.id,
      },
      {
        userId: guruDewi.id,
        userName: guruDewi.name || "Guru Dewi",
        userRole: Role.GURU,
        action: "ASSESSMENT",
        entity: "Assessment",
        description: "Melakukan asesmen kemandirian siswa Rizky Pratama pada Kelas 2 SDLB",
        foundationId: yayasanHarapan.id,
      },
      {
        userId: guruAhmad.id,
        userName: guruAhmad.name || "Guru Ahmad",
        userRole: Role.GURU,
        action: "CREATE",
        entity: "PpiPlan",
        description: "Menyusun target PPI Orientasi Braille untuk Dimas Anggara pada Kelas 11 SMALB",
        foundationId: yayasanHarapan.id,
      },
    ],
  });

  console.log("✨ Seeding selesai sukses! 4 Guru dengan masing-masing 1 kelas terpisah telah siap diuji.");
}

main()
  .catch((e) => {
    console.error("❌ Error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
