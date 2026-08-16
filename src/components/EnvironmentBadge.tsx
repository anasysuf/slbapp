"use client";

import React, { useEffect, useState } from "react";
import { GitBranch, CheckCircle2, AlertCircle } from "lucide-react";

export default function EnvironmentBadge() {
  const [health, setHealth] = useState<{
    branch?: string;
    environment?: string;
    status?: string;
    latency?: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setHealth({
          branch: data.branch || "development",
          environment: data.environment || "dev",
          status: data.status || "healthy",
          latency: data.database?.latencyMs,
        });
      })
      .catch(() => {
        setHealth({
          branch: "development",
          environment: "dev",
          status: "offline",
        });
      });
  }, []);

  if (!health) return null;

  const isProd = health.environment === "production";

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border shadow-sm transition-all ${
        isProd
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
          : "bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse"
      }`}
      title={`Branch: ${health.branch} | Env: ${health.environment} | DB: ${health.status}`}
    >
      <GitBranch className="w-3 h-3 shrink-0" />
      <span>{health.branch}</span>
      <span className="opacity-50">•</span>
      <span className="uppercase text-[9px] px-1 py-0.5 rounded bg-black/20">
        {health.environment}
      </span>
      {health.status === "healthy" ? (
        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
      ) : (
        <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
      )}
    </div>
  );
}
