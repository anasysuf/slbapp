"use client";

import { useState } from "react";
import { X, Target, Sparkles, AlertCircle } from "lucide-react";

interface Student {
  id: string;
  name: string;
  nisn: string;
  disabilityType: string;
}

interface PpiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  students: Student[];
  initialStudentId?: string;
  defaultRecommendation?: string;
}

export default function PpiModal({
  isOpen,
  onClose,
  onSuccess,
  students,
  initialStudentId,
  defaultRecommendation,
}: PpiModalProps) {
  const [studentId, setStudentId] = useState(initialStudentId || (students[0]?.id || ""));
  const [academicYear, setAcademicYear] = useState("2026/2027");
  const [currentCapability, setCurrentCapability] = useState("");
  const [longTermGoal, setLongTermGoal] = useState("");
  const [shortTermGoal, setShortTermGoal] = useState(defaultRecommendation || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!studentId || !academicYear || !currentCapability || !longTermGoal || !shortTermGoal) {
      setError("Lengkapi semua field PPI");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ppi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          academicYear,
          currentCapability,
          longTermGoal,
          shortTermGoal,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal membuat rencana PPI");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
        <div className="bg-gradient-to-r from-teal-700 to-indigo-700 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <Target className="w-6 h-6 text-teal-100" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Penyusunan Program Pembelajaran Individual (PPI)</h2>
              <p className="text-xs text-teal-100">Menetapkan baseline kemampuan & target capaian anak SLB</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Siswa SLB *
              </label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50"
                required
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.disabilityType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Tahun Ajaran / Semester *
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2026/2027 Ganjil"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              1. Deskripsi Kemampuan Saat Ini (Baseline / Hasil Asesmen) *
            </label>
            <textarea
              rows={3}
              value={currentCapability}
              onChange={(e) => setCurrentCapability(e.target.value)}
              placeholder="Contoh: Ananda mampu fokus selama 5 menit, sudah mengenali 10 simbol PECS, dan mampu membedakan warna primer..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              2. Tujuan Jangka Panjang (1 Semester / 1 Tahun) *
            </label>
            <textarea
              rows={2}
              value={longTermGoal}
              onChange={(e) => setLongTermGoal(e.target.value)}
              placeholder="Contoh: Mampu mandiri dalam merawat diri (makan & pakai sepatu) serta meningkatkan konsentrasi tugas hingga 15 menit..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              3. Tujuan Jangka Pendek (Target Spesifik & Terukur) *
            </label>
            <textarea
              rows={3}
              value={shortTermGoal}
              onChange={(e) => setShortTermGoal(e.target.value)}
              placeholder="Contoh: 1) Menyelesaikan puzzle 12 keping. 2) Mencuci tangan 6 langkah mandiri setelah makan."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
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
              className="px-5 py-2.5 bg-gradient-to-r from-teal-700 to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Rencana PPI"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
