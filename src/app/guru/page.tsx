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
  HeartHandshake,
  BarChart3,
  Calendar,
} from "lucide-react";
import AssessmentModal from "@/components/AssessmentModal";
import PpiModal from "@/components/PpiModal";
import Footer from "@/components/Footer";


export default function GuruDashboard() {
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [ppiPlans, setPpiPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [isPpiModalOpen, setIsPpiModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resClasses, resStudents, resAssessments, resPpi] = await Promise.all([
        fetch("/api/classes"),
        fetch("/api/students"),
        fetch("/api/assessments"),
        fetch("/api/ppi"),
      ]);

      const dataClasses = await resClasses.json();
      const dataStudents = await resStudents.json();
      const dataAssessments = await resAssessments.json();
      const dataPpi = await resPpi.json();

      setClasses(Array.isArray(dataClasses) ? dataClasses : []);
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

  const mandiriCount = assessments.filter((a) => a.score === "MANDIRI").length;
  const mandiriPercent = assessments.length > 0 ? Math.round((mandiriCount / assessments.length) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <Header
          title="Dashboard Guru Khusus SLB"
          subtitle="Pusat Asesmen Diagnostik, Program Pembelajaran Individual (PPI), & Pemantauan Kemandirian Siswa"
        />

        <div className="p-4 sm:p-6 space-y-6 max-w-7xl">
          {/* Welcome Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700 text-white shadow-xl shadow-teal-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur rounded-full text-xs font-semibold text-teal-100">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Portal Pembelajaran Khusus
              </div>
              <h2 className="text-xl sm:text-3xl font-black tracking-tight">
                Selamat Datang di Ruang Guru SLB
              </h2>
              <p className="text-teal-100 text-xs sm:text-sm max-w-xl leading-relaxed">
                Kelola rombel binaan Anda, input hasil asesmen diagnostik 5 aspek, dan susun target individualisasi peserta didik secara praktis dan terintegrasi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => setIsAssessmentModalOpen(true)}
                className="px-4 py-2.5 bg-white text-teal-900 hover:bg-teal-50 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <ClipboardCheck className="w-4 h-4 text-teal-600" />
                <span>+ Input Asesmen</span>
              </button>

              <button
                onClick={() => setIsPpiModalOpen(true)}
                className="px-4 py-2.5 bg-teal-950/80 hover:bg-teal-950 text-white font-bold text-xs sm:text-sm rounded-xl border border-teal-400/30 transition-all flex items-center gap-2"
              >
                <Target className="w-4 h-4 text-amber-300" />
                <span>+ Susun PPI Baru</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Siswa Binaan</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{students.length}</div>
                <div className="text-[11px] text-teal-600 font-semibold mt-0.5">Siswa Berkebutuhan Khusus</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Asesmen Terdata</div>
                <div className="text-2xl font-black text-teal-700 mt-1">{assessments.length}</div>
                <Link href="/guru/asesmen" className="text-[11px] text-teal-600 hover:underline font-semibold mt-0.5 block">
                  Lihat Menu Asesmen →
                </Link>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
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

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Tingkat Kemandirian</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">{mandiriPercent}%</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Rasio Skor Mandiri</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Rombel Kelas Binaan Guru */}
          {classes.length > 0 ? (
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900">
                      Rombel Kelas Binaan Anda
                    </h3>
                    <p className="text-xs text-slate-500">Penugasan resmi dan jenjang pendidikan ditentukan oleh Administrator Sekolah</p>
                  </div>
                </div>
                <Link
                  href="/guru/siswa"
                  className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>Kelola Siswa di Kelas Ini</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-4 bg-gradient-to-r from-teal-50/80 to-slate-50 rounded-2xl border border-teal-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base text-teal-950">{classes[0]?.name}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-700 text-white">
                      Jenjang {classes[0]?.jenjang}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Wali Kelas: <strong>{classes[0]?.teacher?.name || "Guru"}</strong> • Terdaftar <strong>{students.length} peserta didik</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/guru/siswa"
                    className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow transition-colors"
                  >
                    Daftar Siswa ({students.length})
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 p-5 rounded-3xl text-amber-900 text-xs flex items-center gap-3">
              <span className="text-lg">⚠️</span>
              <div>
                <strong>Belum Memiliki Rombel Kelas Aktif:</strong> Akun Guru Anda belum ditugaskan ke kelas tertentu oleh Administrator. Silakan hubungi Admin Sekolah untuk penugasan kelas dan jenjang.
              </div>
            </div>
          )}

          {/* Section: Asesmen Terbaru & Daftar Siswa */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Asesmen Siswa Terkini */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-base text-slate-800">
                    Asesmen Diagnostik Terkini
                  </h3>
                </div>
                <Link
                  href="/guru/asesmen"
                  className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  <span>Buka Asesmen Lengkap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="py-8 text-center text-xs text-slate-400">Memuat data asesmen...</div>
              ) : assessments.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Belum ada asesmen yang dicatat. Klik "+ Input Asesmen".
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
                <Link href="/guru/siswa" className="text-xs font-bold text-teal-600 hover:underline">
                  Semua Siswa →
                </Link>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {students.map((s) => {
                  const className = s.classes?.[0]?.class?.name;
                  return (
                    <div
                      key={s.id}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 hover:bg-teal-50/50 transition-colors flex items-center justify-between"
                    >
                      <Link href={`/guru/siswa/${s.id}`} className="hover:underline flex-1 pr-2">
                        <div className="font-bold text-xs text-slate-900">{s.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {s.disabilityType} {className ? `• ${className}` : ""}
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
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <Footer />
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
