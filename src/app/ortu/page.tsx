"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Link from "next/link";
import {
  HeartHandshake,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  AlertCircle,
  Calendar,
  Phone,
  MessageCircle,
  BookOpen,
  ClipboardCheck,
  Target,
  Printer,
  Smile,
  Activity,
  Utensils,
  Send,
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function OrtuDashboard() {
  const { data: session } = useSession();
  const [students, setStudents] = useState<any[]>([]);
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  // Parent feedback state
  const [feedbackText, setFeedbackText] = useState<{ [key: string]: string }>({});
  const [submittingFeedback, setSubmittingFeedback] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resStudents, resJournals] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/journal"),
      ]);
      const dataStudents = await resStudents.json();
      const dataJournals = await resJournals.json();

      const studentArr = Array.isArray(dataStudents) ? dataStudents : [];
      setStudents(studentArr);
      if (studentArr.length > 0 && !selectedStudentId) {
        setSelectedStudentId(studentArr[0].id);
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

  const handleSendFeedback = async (journalId: string) => {
    const text = feedbackText[journalId];
    if (!text || !text.trim()) return;

    setSubmittingFeedback(journalId);
    try {
      const res = await fetch("/api/journal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journalId,
          parentFeedback: text,
        }),
      });

      if (res.ok) {
        setFeedbackText((prev) => ({ ...prev, [journalId]: "" }));
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingFeedback(null);
    }
  };

  const child = students.find((s) => s.id === selectedStudentId) || students[0];
  const ppiPlans = child?.ppiPlans || [];
  const latestPpi = ppiPlans[0];
  const assessments = child?.assessments || [];
  const evaluations = latestPpi?.evaluations || [];
  const studentJournals = journals.filter((j) => !child || j.studentId === child.id);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <Header
          title="Portal Orang Tua & Wali Siswa"
          subtitle="Pemantauan Terpadu Progres PPI, Catatan Asesmen, & Buku Penghubung Harian SLB"
        />

        <div className="p-4 sm:p-6 space-y-6 max-w-7xl">
          {/* Multi-child selector if parent has more than 1 child */}
          {students.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Pilih Ananda:</span>
              {students.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStudentId(s.id)}
                  className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    child?.id === s.id
                      ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  👦 {s.name}
                </button>
              ))}
            </div>
          )}

          {/* Child Identity Banner */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-teal-800 text-white shadow-xl shadow-teal-800/10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl sm:text-3xl shadow-inner border border-white/30 shrink-0">
                👦
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-white/20 rounded-full text-[11px] sm:text-xs font-semibold mb-1 text-emerald-100">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Profil Ananda Tercinta
                </div>
                <h2 className="text-xl sm:text-2xl font-black">{child?.name || "Memuat Ananda..."}</h2>
                <p className="text-emerald-100 text-xs sm:text-sm">
                  NISN: {child?.nisn || "-"} • Jenjang: <strong>{child?.jenjang || "SDLB"}</strong> • Disabilitas:{" "}
                  <strong>{child?.disabilityType || "Autisme"}</strong>
                </p>
              </div>
            </div>

            {/* Quick Actions (Cetak Rapor PPI, Cetak Asesmen & WA Guru) */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {latestPpi ? (
                <Link
                  href={`/guru/ppi/cetak/${latestPpi.id}`}
                  className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-emerald-700" />
                  <span>Cetak Rapor PPI</span>
                </Link>
              ) : (
                <button
                  disabled
                  className="px-3 py-2 sm:px-3.5 sm:py-2.5 bg-white/20 text-emerald-100/70 font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-not-allowed"
                >
                  <Printer className="w-4 h-4 opacity-50" />
                  <span>PPI Belum Disusun</span>
                </button>
              )}

              {assessments.length > 0 && (
                <Link
                  href={`/guru/asesmen/cetak/${assessments[0].id}`}
                  className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md border border-white/20 transition-all flex items-center gap-1.5"
                >
                  <ClipboardCheck className="w-4 h-4 text-emerald-200" />
                  <span>Cetak Asesmen</span>
                </Link>
              )}

              <div className="bg-white/10 backdrop-blur-md p-2 sm:p-2.5 rounded-2xl border border-white/20 flex items-center gap-2.5 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-emerald-200 font-bold">Wali Kelas SLB</div>
                  <a
                    href="https://wa.me/6281345678901?text=Halo%20Bapak/Ibu%20Guru,%20saya%20orang%20tua%20dari%20ananda%20ingin%20konsultasi"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-white hover:underline block"
                  >
                    Chat WA Guru →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Buku Penghubung Harian (Digital Communication Log) */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-teal-600 shrink-0" />
                <h3 className="font-bold text-sm sm:text-base text-slate-800">
                  Buku Penghubung Harian (Kabar dari Sekolah)
                </h3>
              </div>
              <span className="text-[10px] sm:text-xs text-slate-400">Update Terkini</span>
            </div>

            {studentJournals.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Belum ada catatan buku penghubung untuk ananda hari ini.
              </div>
            ) : (
              <div className="space-y-4">
                {studentJournals.map((j) => (
                  <div
                    key={j.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-bold text-xs text-slate-800">
                          {new Date(j.date).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-emerald-100 text-emerald-800 text-[11px] sm:text-xs font-bold rounded-full border border-emerald-200 shrink-0">
                        {j.mood}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-white rounded-xl border border-slate-100 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>Kondisi Kesehatan: <strong>{j.healthCondition}</strong></span>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-100 flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Makan Siang: <strong>{j.eatingNote}</strong></span>
                      </div>
                    </div>

                    <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 text-xs text-slate-700 leading-relaxed">
                      <span className="font-bold text-teal-900 block mb-1">Aktivitas Terapi & Belajar di Kelas:</span>
                      {j.learningActivity}
                    </div>

                    {/* Respon Orang Tua */}
                    {j.parentFeedback ? (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
                        <MessageCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-emerald-900">Catatan Ayah/Bunda di Rumah:</span>
                          <p className="italic">"{j.parentFeedback}"</p>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Kirim Respon / Kabar dari Rumah untuk Guru:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Contoh: Terima kasih Bapak/Ibu Guru, di rumah ananda juga sudah bisa cuci tangan sendiri sebelum makan malam."
                            value={feedbackText[j.id] || ""}
                            onChange={(e) =>
                              setFeedbackText((prev) => ({ ...prev, [j.id]: e.target.value }))
                            }
                            className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                          <button
                            onClick={() => handleSendFeedback(j.id)}
                            disabled={submittingFeedback === j.id}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Kirim</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grid: Target PPI & Catatan Asesmen Guru */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Target PPI */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-base text-slate-800">Target Pembelajaran PPI</h3>
                </div>
                {latestPpi && (
                  <Link
                    href={`/guru/ppi/cetak/${latestPpi.id}`}
                    className="text-xs font-bold text-teal-600 hover:text-teal-800 hover:underline flex items-center gap-1 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100"
                  >
                    <Printer className="w-3.5 h-3.5" /> Cetak Rapor PPI
                  </Link>
                )}
              </div>

              {latestPpi ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border">
                    <span className="font-bold text-slate-700 block mb-0.5">Baseline Kemampuan Awal:</span>
                    <p className="text-slate-600">{latestPpi.currentCapability}</p>
                  </div>

                  <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                    <span className="font-bold text-indigo-900 block mb-0.5">Target Jangka Panjang:</span>
                    <p className="text-indigo-950 font-medium">{latestPpi.longTermGoal}</p>
                  </div>

                  <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100">
                    <span className="font-bold text-teal-900 block mb-0.5">🎯 Target Latihan Mingguan:</span>
                    <p className="text-teal-950 font-bold">{latestPpi.shortTermGoal}</p>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">PPI sedang dalam proses penyusunan oleh Guru SLB.</div>
              )}
            </div>

            {/* Catatan Asesmen Guru */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-base text-slate-800">Asesmen Kemampuan Guru</h3>
                </div>
                {assessments.length > 0 && (
                  <Link
                    href={`/guru/asesmen/cetak/${assessments[0].id}`}
                    className="text-xs font-bold text-teal-600 hover:text-teal-800 hover:underline flex items-center gap-1 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100"
                  >
                    <Printer className="w-3.5 h-3.5" /> Cetak Asesmen
                  </Link>
                )}
              </div>

              <div className="space-y-3">
                {assessments.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">Belum ada data asesmen kemampuan untuk ananda.</div>
                ) : (
                  assessments.slice(0, 4).map((as: any) => (
                    <div key={as.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5 hover:border-slate-300 transition-colors">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>{as.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">{as.score}</span>
                          <Link
                            href={`/guru/asesmen/cetak/${as.id}`}
                            className="text-teal-700 hover:text-teal-900 p-1 hover:bg-teal-100/70 rounded transition-colors"
                            title="Cetak Berkas Asesmen Ini"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-700 font-semibold">{as.aspect}</p>
                      <p className="text-[11px] text-slate-500 italic">"{as.findings}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
