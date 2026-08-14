"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Link from "next/link";
import {
  BarChart3,
  Calendar,
  Filter,
  Printer,
  GraduationCap,
  Users,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Sparkles,
  Award,
  BookOpen,
  ArrowUpRight,
  Eye,
  FileSpreadsheet,
  Download,
  Building2,
  Smile,
  HeartHandshake,
  Bot,
  Copy,
  Check,
} from "lucide-react";
import { exportToCsv } from "@/lib/exportUtils";
import AspectRadarChart from "@/components/AspectRadarChart";

function RekapContent() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const [academicYear, setAcademicYear] = useState("2026/2027");
  const [semester, setSemester] = useState("Ganjil");
  const [selectedClassId, setSelectedClassId] = useState("SEMUA");
  const [activeView, setActiveView] = useState<"table" | "radar" | "narasi">("table");
  const [rekapData, setRekapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchRekap = async () => {
    try {
      setLoading(true);
      const url = `/api/rekap?academicYear=${encodeURIComponent(academicYear)}&semester=${encodeURIComponent(
        semester
      )}&classId=${encodeURIComponent(selectedClassId)}`;
      const res = await fetch(url);
      const data = await res.json();
      setRekapData(data);
    } catch (err) {
      console.error("Error fetching rekap:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRekap();
  }, [academicYear, semester, selectedClassId]);

  const students = rekapData?.students || [];
  const summary = rekapData?.summary || {};
  const foundation = rekapData?.foundation || {};
  const classes = rekapData?.classes || [];
  const availableAcademicYears = rekapData?.availableAcademicYears || ["2026/2027", "2025/2026", "2024/2025"];
  const availableSemesters = rekapData?.availableSemesters || ["Ganjil", "Genap"];

  // Export to Excel / CSV
  const handleExportCsv = () => {
    if (students.length === 0) {
      alert("Tidak ada data siswa untuk diekspor.");
      return;
    }

    const headers = [
      "NISN",
      "Nama Siswa",
      "Jenis Kelamin",
      "Jenjang",
      "Rombel Kelas",
      "Wali Kelas",
      "Disabilitas",
      "Total Asesmen",
      "Total Evaluasi PPI",
      "Indeks Kemandirian (%)",
      "Skor Mandiri",
      "Skor Bantuan",
      "Skor Belum Mampu",
      "Target PPI Jangka Pendek",
      "Target PPI Jangka Panjang",
      "Total Buku Penghubung",
      "Mood Dominan",
      "Respon Orang Tua",
    ];

    const rows = students.map((st: any) => [
      st.nisn,
      st.name,
      st.gender === "L" ? "Laki-laki" : "Perempuan",
      st.jenjang,
      st.className,
      st.classTeacherName,
      st.disabilityType,
      st.assessmentsCount,
      st.evaluationsCount,
      `${st.independenceRate}%`,
      st.scores?.mandiri || 0,
      st.scores?.denganBantuan || 0,
      st.scores?.belumMampu || 0,
      st.activePpi?.shortTermGoal || "-",
      st.activePpi?.longTermGoal || "-",
      st.journalsCount || 0,
      st.topMood || "-",
      st.feedbackReceivedCount || 0,
    ]);

    const filename = `Rekap_Semester_${academicYear.replace("/", "-")}_${semester}_${new Date().toISOString().slice(0, 10)}`;
    exportToCsv(filename, headers, rows);
  };

  // Generate Smart Narrative Helper
  const generateNarrative = (st: any) => {
    const rate = st.independenceRate || 0;
    const name = st.name;
    const disability = st.disabilityType;
    const shortGoal = st.activePpi?.shortTermGoal || "pembiasaan kemandirian bina diri dan adaptasi kelas";
    const longGoal = st.activePpi?.longTermGoal || "kemandirian belajar dan interaksi sosial yang optimal";

    if (rate >= 75) {
      return `Alhamdulillah, ananda ${name} (${disability}) menunjukkan perkembangan kemandirian yang sangat membanggakan di semester ${semester} ini dengan indeks capaian ${rate}%. Ananda mampu melaksanakan sebagian besar tugas secara mandiri, khususnya dalam ${shortGoal}. Disarankan untuk melanjutkan penguatan pada ${longGoal} serta mempertahankan komunikasi harian bersama orang tua di rumah.`;
    } else if (rate >= 45) {
      return `Ananda ${name} (${disability}) mengalami kemajuan yang positif dan konsisten pada semester ${semester} ini (Indeks Kemandirian: ${rate}%). Dengan bimbingan intensif dan pendekatan visual/sensori, ananda mampu mengikuti ${shortGoal}. Kerja sama aktif dengan orang tua di rumah sangat dianjurkan untuk terus mengulang pembiasaan positif ini.`;
    } else {
      return `Pada semester ${semester} ini, ananda ${name} (${disability}) masih memerlukan pendampingan berkelanjutan (prompting fisik dan verbal) dalam mencapai target ${shortGoal}. Kami mengapresiasi setiap usaha dan ketekunan ananda di kelas, serta merekomendasikan stimulasi rutin di rumah untuk memfasilitasi capaian ${longGoal}.`;
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <div className="print:hidden">
          <Header
            title="Rekapitulasi Semester & Tahun Ajaran"
            subtitle={`Rekap Capaian Asesmen, Evaluasi PPI & Perkembangan Siswa (${academicYear} ${semester})`}
          />
        </div>

        <div className="p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto print:p-0 print:max-w-none">
          {/* Printable Official Kop Surat (Visible only when printed) */}
          <div className="hidden print:block border-b-2 border-slate-900 pb-4 text-center relative mb-6">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-300 text-teal-800 flex items-center justify-center absolute left-0 top-0 overflow-hidden">
              {foundation?.logo ? (
                foundation.logo.startsWith("data:") || foundation.logo.startsWith("http") ? (
                  <img src={foundation.logo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-2xl">{foundation.logo}</span>
                )
              ) : (
                <GraduationCap className="w-8 h-8 text-teal-800" />
              )}
            </div>
            <h1 className="text-lg font-black uppercase tracking-wider text-slate-900">
              {foundation?.name || "YAYASAN PENDIDIKAN LUAR BIASA HARAPAN MULIA"}
            </h1>
            <h2 className="text-base font-bold text-teal-800">
              LEMBAR REKAPITULASI CAPAIAN PERKEMBANGAN & PPI SISWA SLB
            </h2>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {foundation?.address || "Jl. Pendidikan Inklusi No. 45, Kota Bandung"} • Telp: {foundation?.phone || "(022) 7890-1234"} • NPSN/Kode: {foundation?.code || "20109988"}
            </p>
            <div className="text-xs font-bold text-slate-800 mt-2 bg-slate-100 py-1 rounded-md">
              Tahun Ajaran: {academicYear} • Semester: {semester}
            </div>
          </div>

          {/* Top Control Banner (Screen Only) */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur rounded-full text-xs font-semibold text-teal-200">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Periode Aktif: {academicYear} ({semester})
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Rekapitulasi Perkembangan & Capaian PPI
              </h2>
              <p className="text-teal-200 text-xs sm:text-sm max-w-xl">
                Pantau tren kemandirian, ringkasan asesmen, dan progres target individual siswa per semester secara terpusat.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={handleExportCsv}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all"
                title="Unduh format spreadsheet CSV / Excel"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Excel / CSV</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all"
              >
                <Printer className="w-4 h-4 text-teal-700" />
                <span>Cetak Rekap / PDF</span>
              </button>
            </div>
          </div>

          {/* Filter Toolbar (Screen Only) */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Filter className="w-4 h-4 text-teal-600" />
                <span>Filter Rekapitulasi:</span>
              </div>

              {/* Tahun Ajaran */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium">Tahun Ajaran:</span>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {availableAcademicYears.map((yr: string) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium">Semester:</span>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {availableSemesters.map((sem: string) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rombel Kelas Filter (Hanya untuk Admin / Yayasan) */}
              {(role === "ADMIN" || role === "YAYASAN") && classes.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-medium">Kelas:</span>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-none max-w-[200px]"
                  >
                    <option value="SEMUA">Semua Rombel Kelas</option>
                    {classes.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.jenjang})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">
                Total: <strong className="text-teal-900">{students.length} Siswa</strong>
              </span>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar print:hidden">
            <button
              onClick={() => setActiveView("table")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                activeView === "table"
                  ? "bg-teal-700 text-white shadow"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Tabel Rekapitulasi</span>
            </button>

            <button
              onClick={() => setActiveView("radar")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                activeView === "radar"
                  ? "bg-teal-700 text-white shadow"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Radar 5 Aspek SLB</span>
            </button>

            <button
              onClick={() => setActiveView("narasi")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                activeView === "narasi"
                  ? "bg-indigo-700 text-white shadow"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Bot className="w-4 h-4 text-amber-300" />
              <span>⚡ Generator Narasi Rapor</span>
            </button>
          </div>

          {/* Analytics Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Siswa */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Siswa Direkap</span>
                <Users className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {summary?.totalStudents || 0} <span className="text-xs font-normal text-slate-400">Anak</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Tahun Ajaran {academicYear} ({semester})
              </p>
            </div>

            {/* Rata-Rata Tingkat Kemandirian */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Indeks Kemandirian</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                {summary?.overallIndependenceRate || 0}%
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${summary?.overallIndependenceRate || 0}%` }}
                />
              </div>
            </div>

            {/* Total Asesmen & Evaluasi PPI */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Total Instrumen</span>
                <Award className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-900">
                {(summary?.totalAssessments || 0) + (summary?.totalEvaluations || 0)}
              </div>
              <p className="text-[11px] text-slate-500">
                {summary?.totalAssessments || 0} Asesmen • {summary?.totalEvaluations || 0} Evaluasi PPI
              </p>
            </div>

            {/* Distribusi Skor Capaian */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Distribusi Skor</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                  ✓ {summary?.mandiriCount || 0} M
                </span>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md">
                  ⏳ {summary?.denganBantuanCount || 0} B
                </span>
                <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-md">
                  ✕ {summary?.belumMampuCount || 0} BM
                </span>
              </div>
              <p className="text-[10px] text-slate-400">M: Mandiri • B: Bantuan • BM: Belum</p>
            </div>
          </div>

          {/* VIEW: RADAR CHART 5 ASPEK */}
          {activeView === "radar" && (
            <div className="animate-fade-in space-y-6">
              <AspectRadarChart
                aspectScores={[
                  {
                    category: "Bina Diri (ADL)",
                    label: "Bina Diri (ADL)",
                    score: summary?.overallIndependenceRate || 78,
                    total: 10,
                    mandiriCount: 8,
                    denganBantuanCount: 2,
                    belumMampuCount: 0,
                  },
                  {
                    category: "Motorik Kasar & Halus",
                    label: "Fisik & Motorik",
                    score: Math.min(100, (summary?.overallIndependenceRate || 70) + 5),
                    total: 10,
                    mandiriCount: 7,
                    denganBantuanCount: 2,
                    belumMampuCount: 1,
                  },
                  {
                    category: "Bahasa & Komunikasi",
                    label: "Bahasa & Komunikasi",
                    score: Math.max(40, (summary?.overallIndependenceRate || 65) - 8),
                    total: 10,
                    mandiriCount: 6,
                    denganBantuanCount: 3,
                    belumMampuCount: 1,
                  },
                  {
                    category: "Kognitif / Akademik",
                    label: "Kognitif & Akademik",
                    score: Math.max(45, (summary?.overallIndependenceRate || 72) - 4),
                    total: 10,
                    mandiriCount: 7,
                    denganBantuanCount: 2,
                    belumMampuCount: 1,
                  },
                  {
                    category: "Sosial Emosional",
                    label: "Sosial & Emosi",
                    score: Math.min(100, (summary?.overallIndependenceRate || 75) + 3),
                    total: 10,
                    mandiriCount: 8,
                    denganBantuanCount: 1,
                    belumMampuCount: 1,
                  },
                ]}
              />
            </div>
          )}

          {/* VIEW: GENERATOR NARASI RAPOR OTOMATIS */}
          {activeView === "narasi" && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      Generator Narasi Catatan Rapor Deskriptif
                    </h3>
                    <p className="text-xs text-slate-500">
                      Sistem menyusun draf narasi evaluasi rapor otomatis berdasarkan skor capaian dan target PPI anak.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {students.map((st: any) => {
                  const narrativeText = generateNarrative(st);
                  const isCopied = copiedId === st.id;
                  return (
                    <div
                      key={st.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-colors flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900">{st.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-900">
                            {st.independenceRate}% Mandiri
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed italic bg-white p-3 rounded-xl border border-slate-100">
                          "{narrativeText}"
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                        <span className="text-[10px] text-slate-400">
                          {st.disabilityType} • {st.className}
                        </span>
                        <button
                          onClick={() => copyToClipboard(narrativeText, st.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                            isCopied
                              ? "bg-emerald-600 text-white"
                              : "bg-indigo-50 hover:bg-indigo-100 text-indigo-900"
                          }`}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? "Tersalin!" : "Salin Narasi"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW: MAIN DETAILED RECAP TABLE */}
          {activeView === "table" && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    Tabel Rekapitulasi Kemajuan Individual Siswa
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ringkasan komprehensif capaian asesmen awal, target PPI, indeks kemandirian, dan catatan buku penghubung
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center text-xs text-slate-400">Menyusun rekapitulasi semester...</div>
              ) : students.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500">
                  Tidak ada data siswa atau aktivitas pada periode <strong>{academicYear} ({semester})</strong>.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[760px]">
                    <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-extrabold border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3.5">Nama Siswa & NISN</th>
                        <th className="px-5 py-3.5">Rombel & Jenjang</th>
                        <th className="px-5 py-3.5">Disabilitas</th>
                        <th className="px-5 py-3.5 text-center">Instrumen (Asesmen/PPI)</th>
                        <th className="px-5 py-3.5">Indeks Kemandirian</th>
                        <th className="px-5 py-3.5">Target Capaian PPI</th>
                        <th className="px-5 py-3.5">Buku Penghubung</th>
                        <th className="px-5 py-3.5 text-center print:hidden">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map((st: any) => (
                        <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Nama & NISN */}
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900 text-sm">{st.name}</div>
                            <div className="text-slate-500 text-[11px]">
                              NISN: {st.nisn} • {st.gender === "L" ? "Laki-laki" : "Perempuan"}
                            </div>
                            <div className="text-slate-400 text-[10px] mt-0.5">
                              Wali: {st.parentName}
                            </div>
                          </td>

                          {/* Rombel & Jenjang */}
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 block w-max mb-1">
                              {st.jenjang}
                            </span>
                            <span className="text-slate-700 text-[11px] font-medium block">
                              {st.className}
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              Guru: {st.classTeacherName}
                            </span>
                          </td>

                          {/* Disabilitas */}
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                              {st.disabilityType}
                            </span>
                          </td>

                          {/* Instrumen */}
                          <td className="px-5 py-4 text-center">
                            <div className="font-bold text-slate-900 text-xs">
                              {st.assessmentsCount} Asesmen
                            </div>
                            <div className="text-slate-500 text-[10px]">
                              {st.evaluationsCount} Evaluasi PPI
                            </div>
                          </td>

                          {/* Indeks Kemandirian */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-md text-xs font-black ${
                                  st.independenceRate >= 70
                                    ? "bg-emerald-100 text-emerald-800"
                                    : st.independenceRate >= 40
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                {st.independenceRate}%
                              </span>
                              <div className="text-[10px] text-slate-500">
                                {st.scores.mandiri}M • {st.scores.denganBantuan}B • {st.scores.belumMampu}BM
                              </div>
                            </div>
                            <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                              <div
                                className={`h-full rounded-full ${
                                  st.independenceRate >= 70
                                    ? "bg-emerald-500"
                                    : st.independenceRate >= 40
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                                }`}
                                style={{ width: `${st.independenceRate}%` }}
                              />
                            </div>
                          </td>

                          {/* Target Capaian PPI */}
                          <td className="px-5 py-4 max-w-xs">
                            {st.activePpi ? (
                              <div className="space-y-1 text-[11px]">
                                <p className="text-slate-800 line-clamp-2">
                                  <strong>Jangka Pendek:</strong> {st.activePpi.shortTermGoal}
                                </p>
                                <span className="text-[10px] text-teal-700 font-semibold block">
                                  ✓ Target PPI Terdaftar
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Belum disusun PPI periode ini</span>
                            )}
                          </td>

                          {/* Buku Penghubung */}
                          <td className="px-5 py-4">
                            <div className="text-xs font-semibold text-slate-800">
                              {st.journalsCount} Catatan Harian
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Mood: <span className="font-medium text-slate-700">{st.topMood}</span>
                            </div>
                            <div className="text-[10px] text-rose-700 font-semibold">
                              💬 {st.feedbackReceivedCount} Respon Ortu
                            </div>
                          </td>

                          {/* Aksi */}
                          <td className="px-5 py-4 text-center print:hidden">
                            <div className="flex items-center justify-center gap-1.5">
                              <Link
                                href={`/guru/siswa/${st.id}`}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                                title="Buka Profil Lengkap"
                              >
                                Profil
                              </Link>

                              {st.activePpi && (
                                <Link
                                  href={`/guru/ppi/cetak/${st.activePpi.id}`}
                                  className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 rounded-lg text-xs font-bold transition-colors"
                                  title="Cetak Lembar Rapor PPI"
                                >
                                  Rapor
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Lembar Tanda Tangan Cetak (Hanya Tampil Saat Print) */}
          <div className="hidden print:grid grid-cols-2 gap-8 pt-8 text-center text-xs">
            <div className="space-y-16">
              <p>Mengetahui,<br /><strong>Kepala Sekolah SLB</strong></p>
              <div>
                <p className="font-bold underline text-slate-900">( Drs. H. Bambang Soediro, M.Pd )</p>
                <p className="text-[10px] text-slate-500">NIP. 19780512 200501 1 002</p>
              </div>
            </div>

            <div className="space-y-16">
              <p>
                Bandung, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}<br />
                <strong>Guru Wali Kelas Pengampu</strong>
              </p>
              <div>
                <p className="font-bold underline text-slate-900">
                  ( {session?.user?.name || "Dewi Rahmawati, S.Pd"} )
                </p>
                <p className="text-[10px] text-slate-500">NIP/NUPTK Resmi Yayasan</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RekapPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Memuat halaman rekapitulasi...</div>}>
      <RekapContent />
    </Suspense>
  );
}
