"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Link from "next/link";
import {
  Building2,
  Users,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  ClipboardCheck,
  Target,
  BarChart3,
  PieChart,
  Printer,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Download,
} from "lucide-react";

import Footer from "@/components/Footer";
import { exportComprehensiveAllDataToCsv } from "@/lib/exportUtils";


export default function YayasanDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exportingAll, setExportingAll] = useState(false);

  const handleExportAll = async () => {
    try {
      setExportingAll(true);
      const res = await fetch("/api/rekap/all");
      if (res.ok) {
        const data = await res.json();
        exportComprehensiveAllDataToCsv(data, "Yayasan_SLB");
      } else {
        alert("Gagal mengunduh rekap yayasan.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengekspor data.");
    } finally {
      setExportingAll(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <Header
          title="Dashboard Eksekutif Yayasan"
          subtitle="Laporan Agregat Kemajuan Belajar, Demografi Disabilitas, dan Capaian Kemandirian Siswa SLB"
        />

        <div className="p-4 sm:p-6 space-y-6 max-w-7xl">
          {/* Header Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs font-semibold text-indigo-300">
                <Building2 className="w-3.5 h-3.5" /> Portal Eksekutif Yayasan Pendidikan SLB
              </div>
              <h2 className="text-xl sm:text-3xl font-black tracking-tight">Ikhtisar Perkembangan Sekolah</h2>
              <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
                Pantau efektivitas program pembelajaran individual (PPI), kemajuan kemandirian anak, dan distribusi rombel kelas secara komprehensif.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={handleExportAll}
                disabled={exportingAll}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                title="Unduh Seluruh Master Data & Rekapitulasi Yayasan"
              >
                <FileSpreadsheet className="w-4 h-4 text-slate-950" />
                <span>{exportingAll ? "Mengekspor Semua..." : "Rekap Semuanya (All Data)"}</span>
              </button>

              <Link
                href="/guru/rekap"
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Rekapitulasi Semester</span>
              </Link>

              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Laporan</span>
              </button>
            </div>
          </div>


          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Peserta Didik</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{stats?.totalStudents || 0}</div>
                <div className="text-[11px] text-teal-600 font-semibold mt-0.5">Siswa Berkebutuhan Khusus</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Tingkat Kemandirian</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">{stats?.independenceRate || 0}%</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Skor Mandiri pada PPI</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Asesmen Terlaksana</div>
                <div className="text-2xl font-black text-indigo-700 mt-1">{stats?.totalAssessments || 0}</div>
                <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">Observasi Diagnostik</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Program PPI Berjalan</div>
                <div className="text-2xl font-black text-purple-700 mt-1">{stats?.totalPpiPlans || 0}</div>
                <div className="text-[11px] text-purple-600 font-semibold mt-0.5">Target Individual Siswa</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Demographics and Classes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Disability Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <PieChart className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-base text-slate-800">
                  Distribusi Siswa Menurut Klasifikasi Kebutuhan Khusus
                </h3>
              </div>

              <div className="space-y-3.5">
                {stats?.studentsByDisability?.map((item: any) => (
                  <div key={item.disabilityType} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>{item.disabilityType}</span>
                      <span className="text-teal-700">{item._count.id} Siswa</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${((item._count.id / (stats?.totalStudents || 1)) * 100).toFixed(0)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Classes & Teacher Ratios */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-base text-slate-800">
                    Rombongan Belajar & Pengampu
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-semibold">{stats?.classes?.length || 0} Rombel</span>
              </div>

              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {stats?.classes?.map((c: any) => (
                  <div
                    key={c.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between hover:bg-indigo-50/40 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900">{c.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Wali Kelas: {c.teacher?.name || "Belum ditentukan"}
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-800 text-xs font-bold rounded-xl border border-indigo-200">
                      {c._count?.students || 0} Siswa
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}

