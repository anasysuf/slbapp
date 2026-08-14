/**
 * Export data array to CSV file with UTF-8 BOM support for Microsoft Excel
 */
export function exportToCsv(filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]) {
  // Add UTF-8 Byte Order Mark (BOM) so Excel properly detects UTF-8 characters and Indonesian accents
  const BOM = "\uFEFF";

  const csvContent = rows.map((row) => {
    return row
      .map((val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(",");
  });

  const fullCsv = BOM + [headers.map((h) => `"${h}"`).join(","), ...csvContent].join("\r\n");

  const blob = new Blob([fullCsv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 1. Rekap Khusus Data Siswa
export function exportStudentsToCsv(students: any[], filename = "Rekap_Data_Siswa_SLB") {
  const headers = [
    "No",
    "Nama Siswa",
    "NISN",
    "Jenis Kelamin",
    "Klasifikasi Disabilitas",
    "Jenjang",
    "Kelas",
    "Nama Orang Tua / Wali",
    "Kontak Orang Tua",
    "Jumlah Asesmen",
    "Jumlah Target PPI",
  ];

  const rows = students.map((s, idx) => [
    idx + 1,
    s.name || "-",
    s.nisn || "-",
    s.gender === "P" ? "Perempuan" : "Laki-laki",
    s.disabilityType || "-",
    s.jenjang || "-",
    s.classes?.[0]?.class?.name || s.className || "Belum ada kelas",
    s.parent?.name || "-",
    s.parent?.phone || "-",
    s._count?.assessments || 0,
    s._count?.ppiPlans || 0,
  ]);

  exportToCsv(filename, headers, rows);
}

// 2. Rekap Khusus Data Guru
export function exportTeachersToCsv(teachers: any[], filename = "Rekap_Data_Guru_SLB") {
  const headers = [
    "No",
    "Nama Guru",
    "Email",
    "Nomor Telepon/WA",
    "Rombel Kelas Binaan",
    "Tanggal Terdaftar",
  ];

  const rows = teachers.map((t, idx) => [
    idx + 1,
    t.name || "-",
    t.email || "-",
    t.phone || "-",
    t.classesTaught?.map((c: any) => `${c.name} (${c.jenjang})`).join("; ") || "Belum ditugaskan",
    new Date(t.createdAt).toLocaleDateString("id-ID"),
  ]);

  exportToCsv(filename, headers, rows);
}

// 3. Rekap Khusus Data Orang Tua
export function exportParentsToCsv(parents: any[], filename = "Rekap_Data_Orang_Tua_SLB") {
  const headers = [
    "No",
    "Nama Orang Tua / Wali",
    "Email",
    "Nomor WhatsApp",
    "Daftar Anak / Siswa",
    "Jumlah Anak",
    "Tanggal Terdaftar",
  ];

  const rows = parents.map((p, idx) => [
    idx + 1,
    p.name || "-",
    p.email || "-",
    p.phone || "-",
    p.students?.map((st: any) => `${st.name} (${st.disabilityType})`).join("; ") || "-",
    p.students?.length || 0,
    new Date(p.createdAt).toLocaleDateString("id-ID"),
  ]);

  exportToCsv(filename, headers, rows);
}

// 4. Rekap Khusus Data Kelas
export function exportClassesToCsv(classes: any[], filename = "Rekap_Data_Rombel_Kelas_SLB") {
  const headers = [
    "No",
    "Nama Rombel Kelas",
    "Jenjang",
    "Guru Wali Kelas",
    "Jumlah Siswa",
    "Daftar Siswa",
  ];

  const rows = classes.map((c, idx) => [
    idx + 1,
    c.name || "-",
    c.jenjang || "-",
    c.teacher?.name || "Belum ditugaskan",
    c._count?.students || c.students?.length || 0,
    c.students?.map((cs: any) => cs.student?.name || cs.name).join("; ") || "-",
  ]);

  exportToCsv(filename, headers, rows);
}

// 5. Rekap Khusus Asesmen
export function exportAssessmentsToCsv(assessments: any[], filename = "Rekap_Data_Asesmen_SLB") {
  const headers = [
    "No",
    "Nama Siswa",
    "NISN",
    "Klasifikasi Disabilitas",
    "Kategori Asesmen",
    "Aspek Perkembangan",
    "Tingkat Kemampuan (Skor)",
    "Temuan & Deskripsi Guru",
    "Guru Penilai",
    "Tanggal Asesmen",
  ];

  const rows = assessments.map((a, idx) => [
    idx + 1,
    a.student?.name || "-",
    a.student?.nisn || "-",
    a.student?.disabilityType || "-",
    a.category || "-",
    a.aspect || "-",
    a.score || "-",
    a.findings || "-",
    a.teacher?.name || "-",
    new Date(a.assessmentDate).toLocaleDateString("id-ID"),
  ]);

  exportToCsv(filename, headers, rows);
}

// 6. Rekap Khusus PPI
export function exportPpiToCsv(ppiPlans: any[], filename = "Rekap_Data_Program_PPI_SLB") {
  const headers = [
    "No",
    "Nama Siswa",
    "Tahun Ajaran",
    "Kemampuan Awal (Baseline)",
    "Tujuan Jangka Panjang",
    "Target Jangka Pendek",
    "Layanan Akomodasi",
    "Status PPI",
    "Jumlah Evaluasi",
    "Tanggal Disusun",
  ];

  const rows = ppiPlans.map((p, idx) => [
    idx + 1,
    p.student?.name || "-",
    p.academicYear || "-",
    p.currentCapability || "-",
    p.longTermGoal || "-",
    p.shortTermGoal || "-",
    p.accommodations || "-",
    p.status || "AKTIF",
    p.evaluations?.length || p._count?.evaluations || 0,
    new Date(p.createdAt).toLocaleDateString("id-ID"),
  ]);

  exportToCsv(filename, headers, rows);
}

// 7. Rekap Khusus Jurnal Harian
export function exportJournalsToCsv(journals: any[], filename = "Rekap_Buku_Penghubung_Harian") {
  const headers = [
    "No",
    "Nama Siswa",
    "Tanggal",
    "Suasana Hati (Mood)",
    "Kondisi Fisik & Kesehatan",
    "Catatan Makan",
    "Aktivitas Terapi & Belajar",
    "Respon Orang Tua",
    "Guru Pencatat",
  ];

  const rows = journals.map((j, idx) => [
    idx + 1,
    j.student?.name || "-",
    new Date(j.date).toLocaleDateString("id-ID"),
    j.mood || "-",
    j.healthCondition || "-",
    j.eatingNote || "-",
    j.learningActivity || "-",
    j.parentFeedback || "Belum ada respon",
    j.teacher?.name || "-",
  ]);

  exportToCsv(filename, headers, rows);
}

// 8. Rekap Khusus Log Aktivitas
export function exportLogsToCsv(logs: any[], filename = "Rekap_Audit_Log_Aktivitas_SLB") {
  const headers = [
    "No",
    "Waktu",
    "Nama Pengguna",
    "Peran (Role)",
    "Tipe Aksi",
    "Entitas",
    "Deskripsi Aktivitas",
  ];

  const rows = logs.map((l, idx) => [
    idx + 1,
    new Date(l.createdAt).toLocaleString("id-ID"),
    l.userName || "-",
    l.userRole || "-",
    l.action || "-",
    l.entity || "-",
    l.description || "-",
  ]);

  exportToCsv(filename, headers, rows);
}

// 9. Rekap Komprehensif Seluruh Data (All Master & Operational Data)
export function exportComprehensiveAllDataToCsv(data: any, schoolName = "Portal_SLB") {
  const filename = `Rekap_Komprehensif_Seluruh_Data_${schoolName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}`;

  const headers = [
    "KATEGORI DATA",
    "KOLOM 1",
    "KOLOM 2",
    "KOLOM 3",
    "KOLOM 4",
    "KOLOM 5",
    "KOLOM 6",
    "KOLOM 7",
    "KOLOM 8",
  ];

  const rows: (string | number)[][] = [];

  // Ringkasan
  rows.push(["=== RINGKASAN DATA SEKOLAH ===", "", "", "", "", "", "", "", ""]);
  rows.push(["Nama Sekolah", data.foundation?.name || "-", "Kode", data.foundation?.code || "-", "Tahun Ajaran", data.foundation?.academicYear || "2026/2027", "Semester", data.foundation?.semester || "Ganjil", ""]);
  rows.push(["Total Siswa", data.students?.length || 0, "Total Guru", data.teachers?.length || 0, "Total Orang Tua", data.parents?.length || 0, "Total Kelas", data.classes?.length || 0, "Total PPI", data.ppiPlans?.length || 0]);
  rows.push(["", "", "", "", "", "", "", "", ""]);

  // 1. Siswa
  rows.push(["=== MASTER DATA SISWA ===", "", "", "", "", "", "", "", ""]);
  rows.push(["Nama Siswa", "NISN", "Gender", "Disabilitas", "Jenjang", "Kelas", "Nama Ortu", "Kontak Ortu", "Target PPI"]);
  (data.students || []).forEach((s: any) => {
    rows.push([
      s.name,
      s.nisn,
      s.gender,
      s.disabilityType,
      s.jenjang || "-",
      s.classes?.[0]?.class?.name || "-",
      s.parent?.name || "-",
      s.parent?.phone || "-",
      s._count?.ppiPlans || 0,
    ]);
  });
  rows.push(["", "", "", "", "", "", "", "", ""]);

  // 2. Guru
  rows.push(["=== MASTER DATA GURU ===", "", "", "", "", "", "", "", ""]);
  rows.push(["Nama Guru", "Email", "No Telp/WA", "Rombel Kelas Binaan", "Terdaftar", "", "", "", ""]);
  (data.teachers || []).forEach((t: any) => {
    rows.push([
      t.name,
      t.email,
      t.phone || "-",
      t.classesTaught?.map((c: any) => c.name).join("; ") || "-",
      new Date(t.createdAt).toLocaleDateString("id-ID"),
      "", "", "", "",
    ]);
  });
  rows.push(["", "", "", "", "", "", "", "", ""]);

  // 3. Orang Tua
  rows.push(["=== MASTER DATA ORANG TUA ===", "", "", "", "", "", "", "", ""]);
  rows.push(["Nama Orang Tua", "Email", "No WhatsApp", "Anak / Siswa Ditautkan", "Terdaftar", "", "", "", ""]);
  (data.parents || []).forEach((p: any) => {
    rows.push([
      p.name,
      p.email,
      p.phone || "-",
      p.students?.map((s: any) => s.name).join("; ") || "-",
      new Date(p.createdAt).toLocaleDateString("id-ID"),
      "", "", "", "",
    ]);
  });
  rows.push(["", "", "", "", "", "", "", "", ""]);

  // 4. Kelas
  rows.push(["=== MASTER DATA ROMBEL KELAS ===", "", "", "", "", "", "", "", ""]);
  rows.push(["Nama Rombel", "Jenjang", "Wali Kelas", "Jumlah Siswa", "Daftar Siswa", "", "", "", ""]);
  (data.classes || []).forEach((c: any) => {
    rows.push([
      c.name,
      c.jenjang,
      c.teacher?.name || "-",
      c._count?.students || 0,
      c.students?.map((cs: any) => cs.student?.name).join("; ") || "-",
      "", "", "", "",
    ]);
  });
  rows.push(["", "", "", "", "", "", "", "", ""]);

  // 5. PPI
  rows.push(["=== DATA PROGRAM PEMBELAJARAN INDIVIDUAL (PPI) ===", "", "", "", "", "", "", "", ""]);
  rows.push(["Nama Siswa", "Tahun Ajaran", "Kemampuan Awal", "Tujuan Jangka Panjang", "Target Jangka Pendek", "Akomodasi", "Status", "Evaluasi", ""]);
  (data.ppiPlans || []).forEach((p: any) => {
    rows.push([
      p.student?.name || "-",
      p.academicYear || "-",
      p.currentCapability || "-",
      p.longTermGoal || "-",
      p.shortTermGoal || "-",
      p.accommodations || "-",
      p.status || "AKTIF",
      p.evaluations?.length || 0,
      "",
    ]);
  });
  rows.push(["", "", "", "", "", "", "", "", ""]);

  // 6. Asesmen
  rows.push(["=== DATA ASESMEN DIAGNOSTIK & KEMAMPUAN ===", "", "", "", "", "", "", "", ""]);
  rows.push(["Nama Siswa", "Kategori Asesmen", "Aspek", "Skor Kemampuan", "Temuan Guru", "Guru Penilai", "Tanggal", "", ""]);
  (data.assessments || []).forEach((a: any) => {
    rows.push([
      a.student?.name || "-",
      a.category || "-",
      a.aspect || "-",
      a.score || "-",
      a.findings || "-",
      a.teacher?.name || "-",
      new Date(a.assessmentDate).toLocaleDateString("id-ID"),
      "", "",
    ]);
  });
  rows.push(["", "", "", "", "", "", "", "", ""]);

  // 7. Jurnal
  rows.push(["=== BUKU PENGHUBUNG & JURNAL HARIAN ===", "", "", "", "", "", "", "", ""]);
  rows.push(["Nama Siswa", "Tanggal", "Mood", "Kondisi Fisik", "Catatan Makan", "Aktivitas Terapi & Belajar", "Respon Ortu", "Guru", ""]);
  (data.journals || []).forEach((j: any) => {
    rows.push([
      j.student?.name || "-",
      new Date(j.date).toLocaleDateString("id-ID"),
      j.mood || "-",
      j.healthCondition || "-",
      j.eatingNote || "-",
      j.learningActivity || "-",
      j.parentFeedback || "-",
      j.teacher?.name || "-",
      "",
    ]);
  });

  exportToCsv(filename, headers, rows);
}
