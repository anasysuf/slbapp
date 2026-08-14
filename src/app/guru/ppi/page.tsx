"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Target, PlusCircle, Sparkles, Filter, Search, Calendar, CheckCircle2 } from "lucide-react";
import PpiModal from "@/components/PpiModal";
import EvaluationModal from "@/components/EvaluationModal";
import PpiProgressCard from "@/components/PpiProgressCard";

export default function GuruPpiPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [ppiPlans, setPpiPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isPpiModalOpen, setIsPpiModalOpen] = useState(false);
  const [evalModalState, setEvalModalState] = useState<{
    isOpen: boolean;
    ppiPlanId: string;
    studentName: string;
    shortTermGoal: string;
  }>({
    isOpen: false,
    ppiPlanId: "",
    studentName: "",
    shortTermGoal: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resStudents, resPpi] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/ppi"),
      ]);
      const dataStudents = await resStudents.json();
      const dataPpi = await resPpi.json();
      setStudents(Array.isArray(dataStudents) ? dataStudents : []);
      setPpiPlans(Array.isArray(dataPpi) ? dataPpi : []);
    } catch (err) {
      console.error("Gagal memuat PPI:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPpi = ppiPlans.filter((p) => {
    return (
      searchQuery === "" ||
      p.student?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortTermGoal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.longTermGoal.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <Header
          title="Program Pembelajaran Individual (PPI / IEP)"
          subtitle="Target Kurikulum Khusus Individualisasi Peserta Didik Berkebutuhan Khusus"
        />

        <div className="p-6 space-y-6 max-w-7xl">
          {/* Header Action Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-800 via-indigo-900 to-indigo-800 text-white shadow-xl shadow-indigo-900/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur rounded-full text-xs font-semibold mb-2 text-indigo-200">
                <Target className="w-3.5 h-3.5 text-amber-300" /> Individualized Education Plan (IEP)
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Rencana & Target Kemandirian Siswa
              </h2>
              <p className="text-indigo-100 text-xs sm:text-sm mt-1 max-w-2xl">
                Tentukan baseline kemampuan anak, target jangka panjang, serta target jangka pendek yang dapat dievaluasi secara berkala.
              </p>
            </div>

            <button
              onClick={() => setIsPpiModalOpen(true)}
              className="px-5 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              <span>+ Susun PPI Baru</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Cari nama siswa atau target pembelajaran..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50"
              />
            </div>
            <div className="text-xs font-bold text-slate-500 hidden sm:block">
              Total: {filteredPpi.length} Program Aktif
            </div>
          </div>

          {/* PPI Plan Grid */}
          {loading ? (
            <div className="bg-white rounded-3xl p-12 text-center text-sm text-slate-500 border border-slate-200">
              Memuat data PPI...
            </div>
          ) : filteredPpi.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-base text-slate-800">Belum Ada Program PPI</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Mulai dengan menyusun target pembelajaran individual untuk anak didik Anda.
              </p>
              <button
                onClick={() => setIsPpiModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow hover:bg-indigo-700 transition-colors"
              >
                + Buat PPI Sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPpi.map((plan) => (
                <PpiProgressCard
                  key={plan.id}
                  plan={plan}
                  onAddEvaluation={() =>
                    setEvalModalState({
                      isOpen: true,
                      ppiPlanId: plan.id,
                      studentName: plan.student.name,
                      shortTermGoal: plan.shortTermGoal,
                    })
                  }
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <PpiModal
        isOpen={isPpiModalOpen}
        onClose={() => setIsPpiModalOpen(false)}
        onSuccess={fetchData}
        students={students}
      />

      <EvaluationModal
        isOpen={evalModalState.isOpen}
        onClose={() => setEvalModalState((prev) => ({ ...prev, isOpen: false }))}
        onSuccess={fetchData}
        ppiPlanId={evalModalState.ppiPlanId}
        studentName={evalModalState.studentName}
        shortTermGoal={evalModalState.shortTermGoal}
      />
    </div>
  );
}
