"use client";

import { useState } from "react";
import { X, FileCheck2, CheckCircle2, HelpCircle, AlertCircle } from "lucide-react";

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ppiPlanId: string;
  studentName: string;
  shortTermGoal: string;
}

export default function EvaluationModal({
  isOpen,
  onClose,
  onSuccess,
  ppiPlanId,
  studentName,
  shortTermGoal,
}: EvaluationModalProps) {
  const [score, setScore] = useState<"MANDIRI" | "DENGAN_BANTUAN" | "BELUM_MAMPU">("MANDIRI");
  const [narrativeNotes, setNarrativeNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    setLoading(true);
    try {
      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ppiPlanId,
          score,
          narrativeNotes,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal menyimpan evaluasi");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <FileCheck2 className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Input Evaluasi Harian PPI</h2>
              <p className="text-xs text-emerald-100">{studentName}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
            <span className="font-bold text-slate-800 block mb-0.5">Target Jangka Pendek PPI:</span>
            {shortTermGoal}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Skor Capaian Hari Ini *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setScore("MANDIRI")}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                  score === "MANDIRI"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-400 font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold">Mandiri</span>
              </button>

              <button
                type="button"
                onClick={() => setScore("DENGAN_BANTUAN")}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                  score === "DENGAN_BANTUAN"
                    ? "bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-400 font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold">Dg Bantuan</span>
              </button>

              <button
                type="button"
                onClick={() => setScore("BELUM_MAMPU")}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                  score === "BELUM_MAMPU"
                    ? "bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-400 font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-bold">Belum</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Catatan Observasi Pertemuan Hari Ini
            </label>
            <textarea
              rows={3}
              value={narrativeNotes}
              onChange={(e) => setNarrativeNotes(e.target.value)}
              placeholder="Contoh: Ananda mampu menyelesaikan 8 dari 10 instruksi dengan tersenyum dan kooperatif..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Evaluasi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
