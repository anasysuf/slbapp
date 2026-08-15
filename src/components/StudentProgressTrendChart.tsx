"use client";

import React, { useState } from "react";
import { TrendingUp, Award, Calendar, CheckCircle2, HelpCircle, AlertCircle, Sparkles, Filter } from "lucide-react";

interface EvaluationRecord {
  id: string;
  date: string | Date;
  score: "MANDIRI" | "DENGAN_BANTUAN" | "BELUM_MAMPU" | string;
  notes?: string | null;
  evaluator?: { name: string } | null;
}

interface PpiPlanWithEvaluations {
  id: string;
  shortTermGoal: string;
  longTermGoal?: string | null;
  targetDate?: string | Date | null;
  status?: string;
  evaluations: EvaluationRecord[];
}

interface StudentProgressTrendChartProps {
  studentName: string;
  ppiPlans: PpiPlanWithEvaluations[];
}

export default function StudentProgressTrendChart({
  studentName,
  ppiPlans,
}: StudentProgressTrendChartProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>("ALL");

  // Filter plans with evaluations
  const activePlans = ppiPlans.filter((p) => p.evaluations && p.evaluations.length > 0);

  const displayedPlans =
    selectedPlanId === "ALL"
      ? activePlans
      : activePlans.filter((p) => p.id === selectedPlanId);

  // Score to numeric value helper (Mandiri=100%, Dengan Bantuan=60%, Belum Mampu=25%)
  const getScoreValue = (score: string) => {
    switch (score) {
      case "MANDIRI":
        return 100;
      case "DENGAN_BANTUAN":
        return 60;
      case "BELUM_MAMPU":
        return 25;
      default:
        return 20;
    }
  };

  const getScoreColor = (score: string) => {
    switch (score) {
      case "MANDIRI":
        return "text-emerald-700 bg-emerald-100 border-emerald-300";
      case "DENGAN_BANTUAN":
        return "text-amber-800 bg-amber-100 border-amber-300";
      case "BELUM_MAMPU":
        return "text-rose-700 bg-rose-100 border-rose-300";
      default:
        return "text-slate-700 bg-slate-100 border-slate-300";
    }
  };

  const getScoreLabel = (score: string) => {
    switch (score) {
      case "MANDIRI":
        return "Mandiri (100%)";
      case "DENGAN_BANTUAN":
        return "Dengan Bantuan (60%)";
      case "BELUM_MAMPU":
        return "Belum Mampu (25%)";
      default:
        return score;
    }
  };

  if (activePlans.length === 0) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
          <TrendingUp className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-sm text-slate-800">Belum Ada Riwayat Sesi Evaluasi Perkembangan</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Grafik kemajuan akan terisi otomatis setelah guru menginput skor evaluasi harian/mingguan pada target PPI ananda {studentName}.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Grafik Tren Perkembangan & Kemandirian Siswa
              </h3>
              <p className="text-xs text-slate-500">
                Progres Capaian Target Individual ({studentName}) dari Waktu ke Waktu
              </p>
            </div>
          </div>
        </div>

        {/* Filter Target PPI */}
        {activePlans.length > 1 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-600 shrink-0">Filter Target:</span>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:ring-2 focus:ring-teal-500 max-w-[220px] truncate"
            >
              <option value="ALL">Semua Target PPI ({activePlans.length})</option>
              {activePlans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.shortTermGoal}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Progress Cards per PPI Goal */}
      <div className="space-y-6">
        {displayedPlans.map((plan) => {
          const sortedEvals = [...plan.evaluations].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

          const latestScore = sortedEvals[sortedEvals.length - 1]?.score;
          const firstScore = sortedEvals[0]?.score;
          const isImproved =
            getScoreValue(latestScore) > getScoreValue(firstScore);

          return (
            <div
              key={plan.id}
              className="p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-4"
            >
              {/* Goal Title & Current Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                    Target Pembelajaran Individual
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-900 mt-1">
                    {plan.shortTermGoal}
                  </h4>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  <span
                    className={`inline-flex items-center justify-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-full text-[10px] sm:text-xs font-bold border whitespace-nowrap shrink-0 ${getScoreColor(
                      latestScore
                    )}`}
                  >
                    Skor Terkini: {getScoreLabel(latestScore)}
                  </span>
                  {isImproved && (
                    <span className="inline-flex items-center px-2 py-0.5 sm:py-1 bg-emerald-600 text-white text-[10px] font-black rounded-lg shadow-sm whitespace-nowrap shrink-0">
                      📈 Meningkat
                    </span>
                  )}
                </div>
              </div>

              {/* Visual Multi-Point Timeline Chart */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>Riwayat {sortedEvals.length} Sesi Evaluasi</span>
                  <span>Tingkat Kemandirian (0 - 100%)</span>
                </div>

                {/* Grid & Points Graph */}
                <div className="relative bg-white p-4 rounded-xl border border-slate-200/80 overflow-x-auto">
                  {/* Background Reference Lines */}
                  <div className="relative h-28 flex items-end justify-between min-w-[280px] gap-2 pt-4">
                    {/* Horizontal Level Guides */}
                    <div className="absolute inset-x-0 top-2 border-b border-dashed border-emerald-200 flex justify-end pr-1">
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded">
                        Mandiri (100%)
                      </span>
                    </div>
                    <div className="absolute inset-x-0 top-12 border-b border-dashed border-amber-200 flex justify-end pr-1">
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 rounded">
                        Bantuan (60%)
                      </span>
                    </div>
                    <div className="absolute inset-x-0 bottom-2 border-b border-dashed border-rose-200 flex justify-end pr-1">
                      <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1 rounded">
                        Belum Mampu (25%)
                      </span>
                    </div>

                    {/* Bars / Points for Each Session */}
                    {sortedEvals.map((ev, idx) => {
                      const val = getScoreValue(ev.score);
                      const heightPercent = val;
                      const dateStr = new Date(ev.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      });

                      return (
                        <div
                          key={ev.id || idx}
                          className="flex-1 flex flex-col items-center h-full justify-end relative z-10 group min-w-[36px]"
                        >
                          {/* Hover Tooltip */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 bg-slate-900 text-white text-[10px] p-2 rounded-lg pointer-events-none whitespace-nowrap shadow-xl z-20">
                            <p className="font-bold">{getScoreLabel(ev.score)}</p>
                            <p className="text-slate-300">{dateStr}</p>
                            {ev.notes && <p className="italic text-[9px] mt-0.5 max-w-[140px] truncate">"{ev.notes}"</p>}
                          </div>

                          {/* Interactive Bar */}
                          <div
                            className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                              ev.score === "MANDIRI"
                                ? "bg-gradient-to-t from-emerald-500 to-teal-400 group-hover:from-emerald-600 group-hover:to-teal-500"
                                : ev.score === "DENGAN_BANTUAN"
                                ? "bg-gradient-to-t from-amber-400 to-yellow-300 group-hover:from-amber-500 group-hover:to-yellow-400"
                                : "bg-gradient-to-t from-rose-400 to-pink-300 group-hover:from-rose-500 group-hover:to-pink-400"
                            }`}
                            style={{ height: `${heightPercent}%` }}
                          />

                          {/* Date Label */}
                          <span className="text-[9px] font-bold text-slate-500 mt-1 truncate">
                            {dateStr}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
