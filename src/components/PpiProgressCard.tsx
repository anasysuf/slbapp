import React from "react";
import { CheckCircle2, HelpCircle, AlertCircle, Clock, Calendar, Sparkles } from "lucide-react";

interface Evaluation {
  id: string;
  evaluationDate: string;
  score: "MANDIRI" | "DENGAN_BANTUAN" | "BELUM_MAMPU";
  narrativeNotes?: string | null;
}

interface PpiPlan {
  id: string;
  academicYear: string;
  currentCapability: string;
  longTermGoal: string;
  shortTermGoal: string;
  student: {
    name: string;
    nisn: string;
    disabilityType: string;
  };
  evaluations: Evaluation[];
}

export default function PpiProgressCard({
  plan,
  onAddEvaluation,
}: {
  plan: PpiPlan;
  onAddEvaluation?: () => void;
}) {
  const evaluations = plan.evaluations || [];
  const latestEval = evaluations[0];

  const getScoreBadge = (score: string) => {
    switch (score) {
      case "MANDIRI":
        return (
          <span className="inline-flex items-center justify-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-full text-[11px] sm:text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" /> Mandiri
          </span>
        );
      case "DENGAN_BANTUAN":
        return (
          <span className="inline-flex items-center justify-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-full text-[11px] sm:text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 whitespace-nowrap shrink-0">
            <HelpCircle className="w-3.5 h-3.5" /> Dg Bantuan
          </span>
        );
      case "BELUM_MAMPU":
        return (
          <span className="inline-flex items-center justify-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-full text-[11px] sm:text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 whitespace-nowrap shrink-0">
            <AlertCircle className="w-3.5 h-3.5" /> Belum Mampu
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between gap-4">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="font-bold text-base text-slate-900">{plan.student.name}</h3>
              <span className="text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 whitespace-nowrap inline-flex items-center shrink-0">
                {plan.student.disabilityType}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              NISN: {plan.student.nisn} • TA: {plan.academicYear}
            </p>
          </div>

          {latestEval ? (
            <div className="text-right shrink-0">{getScoreBadge(latestEval.score)}</div>
          ) : (
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-lg sm:rounded-full bg-slate-100 text-slate-600 whitespace-nowrap shrink-0 inline-flex items-center">
              Belum Dievaluasi
            </span>
          )}
        </div>

        {/* Goals Info */}
        <div className="mt-3 space-y-2.5 text-xs">
          <div>
            <span className="font-bold text-slate-700 block">Baseline / Kemampuan Awal:</span>
            <p className="text-slate-600 bg-slate-50 p-2 rounded-lg mt-0.5 border border-slate-100">
              {plan.currentCapability}
            </p>
          </div>

          <div>
            <span className="font-bold text-indigo-900 block flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-600" /> Target Jangka Panjang:
            </span>
            <p className="text-slate-700 bg-indigo-50/50 p-2 rounded-lg mt-0.5 border border-indigo-100/60">
              {plan.longTermGoal}
            </p>
          </div>

          <div>
            <span className="font-bold text-teal-900 block flex items-center gap-1">
              🎯 Target Jangka Pendek:
            </span>
            <p className="text-slate-700 bg-teal-50/50 p-2 rounded-lg mt-0.5 border border-teal-100/60 font-medium">
              {plan.shortTermGoal}
            </p>
          </div>
        </div>

        {/* Latest Evaluation Narrative */}
        {latestEval && (
          <div className="mt-3 p-2.5 bg-emerald-50/40 rounded-xl border border-emerald-100 text-xs">
            <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
              <span className="font-semibold text-emerald-800">Catatan Evaluasi Terakhir:</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(latestEval.evaluationDate).toLocaleDateString("id-ID")}
              </span>
            </div>
            <p className="text-slate-700 italic">"{latestEval.narrativeNotes || "Tidak ada catatan naratif"}"</p>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      {onAddEvaluation && (
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={onAddEvaluation}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
          >
            + Input Evaluasi Sesi Hari Ini
          </button>
        </div>
      )}
    </div>
  );
}
