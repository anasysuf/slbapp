"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import {
  ClipboardCheck,
  PlusCircle,
  Filter,
  Search,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  AlertCircle,
  Calendar,
  UserCheck,
  Printer,
  ArrowRight,
  Target,
} from "lucide-react";
import AssessmentModal from "@/components/AssessmentModal";
import PpiModal from "@/components/PpiModal";

export default function GuruAsesmenPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("SEMUA");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("SEMUA");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [isPpiModalOpen, setIsPpiModalOpen] = useState(false);
  const [ppiPrefill, setPpiPrefill] = useState<{ studentId?: string; recommendation?: string }>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resStudents, resAssessments] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/assessments"),
      ]);
      const dataStudents = await resStudents.json();
      const dataAssessments = await resAssessments.json();
      setStudents(Array.isArray(dataStudents) ? dataStudents : []);
      setAssessments(Array.isArray(dataAssessments) ? dataAssessments : []);
    } catch (err) {
      console.error("Gagal memuat data asesmen:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter logic
  const filteredAssessments = assessments.filter((item) => {
    const matchCategory = selectedCategory === "SEMUA" || item.category === selectedCategory;
    const matchStudent = selectedStudentId === "SEMUA" || item.studentId === selectedStudentId;
    const matchSearch =
      searchQuery === "" ||
      item.student?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.aspect.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.findings.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCategory && matchStudent && matchSearch;
  });

  const handleConvertToPpi = (assessment: any) => {
    setPpiPrefill({
      studentId: assessment.studentId,
      recommendation: assessment.recommendation || assessment.aspect,
    });
    setIsPpiModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const categories = [
    "SEMUA",
    "Bina Diri (ADL)",
    "Bahasa & Komunikasi",
    "Motorik Kasar & Halus",
    "Kognitif / Akademik",
    "Sosial Emosional",
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <Header
          title="Menu Asesmen Siswa SLB"
          subtitle="Instrumen Diagnostik Kemampuan Awal, Pemetaan Potensi, dan Evaluasi Perkembangan Adaptif"
        />

        <div className="p-4 sm:p-6 space-y-6 max-w-7xl">
          {/* Action Header Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700 text-white shadow-xl shadow-teal-800/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur rounded-full text-xs font-semibold mb-2 text-teal-100">
                <ClipboardCheck className="w-3.5 h-3.5 text-teal-300" /> Instrumen Khusus Pendidikan Luar Biasa
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Asesmen Perkembangan & Diagnostik Siswa
              </h2>
              <p className="text-teal-100 text-xs sm:text-sm mt-1 max-w-2xl">
                Catat observasi kemampuan bina diri, komunikasi, motorik, dan kognitif siswa. Hasil asesmen dapat langsung dikonversi menjadi <strong>Target Program Pembelajaran Individual (PPI)</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={handlePrint}
                className="px-3.5 py-2.5 bg-teal-900/60 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm rounded-xl border border-teal-400/30 transition-all flex items-center gap-1.5"
                title="Cetak Laporan Asesmen"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Cetak Rekap</span>
              </button>

              <button
                onClick={() => setIsAssessmentModalOpen(true)}
                className="px-5 py-2.5 bg-white text-teal-800 hover:bg-teal-50 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-teal-600" />
                <span>+ Input Asesmen Baru</span>
              </button>
            </div>
          </div>

          {/* Category Quick Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-teal-700 text-white shadow-md shadow-teal-700/20"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat === "SEMUA" ? "Semua Kategori" : cat}
              </button>
            ))}
          </div>

          {/* Search & Student Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Cari siswa, aspek, atau catatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 shrink-0">
                <Filter className="w-3.5 h-3.5 text-teal-600" /> Filter Siswa:
              </div>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50 w-full sm:w-64"
              >
                <option value="SEMUA">Semua Siswa SLB ({students.length})</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.disabilityType})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assessment List / Cards */}
          {loading ? (
            <div className="bg-white rounded-3xl p-12 text-center text-sm text-slate-500 border border-slate-200">
              Memuat data asesmen...
            </div>
          ) : filteredAssessments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto">
                <ClipboardCheck className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-base text-slate-800">Belum Ada Data Asesmen</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Tidak ditemukan instrumen asesmen yang cocok dengan filter. Klik tombol di bawah untuk mencatat asesmen kemampuan siswa.
              </p>
              <button
                onClick={() => setIsAssessmentModalOpen(true)}
                className="px-4 py-2 bg-teal-600 text-white font-bold text-xs rounded-xl shadow hover:bg-teal-700 transition-colors"
              >
                + Input Asesmen Baru Sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAssessments.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-teal-300 transition-all p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    {/* Top Row: Student, Disability & Score */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-base text-slate-900">{item.student?.name}</h3>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                            {item.student?.disabilityType}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>NISN: {item.student?.nisn}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {new Date(item.assessmentDate).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div className="shrink-0">
                        {item.score === "MANDIRI" && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mandiri
                          </span>
                        )}
                        {item.score === "DENGAN_BANTUAN" && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            <HelpCircle className="w-3.5 h-3.5" /> Dg Bantuan
                          </span>
                        )}
                        {item.score === "BELUM_MAMPU" && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <AlertCircle className="w-3.5 h-3.5" /> Belum Mampu
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Category & Title */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {item.category}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{item.title}</span>
                      </div>
                      <div className="text-xs font-semibold text-teal-900 bg-teal-50/70 px-3 py-1.5 rounded-lg border border-teal-100">
                        🎯 Indikator: {item.aspect}
                      </div>
                    </div>

                    {/* Findings */}
                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-700 block mb-0.5">Catatan Hasil Observasi:</span>
                      <p className="italic">"{item.findings}"</p>
                    </div>

                    {/* Recommendation */}
                    {item.recommendation && (
                      <div className="text-xs text-indigo-900 bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block">Rekomendasi Tindak Lanjut:</span>
                          <span>{item.recommendation}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Actions (Print Assessment & Convert to PPI) */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <a
                      href={`/guru/asesmen/cetak/${item.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak Lembar Asesmen</span>
                    </a>

                    <button
                      onClick={() => handleConvertToPpi(item)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span>Jadikan Target PPI Siswa</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Assessment Modal */}
      <AssessmentModal
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        onSuccess={fetchData}
        students={students}
      />

      {/* PPI Modal prefilled from assessment recommendation */}
      <PpiModal
        isOpen={isPpiModalOpen}
        onClose={() => setIsPpiModalOpen(false)}
        onSuccess={fetchData}
        students={students}
        initialStudentId={ppiPrefill.studentId}
        defaultRecommendation={ppiPrefill.recommendation}
      />
    </div>
  );
}
