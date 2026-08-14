"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Link from "next/link";
import {
  Users,
  ClipboardCheck,
  Target,
  FileCheck2,
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  AlertCircle,
  PlusCircle,
} from "lucide-react";
import AssessmentModal from "@/components/AssessmentModal";
import PpiModal from "@/components/PpiModal";

export default function GuruDashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [ppiPlans, setPpiPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [isPpiModalOpen, setIsPpiModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resStudents, resAssessments, resPpi] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/assessments"),
        fetch("/api/ppi"),
      ]);

      const dataStudents = await resStudents.json();
      const dataAssessments = await resAssessments.json();
      const dataPpi = await resPpi.json();

      setStudents(Array.isArray(dataStudents) ? dataStudents : []);
      setAssessments(Array.isArray(dataAssessments) ? dataAssessments : []);
      setPpiPlans(Array.isArray(dataPpi) ? dataPpi : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <Header
          title="Dashboard Guru Khusus SLB"
          subtitle="Manajemen Asesmen Diagnostik, Program Pembelajaran Individual (PPI) & Pembelajaran Adaptif"
        />

        <div className="p-4 sm:p-6 space-y-6 max-w-7xl">
          {/* Welcome Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 text-white shadow-xl shadow-teal-700/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-semibold mb-2 text-teal-50">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Kurikulum Pendidikan Khusus SLB
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Selamat Datang di Ruang Guru SLB
              </h2>
              <p className="text-teal-100 text-xs sm:text-sm mt-1 max-w-xl">
                Mulai hari dengan melakukan <strong>Asesmen Diagnostik</strong> kemampuan awal atau menginput evaluasi capaian <strong>Target PPI</strong> anak didik Anda.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => setIsAssessmentModalOpen(true)}
                className="px-4 py-2.5 bg-white text-teal-800 hover:bg-teal-50 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <ClipboardCheck className="w-4 h-4 text-teal-600" />
                <span>+ Input Asesmen Baru</span>
              </button>

              <button
                onClick={() => setIsPpiModalOpen(true)}
                className="px-4 py-2.5 bg-teal-900/80 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm rounded-xl border border-teal-400/30 transition-all flex items-center gap-2"
              >
                <Target className="w-4 h-4 text-amber-300" />
                <span>+ Buat PPI Baru</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Siswa Binaan</div>
                <div className="text-2xl font-black text-slate-800 mt-1">{students.length}</div>
                <div className="text-[11px] text-teal-600 font-medium mt-0.5">Siswa Berkebutuhan Khusus</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Data Asesmen Masuk</div>
                <div className="text-2xl font-black text-teal-700 mt-1">{assessments.length}</div>
                <Link href="/guru/asesmen" className="text-[11px] text-teal-600 hover:underline font-semibold mt-0.5 block">
                  Lihat Menu Asesmen →
                </Link>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Rencana PPI Aktif</div>
                <div className="text-2xl font-black text-indigo-700 mt-1">{ppiPlans.length}</div>
                <Link href="/guru/ppi" className="text-[11px] text-indigo-600 hover:underline font-semibold mt-0.5 block">
                  Kelola PPI Siswa →
                </Link>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Tingkat Kemandirian</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">
                  {Math.round((assessments.filter((a) => a.score === "MANDIRI").length / (assessments.length || 1)) * 100)}%
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Rasio Skor Mandiri</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Section: Asesmen Terbaru & Daftar Siswa */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Asesmen Siswa Terkini */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-base text-slate-800">
                    Asesmen Diagnostik & Perkembangan Terakhir
                  </h3>
                </div>
                <Link
                  href="/guru/asesmen"
                  className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  <span>Buka Menu Asesmen Lengkap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="py-8 text-center text-xs text-slate-400">Memuat data asesmen...</div>
              ) : assessments.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Belum ada asesmen yang dicatat. Klik "+ Input Asesmen Baru".
                </div>
              ) : (
                <div className="space-y-3">
                  {assessments.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{item.student.name}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                              {item.student.disabilityType}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                              {item.category}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-slate-700 mt-1">
                            Aspek: {item.aspect}
                          </div>
                          <p className="text-xs text-slate-600 mt-1 italic">
                            "{item.findings}"
                          </p>
                        </div>

                        <div>
                          {item.score === "MANDIRI" && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                              🟢 Mandiri
                            </span>
                          )}
                          {item.score === "DENGAN_BANTUAN" && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 whitespace-nowrap">
                              🟡 Dg Bantuan
                            </span>
                          )}
                          {item.score === "BELUM_MAMPU" && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 whitespace-nowrap">
                              🔴 Belum
                            </span>
                          )}
                        </div>
                      </div>

                      {item.recommendation && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[11px] text-teal-800 flex items-center justify-between">
                          <span>💡 <strong>Rekomendasi PPI:</strong> {item.recommendation}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Siswa & Akses Cepat */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-base text-slate-800">Daftar Siswa Binaan</h3>
                </div>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {students.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 hover:bg-teal-50/50 transition-colors flex items-center justify-between"
                  >
                    <Link href={`/guru/siswa/${s.id}`} className="hover:underline flex-1 pr-2">
                      <div className="font-bold text-xs text-slate-900">{s.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {s.disabilityType} • NISN: {s.nisn}
                      </div>
                    </Link>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/guru/siswa/${s.id}`}
                        className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-bold transition-colors"
                      >
                        Profil
                      </Link>
                      <Link
                        href={`/guru/asesmen?studentId=${s.id}`}
                        className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[10px] font-bold transition-colors"
                      >
                        Asesmen
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AssessmentModal
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        onSuccess={fetchData}
        students={students}
      />

      <PpiModal
        isOpen={isPpiModalOpen}
        onClose={() => setIsPpiModalOpen(false)}
        onSuccess={fetchData}
        students={students}
      />
    </div>
  );
}
