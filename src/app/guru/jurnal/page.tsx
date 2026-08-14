"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import {
  HeartHandshake,
  PlusCircle,
  Sparkles,
  Calendar,
  Smile,
  Utensils,
  Activity,
  MessageCircle,
  X,
  Send,
} from "lucide-react";

export default function GuruJurnalPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [studentId, setStudentId] = useState("");
  const [mood, setMood] = useState("Gembira & Fokus");
  const [healthCondition, setHealthCondition] = useState("Sehat bugar");
  const [eatingNote, setEatingNote] = useState("Makan bekal habis mandiri");
  const [learningActivity, setLearningActivity] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resStudents, resJournals] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/journal"),
      ]);
      const dataStudents = await resStudents.json();
      const dataJournals = await resJournals.json();

      setStudents(Array.isArray(dataStudents) ? dataStudents : []);
      if (Array.isArray(dataStudents) && dataStudents.length > 0 && !studentId) {
        setStudentId(dataStudents[0].id);
      }
      setJournals(Array.isArray(dataJournals) ? dataJournals : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !learningActivity.trim()) return;

    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          mood,
          healthCondition,
          eatingNote,
          learningActivity,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setLearningActivity("");
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
          title="Buku Penghubung Digital (Jurnal Harian SLB)"
          subtitle="Komunikasi Real-Time Kondisi Emosi, Terapi Sensori & Laporan Harian antara Guru dan Orang Tua"
        />

        <div className="p-6 space-y-6 max-w-7xl">
          {/* Action Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-800 via-emerald-800 to-teal-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur rounded-full text-xs font-semibold mb-2">
                <HeartHandshake className="w-3.5 h-3.5" /> Jembatan Komunikasi Sekolah & Rumah
              </div>
              <h2 className="text-xl sm:text-2xl font-black">Catatan Aktivitas & Respon Harian</h2>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
                Catat suasana hati ananda, asupan makan bekal, dan fokus aktivitas terapi sensori di kelas agar orang tua dapat melanjutkan pembiasaan di rumah.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-white text-teal-800 hover:bg-teal-50 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0"
            >
              <PlusCircle className="w-4 h-4 text-teal-600" />
              <span>+ Tulis Buku Penghubung Hari Ini</span>
            </button>
          </div>

          {/* Journal Entries List */}
          {loading ? (
            <div className="bg-white rounded-3xl p-12 text-center text-xs text-slate-400">Memuat buku penghubung...</div>
          ) : journals.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto">
                <HeartHandshake className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-base text-slate-800">Belum Ada Catatan Hari Ini</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Klik tombol di atas untuk mengirim kabar harian aktivitas ananda ke orang tua.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {journals.map((j) => (
                <div key={j.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-3">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900">{j.student?.name}</h3>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                          {j.student?.disabilityType}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(j.date).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    </div>

                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                      {j.mood}
                    </span>
                  </div>

                  {/* Badges / Conditions */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="truncate">Kesehatan: <strong>{j.healthCondition}</strong></span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">Makan: <strong>{j.eatingNote}</strong></span>
                    </div>
                  </div>

                  {/* Activity Narrative */}
                  <div className="text-xs text-slate-700 bg-teal-50/50 p-3 rounded-xl border border-teal-100/70">
                    <span className="font-bold text-teal-900 block mb-1">Aktivitas di Sekolah Hari Ini:</span>
                    <p className="leading-relaxed">{j.learningActivity}</p>
                  </div>

                  {/* Parent Feedback */}
                  {j.parentFeedback ? (
                    <div className="text-xs text-emerald-950 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 flex items-start gap-2">
                      <MessageCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-emerald-900">Respon Orang Tua di Rumah:</span>
                        <p className="italic">"{j.parentFeedback}"</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic">
                      Menunggu konfirmasi / catatan respon dari orang tua di rumah.
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Dicatat oleh: {j.teacher?.name || "Guru Kelas"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal Tulis Jurnal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-teal-700 to-emerald-700 px-6 py-4 flex items-center justify-between text-white">
              <h2 className="font-bold text-lg">Catat Buku Penghubung Harian</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJournal} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Pilih Siswa *</label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm bg-slate-50"
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
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Suasana Hati (Mood) *</label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                >
                  <option value="Gembira & Fokus">😊 Gembira & Sangat Fokus</option>
                  <option value="Tenang & Kooperatif">🙂 Tenang & Kooperatif</option>
                  <option value="Gelisah / Butuh Stimulasi Sensori">😐 Gelisah / Butuh Stimulasi Sensori</option>
                  <option value="Tantrum / Kelelahan">🙁 Sempat Tantrum / Butuh Bimbingan Ekstra</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Kondisi Kesehatan</label>
                  <input
                    type="text"
                    value={healthCondition}
                    onChange={(e) => setHealthCondition(e.target.value)}
                    placeholder="Sehat bugar / Minum obat"
                    className="w-full px-3 py-2 rounded-xl border text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Makan Siang / Bekal</label>
                  <input
                    type="text"
                    value={eatingNote}
                    onChange={(e) => setEatingNote(e.target.value)}
                    placeholder="Habis mandiri"
                    className="w-full px-3 py-2 rounded-xl border text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Aktivitas Terapi & Belajar Hari Ini *</label>
                <textarea
                  rows={3}
                  value={learningActivity}
                  onChange={(e) => setLearningActivity(e.target.value)}
                  placeholder="Ceritakan kegiatan ananda hari ini (misal: meronce 15 menit, latihan isyarat nama hewan, latihan motorik halus)..."
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600">Batal</button>
                <button type="submit" className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow">Kirim ke Buku Penghubung</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
