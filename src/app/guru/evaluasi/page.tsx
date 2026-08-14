"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { FileCheck2, CheckCircle2, HelpCircle, AlertCircle, Calendar, Sparkles, Filter } from "lucide-react";
import EvaluationModal from "@/components/EvaluationModal";

export default function GuruEvaluasiPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [ppiPlans, setPpiPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const teacherClass = classes[0];

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
      const [resClasses, resPpi] = await Promise.all([
        fetch("/api/classes"),
        fetch("/api/ppi"),
      ]);
      const dataClasses = await resClasses.json();
      const dataPpi = await resPpi.json();
      setClasses(Array.isArray(dataClasses) ? dataClasses : []);
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
          title="Input Evaluasi Perkembangan PPI"
          subtitle="Pencatatan Skor dan Catatan Observasi Sesi Belajar Harian/Mingguan Siswa Binaan"
        />

        <div className="p-4 sm:p-6 space-y-6 max-w-7xl">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur rounded-full text-xs font-semibold mb-2">
                <FileCheck2 className="w-3.5 h-3.5" /> {teacherClass ? `${teacherClass.name} (${teacherClass.jenjang})` : "Skala Penilaian Khusus"}
              </div>
              <h2 className="text-xl sm:text-2xl font-black">Matriks Evaluasi Capaian Target</h2>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-2xl">
                Setiap kali ananda menyelesaikan sesi terapi atau latihan keterampilan khusus, catat respons dan tingkat kemandiriannya di sini.
              </p>
            </div>
          </div>

          {/* Table / List of PPI Plans to Evaluate */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-800">Daftar Target Siswa untuk Dievaluasi</h3>
              <span className="text-xs font-bold text-slate-500">{ppiPlans.length} Target Aktif</span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Memuat target PPI...</div>
            ) : ppiPlans.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">Belum ada target PPI yang dapat dievaluasi.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {ppiPlans.map((plan) => {
                  const evaluations = plan.evaluations || [];
                  const latest = evaluations[0];
                  const className = plan.student?.classes?.[0]?.class?.name;
                  return (
                    <div key={plan.id} className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{plan.student?.name}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                            {plan.student?.disabilityType}
                          </span>
                          {className && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {className}
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-medium text-teal-950">
                          🎯 Target Pendek: {plan.shortTermGoal}
                        </div>
                        {latest && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
                            <span>Evaluasi Terakhir:</span>
                            <span className="font-bold text-slate-700">{latest.score}</span>
                            <span>•</span>
                            <span className="italic">"{latest.narrativeNotes || "Tanpa catatan"}"</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={() =>
                            setEvalModalState({
                              isOpen: true,
                              ppiPlanId: plan.id,
                              studentName: plan.student.name,
                              shortTermGoal: plan.shortTermGoal,
                            })
                          }
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <FileCheck2 className="w-4 h-4" />
                          <span>+ Beri Skor Hari Ini</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

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
