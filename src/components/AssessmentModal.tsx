"use client";

import { useState } from "react";
import { X, ClipboardCheck, Sparkles, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";

interface Student {
  id: string;
  name: string;
  nisn: string;
  disabilityType: string;
  classes?: Array<{ class: { id: string; name: string; jenjang: string } }>;
}

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  students: Student[];
  initialStudentId?: string;
}

const CATEGORIES = [
  {
    name: "Bina Diri (ADL)",
    description: "Kemandirian makan, minum, berpakaian, kebersihan diri & toilet training",
    aspects: [
      "Kemampuan Memakai Sepatu / Pakaian Sendiri",
      "Kemandirian Cuci Tangan & Menyikat Gigi",
      "Kemandirian Makan & Merapikan Alat Makan",
      "Pengenalan Sensasi Toilet & Kebersihan",
    ],
  },
  {
    name: "Bahasa & Komunikasi",
    description: "Komunikasi verbal, isyarat BISINDO/SIBI, kartu PECS, artikulasi suara",
    aspects: [
      "Penguasaan Kosakata Isyarat Benda Sekitar",
      "Penggunaan Kartu Gambar PECS untuk Kebutuhan",
      "Merespons Panggilan Nama & Kontak Mata",
      "Pemahaman Instruksi Sederhana 1-2 Tahap",
    ],
  },
  {
    name: "Motorik Kasar & Halus",
    description: "Keseimbangan tubuh, koordinasi mata-tangan, sensori raba & menulis",
    aspects: [
      "Koordinasi Memegang Pensil / Sendok / Alat Tulis",
      "Keseimbangan Berjalan di Garis Lurus / Tangga",
      "Meronce / Menyusun Balok / Puzzle",
      "Orientasi Tongkat Putih & Sensori Taktil (Braille)",
    ],
  },
  {
    name: "Kognitif / Akademik Fungsional",
    description: "Membaca permulaan, pengenalan simbol angka, pemecahan masalah",
    aspects: [
      "Pengenalan Huruf / Angka / Simbol Braille",
      "Mencocokkan Warna & Bentuk Geometri",
      "Konsep Nilai Uang Sederhana & Belanja",
      "Fokus Menyelesaikan Tugas 5-10 Menit",
    ],
  },
  {
    name: "Sosial Emosional & Perilaku",
    description: "Pengendalian emosi, toleransi transisi, adaptasi bermain bersama",
    aspects: [
      "Kesiapan Mengikuti Rutinitas Kelas",
      "Kemampuan Mengendalikan Tantrum / Stiming",
      "Bermain Bergantian Bersama Teman Sebaya",
    ],
  },
];

export default function AssessmentModal({
  isOpen,
  onClose,
  onSuccess,
  students,
  initialStudentId,
}: AssessmentModalProps) {
  const [studentId, setStudentId] = useState(initialStudentId || (students[0]?.id || ""));
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [title, setTitle] = useState("Asesmen Diagnostik & Perkembangan Awal Semester");
  const [aspect, setAspect] = useState(CATEGORIES[0].aspects[0]);
  const [customAspect, setCustomAspect] = useState("");
  const [score, setScore] = useState<"MANDIRI" | "DENGAN_BANTUAN" | "BELUM_MAMPU">("DENGAN_BANTUAN");
  const [findings, setFindings] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const currentCat = CATEGORIES.find((c) => c.name === category) || CATEGORIES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const finalAspect = customAspect.trim() ? customAspect.trim() : aspect;
    if (!studentId || !category || !title || !finalAspect || !findings.trim()) {
      setError("Mohon lengkapi data siswa, aspek yang dinilai, dan hasil observasi");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          category,
          title,
          aspect: finalAspect,
          score,
          findings,
          recommendation,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal menyimpan asesmen");
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
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-teal-100" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Input Instrumen Asesmen Siswa</h2>
              <p className="text-xs text-teal-100">Observasi diagnostik & pemetaan kemampuan dasar anak SLB</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Pilih Siswa & Judul Asesmen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Pilih Siswa SLB *
              </label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50"
                required
              >
                {students.map((s) => {
                  const className = s.classes?.[0]?.class?.name;
                  return (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.disabilityType}){className ? ` • ${className}` : ""} - NISN: {s.nisn}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nama / Periode Asesmen *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Asesmen Diagnostik Awal Tahun"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Kategori Kemampuan Khusus */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Kategori Bidang Asesmen *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.name}
                  onClick={() => {
                    setCategory(cat.name);
                    setAspect(cat.aspects[0]);
                  }}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border text-left transition-all ${
                    category === cat.name
                      ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 italic">{currentCat.description}</p>
          </div>

          {/* Aspek yang Dinilai */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Aspek / Indikator Kemampuan yang Diamati *
            </label>
            <select
              value={aspect}
              onChange={(e) => setAspect(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none mb-2"
            >
              {currentCat.aspects.map((asp) => (
                <option key={asp} value={asp}>
                  {asp}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Atau ketik aspek custom sendiri..."
              value={customAspect}
              onChange={(e) => setCustomAspect(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-700"
            />
          </div>

          {/* Skala Capaian Skor Kemampuan */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Hasil Capaian Kemampuan Siswa *
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setScore("MANDIRI")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                  score === "MANDIRI"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-400 font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold">🟢 MANDIRI</span>
                <span className="text-[10px] text-slate-500 font-normal">Mampu tanpa bantuan</span>
              </button>

              <button
                type="button"
                onClick={() => setScore("DENGAN_BANTUAN")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                  score === "DENGAN_BANTUAN"
                    ? "bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-400 font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <HelpCircle className="w-5 h-5 text-amber-600" />
                <span className="text-xs font-bold">🟡 DENGAN BANTUAN</span>
                <span className="text-[10px] text-slate-500 font-normal">Perlu arahan / prompting</span>
              </button>

              <button
                type="button"
                onClick={() => setScore("BELUM_MAMPU")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                  score === "BELUM_MAMPU"
                    ? "bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-400 font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <span className="text-xs font-bold">🔴 BELUM MAMPU</span>
                <span className="text-[10px] text-slate-500 font-normal">Masih tahap pengenalan</span>
              </button>
            </div>
          </div>

          {/* Catatan Naratif Hasil Observasi */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Catatan Naratif Observasi Nyata di Kelas *
            </label>
            <textarea
              rows={3}
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              placeholder="Deskripsikan respon siswa, kendala sensori, atau tingkat kelancaran saat melakukan aktivitas..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          {/* Rekomendasi PPI */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Rekomendasi Tindak Lanjut untuk Program PPI (IEP)
            </label>
            <input
              type="text"
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder="Contoh: Jadikan target jangka pendek di PPI semester ganjil dan latih bersama orang tua"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-teal-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Hasil Asesmen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
