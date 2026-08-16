"use client";

import React, { useState, useEffect } from "react";
import { Wrench, X, CheckCircle, Database, ShieldAlert, Cpu, Sparkles } from "lucide-react";

export default function DevFloatingPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [envInfo, setEnvInfo] = useState<{
    branch?: string;
    environment?: string;
    commit?: string;
    status?: string;
    latency?: number;
  } | null>(null);

  // Check if current runtime is strictly Production
  const isVercelProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";
  const isNodeProduction = process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_VERCEL_ENV;

  useEffect(() => {
    // Only fetch debug info in non-production or if preview
    if (!isVercelProduction) {
      fetch("/api/health")
        .then((res) => res.json())
        .then((data) => {
          setEnvInfo({
            branch: data.branch || "development",
            environment: data.environment || "dev",
            commit: data.commit || "local",
            status: data.status || "healthy",
            latency: data.database?.latencyMs || 0,
          });
        })
        .catch(() => {
          setEnvInfo({
            branch: "development",
            environment: "development",
            status: "local",
          });
        });
    }
  }, [isVercelProduction]);

  // If in Production, completely IGNORE and render nothing
  if (isVercelProduction || isNodeProduction) {
    return null;
  }

  return (
    <>
      {/* Top Development Ribbon (Auto-hidden in Production) */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-bold text-[11px] py-1 px-3 text-center shadow-md flex items-center justify-between print:hidden">
        <div className="flex items-center gap-1.5 mx-auto">
          <Sparkles className="w-3.5 h-3.5 text-slate-950 animate-bounce" />
          <span>MODE PENGEMBANGAN (DEVELOPMENT & PREVIEW)</span>
          <span className="opacity-60">•</span>
          <span className="font-normal text-[10px] opacity-90">
            Perubahan & pengujian di sini otomatis diabaikan di Production.
          </span>
        </div>
      </div>

      {/* Floating Dev Toggle Pill */}
      <div className="fixed bottom-4 right-4 z-50 print:hidden">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-900/90 hover:bg-slate-900 text-amber-300 border border-amber-500/40 rounded-full shadow-2xl backdrop-blur text-xs font-bold transition-all hover:scale-105"
            title="Buka Panel Pengujian Dev"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: "12s" }} />
            <span>Dev Tools</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        ) : (
          <div className="bg-slate-900/95 border border-slate-700 text-slate-100 rounded-2xl shadow-2xl p-4 w-72 backdrop-blur animate-fade-in space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Cpu className="w-4 h-4" />
                <span>Development Inspector</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80">
                <span className="text-slate-400">Active Branch</span>
                <span className="font-mono font-bold text-teal-300">{envInfo?.branch || "development"}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80">
                <span className="text-slate-400">Environment</span>
                <span className="font-mono text-amber-300 uppercase">{envInfo?.environment || "preview"}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-teal-400" />
                  Database
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle className="w-3 h-3" />
                  {envInfo?.latency ? `${envInfo.latency}ms` : "Connected"}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 leading-relaxed">
              💡 <strong>Zero Conflict Guarantee:</strong> Komponen ini hanya aktif di mode pengujian (`development`). Saat di-merge ke `main`, Vercel otomatis mengabaikan / menonaktifkannya di Production.
            </div>
          </div>
        )}
      </div>
    </>
  );
}
