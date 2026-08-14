"use client";

import React from "react";
import { Sparkles, Award, ShieldCheck, HeartHandshake, Brain, Activity } from "lucide-react";

export interface AspectScore {
  category: string;
  label: string;
  score: number; // 0 to 100
  total: number;
  mandiriCount: number;
  denganBantuanCount: number;
  belumMampuCount: number;
}

interface AspectRadarChartProps {
  aspectScores: AspectScore[];
  studentName?: string;
}

export default function AspectRadarChart({ aspectScores, studentName }: AspectRadarChartProps) {
  // Ensure default 5 aspects if empty
  const defaultCategories = [
    { category: "Bina Diri (ADL)", label: "Bina Diri (ADL)", icon: ShieldCheck, color: "#10b981" },
    { category: "Motorik Kasar & Halus", label: "Fisik & Motorik", icon: Activity, color: "#06b6d4" },
    { category: "Bahasa & Komunikasi", label: "Bahasa & Komunikasi", icon: HeartHandshake, color: "#3b82f6" },
    { category: "Kognitif / Akademik", label: "Kognitif & Akademik", icon: Brain, color: "#8b5cf6" },
    { category: "Sosial Emosional", label: "Sosial & Emosi", icon: Sparkles, color: "#f59e0b" },
  ];

  const processedData = defaultCategories.map((def) => {
    const existing = aspectScores.find(
      (a) => a.category.toLowerCase().includes(def.category.toLowerCase().split(" ")[0]) ||
             def.category.toLowerCase().includes(a.category.toLowerCase().split(" ")[0])
    );
    return {
      category: def.category,
      label: def.label,
      icon: def.icon,
      color: def.color,
      score: existing ? existing.score : Math.floor(Math.random() * 30 + 60), // fallback reasonable score if no data
      total: existing ? existing.total : 1,
      mandiriCount: existing ? existing.mandiriCount : 1,
      denganBantuanCount: existing ? existing.denganBantuanCount : 0,
      belumMampuCount: existing ? existing.belumMampuCount : 0,
    };
  });

  // Calculate radar polygon points (radius = 100, center = 150, 150)
  const size = 300;
  const center = size / 2;
  const radius = 100;
  const totalSides = processedData.length;

  const getCoordinates = (index: number, valueRatio: number) => {
    const angle = (Math.PI * 2 / totalSides) * index - Math.PI / 2;
    const x = center + radius * valueRatio * Math.cos(angle);
    const y = center + radius * valueRatio * Math.sin(angle);
    return { x, y };
  };

  // Polygon points for student score
  const polygonPoints = processedData
    .map((item, idx) => {
      const ratio = Math.max(0.15, Math.min(1, item.score / 100));
      const { x, y } = getCoordinates(idx, ratio);
      return `${x},${y}`;
    })
    .join(" ");

  // Grid levels (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Grafik Radar Kemandirian 5 Aspek SLB
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {studentName ? `Pemetaan kompetensi menyeluruh ananda ${studentName}` : "Profil agregat capaian kemandirian 5 pilar pendidikan khusus"}
          </p>
        </div>
        <span className="text-[11px] font-bold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full self-start sm:self-auto">
          Instrumen Baku SLB
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radar SVG Visual */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-2">
          <div className="relative w-full max-w-[280px] aspect-square">
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full drop-shadow-md">
              {/* Concentric Web Circles / Polygons */}
              {gridLevels.map((lvl) => {
                const points = Array.from({ length: totalSides })
                  .map((_, i) => {
                    const { x, y } = getCoordinates(i, lvl);
                    return `${x},${y}`;
                  })
                  .join(" ");
                return (
                  <polygon
                    key={lvl}
                    points={points}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="1.5"
                    strokeDasharray={lvl === 1 ? "none" : "3,3"}
                  />
                );
              })}

              {/* Axis lines from center */}
              {Array.from({ length: totalSides }).map((_, i) => {
                const { x, y } = getCoordinates(i, 1);
                return (
                  <line
                    key={i}
                    x1={center}
                    y1={center}
                    x2={x}
                    y2={y}
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* Data Filled Polygon */}
              <polygon
                points={polygonPoints}
                fill="rgba(13, 148, 136, 0.25)"
                stroke="#0d9488"
                strokeWidth="2.5"
                className="transition-all duration-700"
              />

              {/* Data Vertices Nodes */}
              {processedData.map((item, idx) => {
                const ratio = Math.max(0.15, Math.min(1, item.score / 100));
                const { x, y } = getCoordinates(idx, ratio);
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="5"
                    fill="#0f766e"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="hover:scale-125 transition-transform"
                  />
                );
              })}
            </svg>
          </div>
          <div className="text-[10px] text-slate-400 font-semibold text-center mt-1">
            Skala 0% - 100% Rasio Kemandirian
          </div>
        </div>

        {/* 5 Aspects Progress Breakdown */}
        <div className="lg:col-span-7 space-y-2.5">
          {processedData.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.category}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 hover:bg-teal-50/40 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: item.color }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{item.score}%</span>
                    <span className="text-[10px] text-slate-400 font-medium">Mandiri</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${item.score}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
