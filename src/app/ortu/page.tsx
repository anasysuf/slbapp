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
  Image as ImageIcon,
  Award,
  PlusCircle,
  X,
  Check,
  Edit3,
  Save,
} from "lucide-react";
import { useSession } from "next-auth/react";
import AspectRadarChart from "@/components/AspectRadarChart";
import StudentProgressTrendChart from "@/components/StudentProgressTrendChart";
import Footer from "@/components/Footer";



export default function OrtuDashboard() {
  const { data: session } = useSession();
  const [students, setStudents] = useState<any[]>([]);
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  // Parent feedback state
  const [feedbackText, setFeedbackText] = useState<{ [key: string]: string }>({});
  const [submittingFeedback, setSubmittingFeedback] = useState<string | null>(null);
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);

  // New Parent Note Modal State
  const [isParentNoteModalOpen, setIsParentNoteModalOpen] = useState(false);
  const [parentMood, setParentMood] = useState("Gembira & Fokus");
  const [parentHealth, setParentHealth] = useState("Sehat bugar");
  const [parentEating, setParentEating] = useState("Sarapan habis mandiri");
  const [parentNoteText, setParentNoteText] = useState("");
  const [submittingNewNote, setSubmittingNewNote] = useState(false);

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
        setEditingFeedbackId(null);
        setFeedbackText((prev) => ({ ...prev, [journalId]: "" }));
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingFeedback(null);
    }
  };

  const handleCreateParentNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!child || !parentNoteText.trim()) return;

    setSubmittingNewNote(true);
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: child.id,
          mood: parentMood,
          healthCondition: parentHealth,
          eatingNote: parentEating,
          learningActivity: parentNoteText,
          parentFeedback: parentNoteText,
        }),
      });

      if (res.ok) {
        setIsParentNoteModalOpen(false);
        setParentNoteText("");
        fetchData();
      } else {
        const errData = await res.json();
        alert(errData.error || "Gagal mengirim catatan dari rumah.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem saat mengirim catatan.");
    } finally {
      setSubmittingNewNote(false);
    }
  };


  const child = students.find((s) => s.id === selectedStudentId) || students[0];
  const ppiPlans = child?.ppiPlans || [];
  const latestPpi = ppiPlans[0];
  const assessments = child?.assessments || [];
  const evaluations = latestPpi?.evaluations || [];
  const studentJournals = journals.filter((j) => !child || j.studentId === child.id);

  // Compute 5-aspect scores for the child
  const mandiriAssessments = assessments.filter((a: any) => a.score === "MANDIRI").length;
  const independenceRate = assessments.length > 0 ? Math.round((mandiriAssessments / assessments.length) * 100) : 75;

  // Real 5-Aspect Scores calculated directly from child's actual assessments
  const standardAspects = [
    { category: "Bina Diri (ADL)", label: "Bina Diri (ADL)" },
    { category: "Motorik Kasar & Halus", label: "Fisik & Motorik" },
    { category: "Bahasa & Komunikasi", label: "Bahasa & Komunikasi" },
    { category: "Kognitif / Akademik", label: "Kognitif & Akademik" },
    { category: "Sosial Emosional", label: "Sosial & Emosi" },
  ];

  const childAspectScores = standardAspects.map((asp) => {
    const matched = assessments.filter(
      (a: any) =>
        a.category.toLowerCase().includes(asp.category.toLowerCase().split(" ")[0]) ||
        asp.category.toLowerCase().includes(a.category.toLowerCase().split(" ")[0])
    );
    const mandiri = matched.filter((a: any) => a.score === "MANDIRI").length;
    const bantuan = matched.filter((a: any) => a.score === "DENGAN_BANTUAN").length;
    const belum = matched.filter((a: any) => a.score === "BELUM_MAMPU").length;
    const total = matched.length;
    const score = total > 0 ? Math.round((mandiri * 100 + bantuan * 50) / total) : 0;

    return {
      category: asp.category,
      label: asp.label,
      score,
      total,
      mandiriCount: mandiri,
      denganBantuanCount: bantuan,
      belumMampuCount: belum,
    };
  });

  // WhatsApp Link Pre-filled calculation
  const teacherObj = child?.classes?.[0]?.class?.teacher;
  const teacherName = teacherObj?.name || "Bapak/Ibu Guru Wali Kelas";
  const studentName = child?.name || "ananda";
  const parentName = session?.user?.name || "Orang Tua";
  const className = child?.classes?.[0]?.class?.name || "Kelas SLB";
  const teacherPhone = teacherObj?.phone;

  const formatWhatsAppPhone = (phone?: string | null) => {
    if (!phone) return "6281345678901";
    let cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.slice(1);
    } else if (!cleaned.startsWith("62")) {
      cleaned = "62" + cleaned;
    }
    return cleaned;
  };

  const teacherPrefix =
    teacherName.toLowerCase().startsWith("bu ") ||
    teacherName.toLowerCase().startsWith("pak ") ||
    teacherName.toLowerCase().startsWith("ibu ") ||
    teacherName.toLowerCase().startsWith("bapak ")
      ? ""
      : "Bu / Pak ";

  const waMessage = `Halo ${teacherPrefix}${teacherName}, saya ${parentName} (Orang Tua dari ananda ${studentName}, ${className}). Saya ingin berkonsultasi mengenai perkembangan dan aktivitas belajar ananda di sekolah. Terima kasih.`;
  const waUrl = `https://wa.me/${formatWhatsAppPhone(teacherPhone)}?text=${encodeURIComponent(waMessage)}`;


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
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
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

            {/* Quick Actions */}
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

              <div className="bg-white/15 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 flex items-center gap-2.5 shrink-0 shadow-sm hover:bg-white/20 transition-all">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shrink-0">
                  <svg
                    className="w-5 h-5 fill-white shrink-0"
                    viewBox="0 0 24 24"
                  >
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] text-emerald-100 font-semibold truncate max-w-[140px] sm:max-w-[200px]">
                    Guru: {teacherName}
                  </div>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-white hover:underline flex items-center gap-1"
                  >
                    <span>Chat WA Guru →</span>
                  </a>
                </div>
              </div>
            </div>
          </div>


          {/* Radar Chart & Grafik Tren Kemandirian Ananda */}
          {child && (
            <>
              <AspectRadarChart
                studentName={child.name}
                aspectScores={childAspectScores}
              />


              {/* Grafik Tren Perkembangan Kemandirian Anak */}
              <StudentProgressTrendChart
                studentName={child.name}
                ppiPlans={child.ppiPlans || []}
              />
            </>
          )}


          {/* Section: Buku Penghubung Harian (Digital Communication Log) */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-3">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-teal-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-800">
                    Buku Penghubung Harian (Komunikasi Sekolah & Rumah)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Kirim kabar harian perkembangan ananda dari rumah atau tanggapi catatan guru
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-xs"
                >
                  <svg
                    className="w-3.5 h-3.5 fill-emerald-700 shrink-0"
                    viewBox="0 0 24 24"
                  >
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span>Chat WA Guru</span>
                </a>

                <button
                  onClick={() => {
                    setParentNoteText("");
                    setIsParentNoteModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Tulis Catatan dari Rumah</span>
                </button>
              </div>

            </div>

            {studentJournals.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 space-y-3">
                <p>Belum ada catatan buku penghubung untuk ananda hari ini.</p>
                <button
                  onClick={() => setIsParentNoteModalOpen(true)}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs transition-colors inline-flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Kirim Kabar / Catatan dari Rumah Sekarang</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {studentJournals.map((j) => {
                  const isEditingThis = editingFeedbackId === j.id;
                  const hasParentFeedback = Boolean(j.parentFeedback);

                  const isWrittenByParent =
                    j.authorRole === "ORANG_TUA" ||
                    (j.authorId && j.authorId === (session?.user as any)?.id) ||
                    (!j.authorRole && j.learningActivity?.toLowerCase().includes("orang tua"));

                  const isWrittenByAdmin = j.authorRole === "ADMIN";

                  const authorDisplayName =
                    j.authorName ||
                    j.author?.name ||
                    (isWrittenByParent
                      ? session?.user?.name || "Orang Tua / Wali"
                      : j.teacher?.name || "Guru Wali Kelas");

                  return (
                    <div
                      key={j.id}
                      className={`p-4 sm:p-5 rounded-3xl border space-y-3 transition-all ${
                        isWrittenByParent
                          ? "bg-emerald-50/30 border-emerald-300 ring-1 ring-emerald-200"
                          : "bg-slate-50 border-slate-200/90 hover:border-emerald-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-slate-200/60 pb-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              {new Date(j.date).toLocaleDateString("id-ID", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </span>

                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              isWrittenByParent
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : isWrittenByAdmin
                                ? "bg-purple-100 text-purple-800 border-purple-300"
                                : "bg-teal-100 text-teal-800 border-teal-300"
                            }`}>
                              {isWrittenByParent
                                ? "🏡 Catatan dari Rumah"
                                : isWrittenByAdmin
                                ? "🛡️ Catatan Admin"
                                : "🏫 Catatan Sekolah"}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Ditulis oleh: <strong className="text-slate-900">{authorDisplayName}</strong> ({isWrittenByParent ? "Ayah/Bunda" : isWrittenByAdmin ? "Admin" : "Guru Wali Kelas"})
                          </div>
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
                          <span>Makan: <strong>{j.eatingNote}</strong></span>
                        </div>
                      </div>

                      <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                        isWrittenByParent
                          ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                          : "bg-teal-50/60 border-teal-100 text-slate-700"
                      }`}>
                        <span className="font-bold block mb-1">
                          {isWrittenByParent ? "🏡 Kabar & Aktivitas dari Rumah:" : "🏫 Aktivitas Terapi & Belajar di Kelas:"}
                        </span>
                        {j.learningActivity}
                      </div>

                      {/* Foto Dokumentasi Terapi / Karya Siswa jika ada */}
                      {j.photoUrl && (
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
                            <span>Dokumentasi Kegiatan / Hasil Karya:</span>
                          </span>
                          <div className="rounded-xl overflow-hidden max-h-56 bg-slate-100 border border-slate-200 flex items-center justify-center">
                            <img
                              src={j.photoUrl}
                              alt="Dokumentasi Terapi"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}

                      {/* Respon Orang Tua */}
                      {hasParentFeedback && !isEditingThis ? (
                        <div className="p-3.5 bg-emerald-50/90 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                              <MessageCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                              <span>Catatan Respon Ayah/Bunda di Rumah:</span>
                            </div>
                            <button
                              onClick={() => {
                                setEditingFeedbackId(j.id);
                                setFeedbackText((prev) => ({ ...prev, [j.id]: j.parentFeedback || "" }));
                              }}
                              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-emerald-200 shadow-xs"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Ubah Catatan</span>
                            </button>
                          </div>
                          <p className="italic text-emerald-900 leading-relaxed bg-white/90 p-2.5 rounded-xl border border-emerald-100/80">
                            "{j.parentFeedback}"
                          </p>
                        </div>
                      ) : (
                        <div className="pt-2 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-200/80 space-y-2">
                          <label className="block text-xs font-bold text-emerald-950 flex items-center justify-between">
                            <span>{isEditingThis ? "Edit Respon / Catatan Rumah:" : "Kirim Respon / Kabar dari Rumah untuk Guru:"}</span>
                            {isEditingThis && (
                              <button
                                type="button"
                                onClick={() => setEditingFeedbackId(null)}
                                className="text-[11px] font-bold text-slate-500 hover:text-slate-700 hover:underline"
                              >
                                Batal
                              </button>
                            )}
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Contoh: Terima kasih Bapak/Ibu Guru, di rumah ananda juga sudah bisa cuci tangan mandiri sebelum makan..."
                              value={feedbackText[j.id] || ""}
                              onChange={(e) =>
                                setFeedbackText((prev) => ({ ...prev, [j.id]: e.target.value }))
                              }
                              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
                            />
                            <button
                              onClick={() => handleSendFeedback(j.id)}
                              disabled={submittingFeedback === j.id}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all shrink-0 disabled:opacity-50"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{isEditingThis ? "Simpan" : "Kirim"}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

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
                    <span className="font-bold text-indigo-900 block mb-0.5">
                      🎯 Target Capaian Jangka Pendek:
                    </span>
                    <p className="text-slate-700">{latestPpi.shortTermGoal}</p>
                  </div>

                  <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100">
                    <span className="font-bold text-teal-900 block mb-0.5">
                      🏆 Target Capaian Jangka Panjang:
                    </span>
                    <p className="text-slate-700">{latestPpi.longTermGoal}</p>
                  </div>

                  {evaluations.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="font-bold text-slate-700 block mb-2">Evaluasi Berkala Capaian:</span>
                      <div className="space-y-2">
                        {evaluations.map((ev: any) => (
                          <div
                            key={ev.id}
                            className="p-2.5 bg-white rounded-lg border flex items-start justify-between gap-2"
                          >
                            <div>
                              <span className="text-[11px] text-slate-400 block">
                                {new Date(ev.evaluationDate).toLocaleDateString("id-ID")}
                              </span>
                              <p className="text-slate-700 text-xs italic mt-0.5">"{ev.narrativeNotes}"</p>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                                ev.score === "MANDIRI"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : ev.score === "DENGAN_BANTUAN"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {ev.score}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Program Pembelajaran Individual (PPI) belum disusun oleh guru wali kelas.
                </div>
              )}
            </div>

            {/* Catatan Asesmen Diagnostik */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-base text-slate-800">Catatan Asesmen Khusus</h3>
                </div>
                <span className="text-xs text-slate-400">{assessments.length} Asesmen Terdata</span>
              </div>

              {assessments.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Belum ada catatan asesmen diagnostik dari guru.
                </div>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {assessments.map((a: any) => (
                    <div
                      key={a.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition-colors space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{a.category}</span>
                            <span className="text-[10px] font-semibold text-slate-400">
                              • {new Date(a.createdAt).toLocaleDateString("id-ID")}
                            </span>
                          </div>
                          <div className="text-[11px] font-semibold text-teal-700 mt-0.5">
                            Aspek: {a.aspect}
                          </div>
                        </div>

                        <div>
                          {a.score === "MANDIRI" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              🟢 Mandiri
                            </span>
                          )}
                          {a.score === "DENGAN_BANTUAN" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              🟡 Dengan Bantuan
                            </span>
                          )}
                          {a.score === "BELUM_MAMPU" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              🔴 Belum Mampu
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-slate-700 italic bg-white p-2.5 rounded-xl border border-slate-100">
                        "{a.findings}"
                      </div>

                      {a.recommendation && (
                        <div className="text-[11px] text-teal-900 font-medium">
                          💡 <strong>Rekomendasi di Rumah:</strong> {a.recommendation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </main>

      {/* Modal: Tulis Catatan dari Rumah */}
      {isParentNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 px-6 py-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-emerald-300" />
                <h2 className="font-bold text-base sm:text-lg">Kabar & Catatan dari Rumah</h2>
              </div>
              <button
                onClick={() => setIsParentNoteModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateParentNote} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
                <span className="font-semibold text-slate-600">Catatan untuk Ananda:</span>
                <span className="font-black text-emerald-900 text-sm">{child?.name}</span>
              </div>

              {/* Mood */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Suasana Hati / Mood Ananda *
                </label>
                <select
                  value={parentMood}
                  onChange={(e) => setParentMood(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold bg-slate-50"
                  required
                >
                  <option value="Gembira & Fokus">😄 Gembira & Sangat Bersemangat</option>
                  <option value="Tenang">😊 Tenang & Ceria</option>
                  <option value="Gelisah">😟 Sedang Gelisah / Butuh Pendampingan</option>
                  <option value="Tantrum">🥺 Sensitif / Sempat Tantrum</option>
                  <option value="Kurang Bersemangat">🥱 Mengantuk / Kurang Bersemangat</option>
                </select>
              </div>

              {/* Kondisi Kesehatan */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Kondisi Kesehatan *
                </label>
                <input
                  type="text"
                  value={parentHealth}
                  onChange={(e) => setParentHealth(e.target.value)}
                  placeholder="Contoh: Sehat bugar / Flu ringan minum obat"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold bg-slate-50"
                  required
                />
              </div>

              {/* Pola Makan */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Sarapan / Pola Makan di Rumah *
                </label>
                <input
                  type="text"
                  value={parentEating}
                  onChange={(e) => setParentEating(e.target.value)}
                  placeholder="Contoh: Sarapan nasi telur habis mandiri"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold bg-slate-50"
                  required
                />
              </div>

              {/* Pesan / Catatan Rumah */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Kabar / Pesan Khusus untuk Bapak/Ibu Guru di Sekolah *
                </label>
                <textarea
                  rows={4}
                  value={parentNoteText}
                  onChange={(e) => setParentNoteText(e.target.value)}
                  placeholder="Contoh: Ananda semalam tidur nyenyak, pagi ini bersemangat dan membawa bekal buah favoritnya. Mohon bantu dipantau saat sesi cuci tangan ya Bu..."
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium bg-slate-50"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsParentNoteModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingNewNote}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-700/20 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {submittingNewNote ? (
                    <span>Mengirim Kabar...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Kirim ke Buku Penghubung</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


