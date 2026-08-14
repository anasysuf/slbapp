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
  Image as ImageIcon,
  Check,
} from "lucide-react";
import Footer from "@/components/Footer";


export default function GuruJurnalPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const teacherClass = classes[0];

  // Form states
  const [studentId, setStudentId] = useState("");
  const [mood, setMood] = useState("Gembira & Fokus");
  const [healthCondition, setHealthCondition] = useState("Sehat bugar");
  const [eatingNote, setEatingNote] = useState("Makan bekal habis mandiri");
  const [learningActivity, setLearningActivity] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resClasses, resStudents, resJournals] = await Promise.all([
        fetch("/api/classes"),
        fetch("/api/students"),
        fetch("/api/journal"),
      ]);
      const dataClasses = await resClasses.json();
      const dataStudents = await resStudents.json();
      const dataJournals = await resJournals.json();

      setClasses(Array.isArray(dataClasses) ? dataClasses : []);
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
          photoUrl: photoUrl.trim() || null,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setLearningActivity("");
        setPhotoUrl("");
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

        <div className="p-4 sm:p-6 space-y-6 max-w-7xl">
          {/* Action Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-800 via-emerald-800 to-teal-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur rounded-full text-xs font-semibold mb-2">
                <HeartHandshake className="w-3.5 h-3.5" /> {teacherClass ? `${teacherClass.name} (${teacherClass.jenjang})` : "Buku Penghubung Khusus"}
              </div>
              <h2 className="text-xl sm:text-2xl font-black">Buku Penghubung Harian</h2>
              <p className="text-teal-100 text-xs sm:text-sm mt-1 max-w-2xl">
                Catat kondisi harian ananda di sekolah untuk terus terhubung dengan orang tua secara transparan dan membangun sinergi pembelajaran di rumah.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-white text-teal-900 hover:bg-teal-50 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0"
            >
              <PlusCircle className="w-4 h-4 text-teal-600" />
              <span>+ Tulis Catatan Hari Ini</span>
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
                <div key={j.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
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

                      <span className="px-3 py-1 bg-teal-50 text-teal-800 text-xs font-bold rounded-full border border-teal-200">
                        {j.mood}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>Kondisi: <strong>{j.healthCondition}</strong></span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Makan: <strong>{j.eatingNote}</strong></span>
                      </div>
                    </div>

                    <div className="p-3 bg-teal-50/40 rounded-xl border border-teal-100 text-xs text-slate-700 leading-relaxed">
                      <span className="font-bold text-teal-900 block mb-1">Aktivitas Terapi & Pembelajaran:</span>
                      {j.learningActivity}
                    </div>

                    {/* Foto Lampiran Dokumentasi */}
                    {j.photoUrl && (
                      <div className="rounded-xl overflow-hidden max-h-48 bg-slate-100 border border-slate-200">
                        <img
                          src={j.photoUrl}
                          alt="Dokumentasi Terapi"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

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
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Dicatat oleh: {j.teacher?.name || "Guru Kelas"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <Footer />
      </main>


      {/* Modal Tulis Jurnal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-teal-700 to-emerald-700 px-6 py-4 flex items-center justify-between text-white shrink-0">
              <h2 className="font-bold text-base sm:text-lg">Catat Buku Penghubung Harian</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJournal} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Pilih Siswa *</label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-slate-50 focus:ring-2 focus:ring-teal-500 font-semibold"
                  required
                >
                  {students.map((s) => {
                    const className = s.classes?.[0]?.class?.name;
                    return (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.disabilityType}){className ? ` • ${className}` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Suasana Hati (Mood) *</label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-slate-50 focus:ring-2 focus:ring-teal-500 font-semibold"
                >
                  <option value="Gembira & Fokus">😊 Gembira & Sangat Fokus</option>
                  <option value="Tenang & Kooperatif">🙂 Tenang & Kooperatif</option>
                  <option value="Gelisah / Butuh Stimulasi Sensori">😐 Gelisah / Butuh Stimulasi Sensori</option>
                  <option value="Tantrum / Kelelahan">🙁 Sempat Tantrum / Butuh Bimbingan Ekstra</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Kondisi Kesehatan</label>
                  <input
                    type="text"
                    value={healthCondition}
                    onChange={(e) => setHealthCondition(e.target.value)}
                    placeholder="Sehat bugar / Minum obat"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Makan Siang / Bekal</label>
                  <input
                    type="text"
                    value={eatingNote}
                    onChange={(e) => setEatingNote(e.target.value)}
                    placeholder="Habis mandiri"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Aktivitas Terapi & Belajar Hari Ini *</label>
                <textarea
                  rows={3}
                  value={learningActivity}
                  onChange={(e) => setLearningActivity(e.target.value)}
                  placeholder="Ceritakan kegiatan ananda hari ini (misal: meronce 15 menit, latihan isyarat nama hewan, latihan motorik halus)..."
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Foto Dokumentasi Kegiatan (Opsional)</label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://... atau tempel URL gambar kegiatan ananda"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-teal-500"
                />
                <div className="flex gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setPhotoUrl("https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&auto=format&fit=crop&q=80")}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-colors"
                  >
                    + Contoh Foto Melukis
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoUrl("https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&auto=format&fit=crop&q=80")}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-colors"
                  >
                    + Contoh Foto Terapi Sensori
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-lg shadow-teal-700/20 transition-all">Kirim ke Buku Penghubung</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
