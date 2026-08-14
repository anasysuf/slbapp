import { PrismaClient, Role, Score, Jenjang } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Mulai seeding database lengkap SLB App Multi-Kelas & Multi-Orang Tua...");

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

  // 1. Create Foundations (Yayasan / Sekolah)
  const yayasanHarapan = await prisma.foundation.create({
    data: {
      name: "Yayasan Pendidikan Luar Biasa Harapan Mulia",
      code: "NPSN-20109988",
      address: "Jl. Pendidikan Inklusi No. 45, Kota Bandung, Jawa Barat",
      phone: "022-78901234 / 0812-3456-7890",
      logo: "🏫",
    },
  });

  const yayasanNusantara = await prisma.foundation.create({
    data: {
      name: "Yayasan Kasih Inklusi Nusantara",
      code: "NPSN-20107755",
      address: "Jl. Raya Inklusif No. 12, Jakarta Selatan, DKI Jakarta",
      phone: "021-88990011",
      logo: "🌟",
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
      name: "Drs. H. Bambang Soediro, M.Pd",
      email: "yayasan@slb.sch.id",
      passwordHash: yayasanPassword,
      role: Role.YAYASAN,
      phone: "081298765432",
      foundationId: yayasanHarapan.id,
    },
  });

  // 3. Create 4 Teachers (1 Guru = 1 Kelas Terpisah)
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

  // 4. Create Parents (3 Demo Accounts + Extra Parents)
  // Demo Parent 1: Hendra Wijaya (Ayah Rizky Pratama & Budi Santoso di SDLB)
  const ortuHendra = await prisma.user.create({
    data: {
      name: "Hendra Wijaya (Ayah Rizky & Budi)",
      email: "ortu@slb.sch.id",
      passwordHash: parentPassword,
      role: Role.ORANG_TUA,
      phone: "085211223344",
      foundationId: yayasanHarapan.id,
    },
  });

  // Demo Parent 2: Ibu Ratna Dewi (Ibu Dimas Anggara di SMALB & Siti Nurhaliza di SMPLB)
  const ortuRatna = await prisma.user.create({
    data: {
      name: "Ratna Dewi (Ibu Dimas & Siti)",
      email: "ortu2@slb.sch.id",
      passwordHash: parentPassword,
      role: Role.ORANG_TUA,
      phone: "085299887766",
      foundationId: yayasanHarapan.id,
    },
  });

  // Demo Parent 3: Ibu Maya Anggraini (Ibu Kenzo & Annisa di TKLB)
  const ortuMaya = await prisma.user.create({
    data: {
      name: "Maya Anggraini (Ibu Kenzo & Annisa)",
      email: "ortu3@slb.sch.id",
      passwordHash: parentPassword,
      role: Role.ORANG_TUA,
      phone: "085277665544",
      foundationId: yayasanHarapan.id,
    },
  });

  // Demo Parent 4: Bapak Eko Prasetyo (Ayah Farhan di SMPLB & Fajar di SMALB)
  const ortuEko = await prisma.user.create({
    data: {
      name: "Eko Prasetyo (Ayah Farhan & Fajar)",
      email: "ortu4@slb.sch.id",
      passwordHash: parentPassword,
      role: Role.ORANG_TUA,
      phone: "085233445566",
      foundationId: yayasanHarapan.id,
    },
  });

  console.log("✅ Users created (Admin, Yayasan, 4 Guru, 4 Orang Tua)");

  // 5. Create 4 Rombel Classes (Dikelola oleh Admin, 1 Guru = 1 Kelas)
  const classSdlbAutis = await prisma.class.create({
    data: {
      name: "Kelas 2 SDLB - Autisme & Bina Diri",
      jenjang: Jenjang.SDLB,
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

  const classSmplbTunarungu = await prisma.class.create({
    data: {
      name: "Kelas 8 SMPLB - Bahasa Isyarat BISINDO",
      jenjang: Jenjang.SMPLB,
      teacherId: guruSiti.id,
      foundationId: yayasanHarapan.id,
    },
  });

  const classTklbSensori = await prisma.class.create({
    data: {
      name: "Kelas Sensori & Terapi Dini (TKLB)",
      jenjang: Jenjang.TKLB,
      teacherId: guruAgus.id,
      foundationId: yayasanHarapan.id,
    },
  });

  console.log("✅ 4 Rombel Classes created");

  // 6. Create 16 Students (4 Siswa per Kelas)
  // === KELAS 2 SDLB (Guru Dewi) ===
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

  const studentNayla = await prisma.student.create({
    data: {
      name: "Nayla Syakira",
      nisn: "0081234503",
      gender: "P",
      disabilityType: "Tunagrahita Sedang",
      jenjang: Jenjang.SDLB,
      parentId: ortuRatna.id,
      foundationId: yayasanHarapan.id,
    },
  });

  const studentZaidan = await prisma.student.create({
    data: {
      name: "Zaidan Alfarizi",
      nisn: "0081234504",
      gender: "L",
      disabilityType: "Slow Learner",
      jenjang: Jenjang.SDLB,
      parentId: ortuMaya.id,
      foundationId: yayasanHarapan.id,
    },
  });

  // === KELAS 11 SMALB (Guru Ahmad) ===
  const studentDimas = await prisma.student.create({
    data: {
      name: "Dimas Anggara",
      nisn: "0081234505",
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
      nisn: "0081234506",
      gender: "L",
      disabilityType: "Tunanetra",
      jenjang: Jenjang.SMALB,
      parentId: ortuEko.id,
      foundationId: yayasanHarapan.id,
    },
  });

  const studentBella = await prisma.student.create({
    data: {
      name: "Bella Oktaviana",
      nisn: "0081234507",
      gender: "P",
      disabilityType: "Tunadaksa",
      jenjang: Jenjang.SMALB,
      parentId: ortuHendra.id,
      foundationId: yayasanHarapan.id,
    },
  });

  const studentRendy = await prisma.student.create({
    data: {
      name: "Rendy Kurniawan",
      nisn: "0081234508",
      gender: "L",
      disabilityType: "Autisme",
      jenjang: Jenjang.SMALB,
      parentId: ortuEko.id,
      foundationId: yayasanHarapan.id,
    },
  });

  // === KELAS 8 SMPLB (Guru Siti) ===
  const studentSiti = await prisma.student.create({
    data: {
      name: "Siti Nurhaliza",
      nisn: "0081234509",
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
      nisn: "0081234510",
      gender: "L",
      disabilityType: "Tunarungu",
      jenjang: Jenjang.SMPLB,
      parentId: ortuEko.id,
      foundationId: yayasanHarapan.id,
    },
  });

  const studentKevin = await prisma.student.create({
    data: {
      name: "Kevin Julian",
      nisn: "0081234511",
      gender: "L",
      disabilityType: "Tunagrahita Ringan",
      jenjang: Jenjang.SMPLB,
      parentId: ortuHendra.id,
      foundationId: yayasanHarapan.id,
    },
  });

  const studentAisyah = await prisma.student.create({
    data: {
      name: "Aisyah Zahrani",
      nisn: "0081234512",
      gender: "P",
      disabilityType: "Tunarungu",
      jenjang: Jenjang.SMPLB,
      parentId: ortuMaya.id,
      foundationId: yayasanHarapan.id,
    },
  });

  // === KELAS TKLB (Guru Agus) ===
  const studentAnnisa = await prisma.student.create({
    data: {
      name: "Annisa Putri",
      nisn: "0081234513",
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
      nisn: "0081234514",
      gender: "L",
      disabilityType: "Autisme",
      jenjang: Jenjang.TKLB,
      parentId: ortuMaya.id,
      foundationId: yayasanHarapan.id,
    },
  });

  const studentBilal = await prisma.student.create({
    data: {
      name: "Bilal Ramadhan",
      nisn: "0081234515",
      gender: "L",
      disabilityType: "Slow Learner",
      jenjang: Jenjang.TKLB,
      parentId: ortuEko.id,
      foundationId: yayasanHarapan.id,
    },
  });

  const studentClarissa = await prisma.student.create({
    data: {
      name: "Clarissa Aurelia",
      nisn: "0081234516",
      gender: "P",
      disabilityType: "Autisme",
      jenjang: Jenjang.TKLB,
      parentId: ortuRatna.id,
      foundationId: yayasanHarapan.id,
    },
  });

  // Assign Students to ClassStudent
  await prisma.classStudent.createMany({
    data: [
      // Kelas 2 SDLB (Guru Dewi)
      { classId: classSdlbAutis.id, studentId: studentRizky.id },
      { classId: classSdlbAutis.id, studentId: studentBudi.id },
      { classId: classSdlbAutis.id, studentId: studentNayla.id },
      { classId: classSdlbAutis.id, studentId: studentZaidan.id },

      // Kelas 11 SMALB (Guru Ahmad)
      { classId: classSmalbTunanetra.id, studentId: studentDimas.id },
      { classId: classSmalbTunanetra.id, studentId: studentFajar.id },
      { classId: classSmalbTunanetra.id, studentId: studentBella.id },
      { classId: classSmalbTunanetra.id, studentId: studentRendy.id },

      // Kelas 8 SMPLB (Guru Siti)
      { classId: classSmplbTunarungu.id, studentId: studentSiti.id },
      { classId: classSmplbTunarungu.id, studentId: studentFarhan.id },
      { classId: classSmplbTunarungu.id, studentId: studentKevin.id },
      { classId: classSmplbTunarungu.id, studentId: studentAisyah.id },

      // Kelas TKLB (Guru Agus)
      { classId: classTklbSensori.id, studentId: studentAnnisa.id },
      { classId: classTklbSensori.id, studentId: studentKenzo.id },
      { classId: classTklbSensori.id, studentId: studentBilal.id },
      { classId: classTklbSensori.id, studentId: studentClarissa.id },
    ],
  });

  console.log("✅ 16 Siswa terdistribusi rapi ke 4 kelas terpisah");

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
      description: "Kemandirian berkarya, tata boga sederhana, kerajinan tangan, dan orientasi mobilitas Braille.",
    },
  });

  // 8. Create Learning Materials
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
        title: "Latihan Menyikat Gigi 5 Langkah Visual",
        content: "Panduan poster visual langkah menggosok gigi bagian depan, samping, dalam, dan berkumur bersih.",
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
        title: "Keterampilan Kerajinan Anyaman & Tata Boga Dasar",
        content: "Pelatihan merajut simpul macrame dan membuat kue kering kemasan untuk persiapan kemandirian wirausaha vokasional.",
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
        title: "Percakapan Praktis Dua Arah di Tempat Umum",
        content: "Latihan simulasi memesan makanan di kasir kantin dan menyapa petugas dengan isyarat dan kartu komunikasi.",
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
      {
        title: "Terapi Musik & Gerak Irama Koordinasi Tubuh",
        content: "Aktivitas melompat pada matras warna dan menirukan tepuk tangan berirama untuk meningkatkan keseimbangan motorik kasar.",
        classId: classTklbSensori.id,
        subjectId: subjMotorik.id,
        createdById: guruAgus.id,
      },
    ],
  });

  // 9. Create Comprehensive Assessments
  await prisma.assessment.createMany({
    data: [
      // Guru Dewi (SDLB)
      {
        studentId: studentRizky.id,
        teacherId: guruDewi.id,
        category: "Bina Diri (ADL)",
        title: "Asesmen Kemandirian Perawatan Diri Awal Semester",
        aspect: "Kemampuan Memakai Sepatu Perekat Sendiri",
        score: Score.DENGAN_BANTUAN,
        findings: "Rizky mampu membedakan sepatu kiri dan kanan dengan label warna, namun masih memerlukan dorongan verbal untuk merekatkan perekat velcro.",
        recommendation: "Latihan rutin setiap pagi sebelum masuk kelas dan jadikan target jangka pendek di PPI.",
      },
      {
        studentId: studentBudi.id,
        teacherId: guruDewi.id,
        category: "Motorik Kasar & Halus",
        title: "Asesmen Motorik Halus Menulis Adaptif",
        aspect: "Memegang Alat Tulis Adaptif Segitiga",
        score: Score.MANDIRI,
        findings: "Budi mampu menggenggam pensil grip adaptif dan menarik garis lurus mandiri tanpa tremor berlebih.",
        recommendation: "Tingkatkan ke latihan mewarnai pola bentuk sederhana.",
      },
      {
        studentId: studentNayla.id,
        teacherId: guruDewi.id,
        category: "Bahasa & Komunikasi",
        title: "Asesmen Komunikasi Reseptif & Ekspresif",
        aspect: "Merespons Instruksi Sederhana 1 Langkah",
        score: Score.DENGAN_BANTUAN,
        findings: "Nayla memahami perintah 'duduk' dan 'ambil tas' jika disertai dengan gerakan isyarat tubuh guru.",
        recommendation: "Gunakan kartu petunjuk visual di atas meja belajar Nayla.",
      },
      {
        studentId: studentZaidan.id,
        teacherId: guruDewi.id,
        category: "Kognitif / Akademik",
        title: "Asesmen Pengenalan Lambang Bilangan",
        aspect: "Membilang Angka Konkret 1 sampai 10",
        score: Score.MANDIRI,
        findings: "Zaidan dapat mencocokkan jumlah benda konkret kancing warna dengan angka 1 sampai 10 secara tepat.",
        recommendation: "Mulai diperkenalkan penjumlahan konkret sederhana menggunakan sempoa besar.",
      },

      // Guru Ahmad (SMALB)
      {
        studentId: studentDimas.id,
        teacherId: guruAhmad.id,
        category: "Kognitif / Akademik",
        title: "Asesmen Orientasi & Huruf Braille",
        aspect: "Pengenalan Titik Timbul Huruf Vokal A, I, U, E, O",
        score: Score.MANDIRI,
        findings: "Dimas meraba dan membedakan posisi titik 1, 2, 4 dengan sangat cepat dan akurat.",
        recommendation: "Lanjutkan ke pengenalan huruf konsonan B, C, D dan membaca kata sederhana.",
      },
      {
        studentId: studentFajar.id,
        teacherId: guruAhmad.id,
        category: "Bina Diri (ADL)",
        title: "Asesmen Orientasi Mobilitas & Tongkat Putih",
        aspect: "Navigasi Mandiri Jalur Guiding Block",
        score: Score.MANDIRI,
        findings: "Fajar sangat terampil menyusuri tactile paving lantai sekolah dari kelas menuju toilet.",
        recommendation: "Latihan navigasi area outdoor dan tangga lantai dua.",
      },
      {
        studentId: studentBella.id,
        teacherId: guruAhmad.id,
        category: "Keterampilan Vokasional",
        title: "Asesmen Keterampilan Tata Boga Adaptif",
        aspect: "Mengukur Bahan Kue Kering dengan Sendok Takar",
        score: Score.DENGAN_BANTUAN,
        findings: "Bella antusias mencampur adonan, membutuhkan bantuan stabilisasi mangkuk.",
        recommendation: "Gunakan mangkuk karet anti-selip pada meja praktik.",
      },
      {
        studentId: studentRendy.id,
        teacherId: guruAhmad.id,
        category: "Sosial Emosional",
        title: "Asesmen Regulasi Diri di Lingkungan Kerja",
        aspect: "Menjaga Ketenangan dan Fokus Selama 30 Menit",
        score: Score.MANDIRI,
        findings: "Rendy mampu bekerja menyusun kemasan tanpa interupsi atau tantrum.",
        recommendation: "Disiapkan untuk program magang kerja vokasi mandiri.",
      },

      // Guru Siti (SMPLB)
      {
        studentId: studentSiti.id,
        teacherId: guruSiti.id,
        category: "Bahasa & Komunikasi",
        title: "Asesmen Bahasa Isyarat BISINDO & Fonemik",
        aspect: "Penguasaan 50 Kosakata Isyarat Benda Sekolah",
        score: Score.MANDIRI,
        findings: "Siti sangat ekspresif dan menguasai isyarat untuk meja, kursi, buku, guru, teman, dan kantin.",
        recommendation: "Mulai diperkenalkan pembentukan kalimat berpola Subjek-Predikat-Objek.",
      },
      {
        studentId: studentFarhan.id,
        teacherId: guruSiti.id,
        category: "Bahasa & Komunikasi",
        title: "Asesmen Artikulasi & Membaca Ujaran (Lip Reading)",
        aspect: "Mengenali Gerak Bibir Kata Benda Pokok",
        score: Score.DENGAN_BANTUAN,
        findings: "Farhan mengenali 7 dari 10 kata yang diucapkan guru tanpa suara.",
        recommendation: "Latihan artikulasi cermin di ruang bina bicara 2 kali seminggu.",
      },
      {
        studentId: studentKevin.id,
        teacherId: guruSiti.id,
        category: "Bina Diri (ADL)",
        title: "Asesmen Pengelolaan Uang Saku & Belanja Kantin",
        aspect: "Menghitung Uang Pas Pecahan Rp5.000",
        score: Score.DENGAN_BANTUAN,
        findings: "Kevin mengenali warna uang kertas namun masih bingung dengan uang kembalian.",
        recommendation: "Simulasi role-play transaksi belanja di kelas.",
      },
      {
        studentId: studentAisyah.id,
        teacherId: guruSiti.id,
        category: "Sosial Emosional",
        title: "Asesmen Kerjasama Proyek Kelompok",
        aspect: "Bekerja Sama Membuat Mading Sekolah",
        score: Score.MANDIRI,
        findings: "Aisyah sangat aktif membantu menggunting dan menempel artikel mading bersama Siti.",
        recommendation: "Beri peran sebagai koordinator tim mading berikutnya.",
      },

      // Guru Agus (TKLB)
      {
        studentId: studentAnnisa.id,
        teacherId: guruAgus.id,
        category: "Sosial Emosional",
        title: "Asesmen Interaksi Teman Sebaya Dini",
        aspect: "Berbagi Mainan Sensori Pasir Ajaib",
        score: Score.DENGAN_BANTUAN,
        findings: "Annisa mau bermain berdampingan dan berbagi cetakan saat diarahkan oleh guru.",
        recommendation: "Perbanyak aktivitas bermain kelompok kecil 2-3 anak.",
      },
      {
        studentId: studentKenzo.id,
        teacherId: guruAgus.id,
        category: "Motorik Kasar & Halus",
        title: "Asesmen Sensori Taktil & Visual",
        aspect: "Menyentuh Tekstur Halus, Kasar, dan Lembek",
        score: Score.DENGAN_BANTUAN,
        findings: "Kenzo awalnya menolak menyentuh gel dingin, namun setelah modeling 5 menit mau meraba ujung jari.",
        recommendation: "Desensitisasi taktil secara bertahap 10 menit setiap pagi.",
      },
      {
        studentId: studentBilal.id,
        teacherId: guruAgus.id,
        category: "Sosial Emosional",
        title: "Asesmen Rentang Atensi & Kontrol Impuls",
        aspect: "Duduk Tenang Melingkar Selama 10 Menit",
        score: Score.BELUM_MAMPU,
        findings: "Bilal sering bangkit dari kursi setelah 3 menit dan memerlukan fidget toy peredam gerak.",
        recommendation: "Gunakan bantal sensori duduk dan jeda gerak setiap 5 menit.",
      },
      {
        studentId: studentClarissa.id,
        teacherId: guruAgus.id,
        category: "Bahasa & Komunikasi",
        title: "Asesmen Pra-Wicara & Tiruan Bunyi",
        aspect: "Menirukan Bunyi Hewan Sederhana (Mbe, Guk, Meong)",
        score: Score.DENGAN_BANTUAN,
        findings: "Clarissa tersenyum dan mampu menirukan suara 'Meong' dengan intonasi tepat.",
        recommendation: "Tingkatkan stimulasi buku bergambar bersuara.",
      },
    ],
  });

  // 10. Create PPI Plans & Evaluations for Students
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

  await prisma.ppiEvaluation.createMany({
    data: [
      {
        ppiPlanId: ppiRizky.id,
        score: Score.DENGAN_BANTUAN,
        narrativeNotes: "Rizky mencuci tangan dengan bantuan prompting verbal pada langkah membersihkan sela jari.",
      },
      {
        ppiPlanId: ppiRizky.id,
        score: Score.MANDIRI,
        narrativeNotes: "Rizky mencuci tangan 6 langkah mandiri sesuai urutan poster visual tanpa bantuan guru sama sekali.",
      },
    ],
  });

  // PPI Dimas (Guru Ahmad)
  const ppiDimas = await prisma.ppiPlan.create({
    data: {
      studentId: studentDimas.id,
      teacherId: guruAhmad.id,
      academicYear: "2026/2027 Ganjil",
      currentCapability: "Dimas menguasai huruf Braille vokal dan mampu melakukan navigasi mandiri di dalam ruang kelas menggunakan tongkat.",
      longTermGoal: "Mampu membaca 1 paragraf teks Braille mandiri dan bernavigasi dari kelas menuju perpustakaan sekolah.",
      shortTermGoal: "1) Mengetik 10 kata pada mesin Reglet Braille. 2) Menghafal rute lorong lantai 1.",
    },
  });

  await prisma.ppiEvaluation.createMany({
    data: [
      {
        ppiPlanId: ppiDimas.id,
        score: Score.DENGAN_BANTUAN,
        narrativeNotes: "Dimas berhasil mengetik 7 dari 10 kata pada Reglet dengan bimbingan posisi baris.",
      },
      {
        ppiPlanId: ppiDimas.id,
        score: Score.MANDIRI,
        narrativeNotes: "Dimas menyelesaikan 10 kata Braille pada Reglet mandiri dengan akurasi 100%.",
      },
    ],
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
      narrativeNotes: "Siti dengan penuh senyum mengisyaratkan sapaan pagi kepada seluruh teman di kelas secara mandiri.",
    },
  });

  // PPI Kenzo (Guru Agus)
  const ppiKenzo = await prisma.ppiPlan.create({
    data: {
      studentId: studentKenzo.id,
      teacherId: guruAgus.id,
      academicYear: "2026/2027 Ganjil",
      currentCapability: "Sensitif terhadap suara keras dan sentuhan tekstur basah. Kontak mata 2-3 detik.",
      longTermGoal: "Mampu menoleransi stimulasi taktil basah (playdough/pasir) dan mengikuti instruksi baris pagi.",
      shortTermGoal: "1) Meremas playdough selama 5 menit tanpa menangis. 2) Duduk tenang saat mendengarkan musik relaksasi.",
    },
  });

  await prisma.ppiEvaluation.create({
    data: {
      ppiPlanId: ppiKenzo.id,
      score: Score.DENGAN_BANTUAN,
      narrativeNotes: "Kenzo berhasil meremas playdough warna kuning selama 4 menit didampingi guru Agus.",
    },
  });

  // 11. Create Multi-Entry Daily Journals (Buku Penghubung Guru-Ortu)
  await prisma.dailyJournal.createMany({
    data: [
      // Rizky (Kelas 2 SDLB - Ayah Hendra)
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
        studentId: studentBudi.id,
        teacherId: guruDewi.id,
        mood: "Tenang",
        healthCondition: "Sehat",
        eatingNote: "Makan bekal roti & susu habis",
        learningActivity: "Budi latihan menulis menggunakan pensil grip adaptif dan menyelesaikan lembar kerja mewarnai bentuk apel dengan rapi.",
        parentFeedback: "Terima kasih Bu Dewi, di rumah Budi semakin bersemangat menggambar.",
      },
      // Dimas (Kelas 11 SMALB - Ibu Ratna)
      {
        studentId: studentDimas.id,
        teacherId: guruAhmad.id,
        mood: "Tenang & Kooperatif",
        healthCondition: "Sehat bugar",
        eatingNote: "Makan bekal nasi ayam habis",
        learningActivity: "Dimas sangat antusias belajar membaca pola timbul cerita fabel pendek dengan teks Braille dan navigasi lorong sekolah.",
        parentFeedback: "Terima kasih Pak Ahmad, Dimas di rumah senang menceritakan kembali kisah fabel yang dibacanya.",
      },
      // Siti (Kelas 8 SMPLB - Ibu Ratna)
      {
        studentId: studentSiti.id,
        teacherId: guruSiti.id,
        mood: "Gembira & Ceria",
        healthCondition: "Sehat",
        eatingNote: "Makan buah apel dan bekal mie goreng",
        learningActivity: "Siti memimpin kelompok belajar dalam mempraktikkan isyarat nama-nama hari dan bulan dengan penuh percaya diri.",
        parentFeedback: "Hebat Siti! Terima kasih Bu Siti atas motivasi dan kasih sayangnya.",
      },
      // Kenzo (Kelas TKLB - Ibu Maya)
      {
        studentId: studentKenzo.id,
        teacherId: guruAgus.id,
        mood: "Ceria & Mau Mencoba",
        healthCondition: "Sehat",
        eatingNote: "Makan biskuit dan minum air putih habis",
        learningActivity: "Kenzo mengikuti sesi terapi sensori playdough tanpa tantrum dan mau meremas adonan bersama teman sekelas.",
        parentFeedback: "Senang sekali mendengarnya Pak Agus! Di rumah kami juga sediakan playdough warna-warni.",
      },
      // Annisa (Kelas TKLB - Ibu Maya)
      {
        studentId: studentAnnisa.id,
        teacherId: guruAgus.id,
        mood: "Gembira",
        healthCondition: "Sehat",
        eatingNote: "Makan bekal nasi kuning habis dibantu guru",
        learningActivity: "Annisa belajar menyusun balok kayu menara 5 susun dan bernyanyi bersama gerak tubuh.",
        parentFeedback: "Terima kasih Pak Agus atas kesabarannya mendampingi Annisa.",
      },
    ],
  });

  // 12. Create Activity Logs
  await prisma.activityLog.createMany({
    data: [
      {
        userId: adminUser.id,
        userName: adminUser.name || "Super Admin",
        userRole: Role.ADMIN,
        action: "CREATE",
        entity: "Foundation",
        description: "Inisialisasi profil resmi dan identitas sekolah SLB Harapan Mulia",
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
      {
        userId: guruSiti.id,
        userName: guruSiti.name || "Guru Siti",
        userRole: Role.GURU,
        action: "JOURNAL",
        entity: "Journal",
        description: "Mengisi catatan perkembangan harian Siti Nurhaliza pada Kelas 8 SMPLB",
        foundationId: yayasanHarapan.id,
      },
      {
        userId: guruAgus.id,
        userName: guruAgus.name || "Guru Agus",
        userRole: Role.GURU,
        action: "ASSESSMENT",
        entity: "Assessment",
        description: "Melakukan asesmen terapi sensori playdough untuk Kenzo Alvino pada Kelas TKLB",
        foundationId: yayasanHarapan.id,
      },
    ],
  });

  console.log("✨ Seeding selesai sukses! 16 Siswa, 4 Guru, dan 4 Akun Demo Orang Tua telah siap digunakan.");
}

main()
  .catch((e) => {
    console.error("❌ Error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
