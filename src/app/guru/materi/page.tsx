"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { BookOpen, PlusCircle, FileText, Calendar, CheckCircle2, Clock, X } from "lucide-react";

export default function GuruMateriPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const teacherClass = classes[0];

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [assignmentInstructions, setAssignmentInstructions] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resClasses, resSubjects, resMaterials] = await Promise.all([
        fetch("/api/classes"),
        fetch("/api/subjects"),
        fetch("/api/materials"),
      ]);
      const dataClasses = await resClasses.json();
      const dataSubjects = await resSubjects.json();
      const dataMaterials = await resMaterials.json();

      setClasses(Array.isArray(dataClasses) ? dataClasses : []);
      setSubjects(Array.isArray(dataSubjects) ? dataSubjects : []);
      setMaterials(Array.isArray(dataMaterials) ? dataMaterials : []);

      if (Array.isArray(dataSubjects) && dataSubjects.length > 0 && !subjectId) {
        setSubjectId(dataSubjects[0].id);
      }
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
    if (!teacherClass) {
      alert("Akun Anda belum ditugaskan ke rombel kelas oleh Admin");
      return;
    }
    const targetSubjectId = subjectId || subjects[0]?.id;

    if (!title.trim() || !content.trim() || !targetSubjectId) {
      alert("Mohon lengkapi judul, deskripsi, dan mata pelajaran");
      return;
    }

    try {
      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          classId: teacherClass.id,
          subjectId: targetSubjectId,
          assignmentInstructions,
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setTitle("");
        setContent("");
        setAssignmentInstructions("");
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal membuat materi");
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
          subtitle="Modul Adaptif, Panduan Bergambar, & Lembar Kerja Khusus Siswa Rombel Binaan"
        />

        <div className="p-4 sm:p-6 space-y-6 max-w-7xl">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-800 to-indigo-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur rounded-full text-xs font-semibold mb-2">
                <BookOpen className="w-3.5 h-3.5" /> {teacherClass ? `${teacherClass.name} (${teacherClass.jenjang})` : "Media Adaptif Ramah Sensori"}
              </div>
              <h2 className="text-xl sm:text-2xl font-black">Bank Materi & Panduan Belajar di Rumah</h2>
              <p className="text-teal-100 text-xs sm:text-sm mt-1 max-w-xl">
                Bagikan panduan visual, video gerakan isyarat, dan panduan stimulasi mandiri untuk rombel kelas yang Anda ampu.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              disabled={!teacherClass}
              className="px-5 py-2.5 bg-white text-teal-800 hover:bg-teal-50 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4 text-teal-600" />
              <span>+ Buat Materi Baru</span>
            </button>
          </div>

          {/* Materials Grid */}
          {loading ? (
            <div className="bg-white rounded-3xl p-12 text-center text-xs text-slate-400">Memuat materi...</div>
          ) : materials.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-base text-slate-800">Belum Ada Materi Pembelajaran</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Klik tombol di atas untuk mengunggah materi atau panduan tugas adaptif untuk siswa di kelas ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((m) => (
                <div key={m.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-teal-50 text-teal-800 text-[11px] font-bold rounded-lg border border-teal-200">
                        {m.subject?.name || "Umum"}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        {m.class?.name}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-2">{m.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{m.content}</p>
                  </div>

                  {m.assignmentInstructions && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                      <div className="text-[10px] font-bold text-amber-900 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Tugas Praktik Orang Tua:</span>
                      </div>
                      <p className="text-xs text-amber-950 line-clamp-2">{m.assignmentInstructions}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal Upload Materi */}
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

              {/* Rombel Class Readonly Info Box */}
              <div className="p-3.5 bg-gradient-to-r from-teal-50 to-indigo-50 border border-teal-200 rounded-2xl space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Target Rombel Kelas (Otomatis):</span>
                </div>
                <div className="text-xs font-black text-teal-950 flex items-center justify-between">
                  <span>{teacherClass?.name || "Kelas Binaan"}</span>
                  <span className="px-2 py-0.5 rounded-lg bg-teal-700 text-white text-[10px] font-bold">
                    Jenjang {teacherClass?.jenjang || "SDLB"}
                  </span>
                </div>
                <p className="text-[10px] text-teal-700 italic">
                  * Materi akan langsung dibagikan kepada seluruh siswa dan orang tua pada rombel kelas binaan Anda.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Mata Pelajaran / Bidang *</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm bg-slate-50"
                  required
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
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
