"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { BookOpen, PlusCircle, FileText, Calendar, CheckCircle2, Clock, X } from "lucide-react";

export default function GuruMateriPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [assignmentInstructions, setAssignmentInstructions] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/materials");
      const data = await res.json();
      setMaterials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // For demonstration, use first class/subject if available or create
      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          classId: materials[0]?.classId || "demo-class",
          subjectId: materials[0]?.subjectId || "demo-subject",
          assignmentInstructions,
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setTitle("");
        setContent("");
        setAssignmentInstructions("");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <Header
          title="Materi Pembelajaran & Tugas Khusus"
          subtitle="Modul Adaptif, Panduan Bergambar, & Lembar Kerja Khusus Siswa SLB"
        />

        <div className="p-6 space-y-6 max-w-7xl">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-800 to-indigo-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur rounded-full text-xs font-semibold mb-2">
                <BookOpen className="w-3.5 h-3.5" /> Media Adaptif Ramah Sensori
              </div>
              <h2 className="text-xl sm:text-2xl font-black">Bank Materi & Panduan Belajar di Rumah</h2>
              <p className="text-teal-100 text-xs sm:text-sm mt-1 max-w-xl">
                Bagikan panduan visual, video gerakan isyarat, dan panduan stimulasi mandiri agar orang tua dapat membimbing ananda di rumah.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-white text-teal-800 hover:bg-teal-50 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0"
            >
              <PlusCircle className="w-4 h-4 text-teal-600" />
              <span>+ Buat Materi Baru</span>
            </button>
          </div>

          {/* Materials Cards */}
          {loading ? (
            <div className="bg-white rounded-3xl p-12 text-center text-xs text-slate-400">Memuat materi...</div>
          ) : materials.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-xs text-slate-400">Belum ada materi pembelajaran yang diunggah.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materials.map((m) => (
                <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                        {m.subject?.name || "Bina Diri"}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 mt-1.5">{m.title}</h3>
                      <p className="text-xs text-slate-500">{m.class?.name}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                    {m.content}
                  </p>

                  {m.assignments && m.assignments.length > 0 && (
                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/70 text-xs">
                      <span className="font-bold text-amber-900 block mb-1">📝 Tugas / Aktivitas Orang Tua:</span>
                      <p className="text-amber-800 italic">{m.assignments[0].instructions}</p>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span>Dibuat oleh: {m.createdBy?.name || "Guru"}</span>
                    <span>{new Date(m.createdAt).toLocaleDateString("id-ID")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Material Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-teal-700 to-indigo-700 px-6 py-4 flex items-center justify-between text-white">
              <h2 className="font-bold text-lg">Unggah Materi Adaptif</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateMaterial} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Judul Materi *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Panduan Mengancingkan Kemeja Mandiri"
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Deskripsi & Langkah Instruksi *</label>
                <textarea
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tuliskan petunjuk visual dan langkah-langkah latihan..."
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Instruksi Tugas Praktik Orang Tua (Opsional)</label>
                <textarea
                  rows={2}
                  value={assignmentInstructions}
                  onChange={(e) => setAssignmentInstructions(e.target.value)}
                  placeholder="Contoh: Rekam video 30 detik saat anak mempraktikkan di rumah"
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600">Batal</button>
                <button type="submit" className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl">Simpan Materi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
