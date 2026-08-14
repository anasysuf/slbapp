"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
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
} from "lucide-react";

export default function YayasanDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
          subtitle="Laporan Agregat, Demografi Disabilitas, dan Capaian Kemandirian Siswa SLB"
        />

        <div className="p-6 space-y-6 max-w-7xl">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs font-semibold mb-2 text-indigo-300">
                <Building2 className="w-3.5 h-3.5" /> Yayasan Pendidikan Luar Biasa Harapan Mulia
              </div>
              <h2 className="text-xl sm:text-2xl font-black">Ikhtisar Perkembangan Sekolah</h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
                Pantau efektivitas program pembelajaran individual dan kualitas layanan pendidikan inklusif secara menyeluruh.
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan Yayasan</span>
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Peserta Didik</div>
                <div className="text-2xl font-black text-slate-800 mt-1">{stats?.totalStudents || 0}</div>
                <div className="text-[11px] text-teal-600 font-medium mt-0.5">Siswa Berkebutuhan Khusus</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Tingkat Kemandirian</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">{stats?.independenceRate || 0}%</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Skor Mandiri pada PPI</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Asesmen Terlaksana</div>
                <div className="text-2xl font-black text-indigo-700 mt-1">{stats?.totalAssessments || 0}</div>
                <div className="text-[11px] text-indigo-600 font-medium mt-0.5">Observasi Diagnostik</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Program PPI Berjalan</div>
                <div className="text-2xl font-black text-purple-700 mt-1">{stats?.totalPpiPlans || 0}</div>
                <div className="text-[11px] text-purple-600 font-medium mt-0.5">Target Individual Siswa</div>
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
                  Distribusi Siswa Menurut Jenis Kebutuhan Khusus
                </h3>
              </div>

              <div className="space-y-3">
                {stats?.studentsByDisability?.map((item: any) => (
                  <div key={item.disabilityType} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>{item.disabilityType}</span>
                      <span>{item._count.id} Siswa</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
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
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-800">
                  Rombongan Belajar (Kelas Terapi & Khusus)
                </h3>
              </div>

              <div className="space-y-3">
                {stats?.classes?.map((c: any) => (
                  <div
                    key={c.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between"
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
      </main>
    </div>
  );
}
