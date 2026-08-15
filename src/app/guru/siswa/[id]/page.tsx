"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Link from "next/link";
import {
  Users,
  ArrowLeft,
  ClipboardCheck,
  Target,
  HeartHandshake,
  Calendar,
  Sparkles,
  Printer,
  CheckCircle2,
  HelpCircle,
  AlertCircle,
  FileText,
  UserCheck,
  Award,
  Image as ImageIcon,
  MessageCircle,
} from "lucide-react";
import AspectRadarChart from "@/components/AspectRadarChart";
import StudentProgressTrendChart from "@/components/StudentProgressTrendChart";
import Footer from "@/components/Footer";



export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profil" | "asesmen" | "ppi" | "jurnal">("profil");

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/students/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setStudent(data);
        } else {
          setStudent(null);
        }
      } catch (err) {
        console.error(err);
        setStudent(null);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      fetchStudent();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-8 text-center text-slate-400 text-xs">Memuat profil siswa...</main>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-8 text-center text-slate-500 text-xs">
          Data siswa tidak ditemukan atau Anda tidak memiliki hak akses ke siswa pada kelas ini.
        </main>
      </div>
    );
  }

  const ppiPlans = student.ppiPlans || [];
  const assessments = student.assessments || [];
  const journals = student.dailyJournals || [];

  const mandiriAssessments = assessments.filter((a: any) => a.score === "MANDIRI").length;
  const independenceRate = assessments.length > 0 ? Math.round((mandiriAssessments / assessments.length) * 100) : 0;

  // Real 5-Aspect Scores calculated directly from student's assessments
  const standardAspects = [
    { category: "Bina Diri (ADL)", label: "Bina Diri (ADL)" },
    { category: "Motorik Kasar & Halus", label: "Fisik & Motorik" },
    { category: "Bahasa & Komunikasi", label: "Bahasa & Komunikasi" },
    { category: "Kognitif / Akademik", label: "Kognitif & Akademik" },
    { category: "Sosial Emosional", label: "Sosial & Emosi" },
  ];

  const studentAspectScores = standardAspects.map((asp) => {
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

  return (

    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <Header
          title={`Rekam Siswa: ${student.name}`}
          subtitle={`Profil Terpadu Pendidikan Khusus • NISN: ${student.nisn}`}
        />

        <div className="p-4 sm:p-6 space-y-6 max-w-7xl">
          {/* Top Back & Action Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-3.5 py-2 bg-white rounded-xl border border-slate-200 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>

            <div className="flex items-center gap-2">
              {ppiPlans[0] && (
                <Link
                  href={`/guru/ppi/cetak/${ppiPlans[0].id}`}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Rapor PPI</span>
                </Link>
              )}
            </div>
          </div>

          {/* Student Dossier Header Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-800 via-teal-700 to-indigo-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl shadow-inner border border-white/30 shrink-0">
                {student.gender === "P" ? "👧" : "👦"}
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-white/20 rounded-full text-xs font-semibold mb-1 text-teal-100">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Profil Lengkap Siswa SLB
                </div>
                <h2 className="text-xl sm:text-2xl font-black">{student.name}</h2>
                <p className="text-teal-100 text-xs sm:text-sm mt-0.5">
                  NISN: {student.nisn} • Jenjang: <strong>{student.jenjang || "SDLB"}</strong> • Disabilitas:{" "}
                  <strong className="text-amber-200">{student.disabilityType}</strong>
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-xs space-y-1">
              <div className="text-teal-200 font-bold">Wali Murid Terdaftar:</div>
              <div className="font-semibold text-white">{student.parent?.name || "Belum terhubung"}</div>
              <div className="text-[11px] text-teal-300">{student.parent?.phone || "-"}</div>
            </div>
          </div>

          {/* Dossier Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("profil")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "profil"
                  ? "bg-teal-700 text-white shadow"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Identitas & Radar Kemandirian</span>
            </button>

            <button
              onClick={() => setActiveTab("asesmen")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "asesmen"
                  ? "bg-teal-700 text-white shadow"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Riwayat Asesmen ({assessments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("ppi")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "ppi"
                  ? "bg-teal-700 text-white shadow"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Target PPI ({ppiPlans.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("jurnal")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "jurnal"
                  ? "bg-teal-700 text-white shadow"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Buku Penghubung ({journals.length})</span>
            </button>
          </div>

          {/* Tab 1: Profil & Radar 5 Aspek */}
          {activeTab === "profil" && (
            <div className="space-y-6">
              {/* Radar Chart 5 Aspek */}
              <AspectRadarChart
                studentName={student.name}
                aspectScores={studentAspectScores}
              />


              {/* Grafik Tren Perkembangan & Kemandirian Siswa */}
              <StudentProgressTrendChart
                studentName={student.name}
                ppiPlans={ppiPlans}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-base text-slate-800 border-b pb-3">Informasi Peserta Didik</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Nama Lengkap</span>
                      <span className="font-bold text-slate-900">{student.name}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">NISN</span>
                      <span className="font-medium text-slate-800">{student.nisn}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Jenis Kelamin</span>
                      <span className="font-medium text-slate-800">{student.gender === "P" ? "Perempuan" : "Laki-laki"}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-500">Klasifikasi Kebutuhan Khusus</span>
                      <span className="font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-200 whitespace-nowrap inline-flex items-center">
                        {student.disabilityType}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-base text-slate-800 border-b pb-3">Rombel & Wali Murid</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Kelas Terapi</span>
                      <span className="font-bold text-slate-900">
                        {student.classes && student.classes[0]?.class?.name || "Kelas Khusus SLB"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Guru Wali</span>
                      <span className="font-medium text-slate-800">
                        {student.classes && student.classes[0]?.class?.teacher?.name || "Guru Kelas"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Nama Orang Tua</span>
                      <span className="font-bold text-slate-900">{student.parent?.name || "-"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Nomor WhatsApp</span>
                      <span className="font-medium text-slate-800">{student.parent?.phone || "-"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Asesmen */}
          {activeTab === "asesmen" && (
            <div className="space-y-4">
              {assessments.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl text-center text-xs text-slate-400 border">
                  Belum ada instrumen asesmen yang dicatat untuk siswa ini.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assessments.map((as: any) => (
                    <div key={as.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                            {as.category}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 mt-1">{as.aspect}</h4>
                          <p className="text-xs text-slate-500">{new Date(as.assessmentDate).toLocaleDateString("id-ID")}</p>
                        </div>
                        <div>
                          <span className="inline-flex items-center justify-center px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap shrink-0">
                            {as.score}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl italic border border-slate-100">
                        "{as.findings}"
                      </p>

                      <div className="pt-2 border-t flex justify-end">
                        <Link
                          href={`/guru/asesmen/cetak/${as.id}`}
                          className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" /> Cetak Lembar Asesmen
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: PPI */}
          {activeTab === "ppi" && (
            <div className="space-y-4">
              {ppiPlans.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl text-center text-xs text-slate-400 border">
                  Belum ada program PPI untuk siswa ini.
                </div>
              ) : (
                ppiPlans.map((plan: any) => (
                  <div key={plan.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <h4 className="font-bold text-base text-slate-900">Program Pembelajaran Individual</h4>
                        <span className="text-xs text-slate-500">Tahun Ajaran: {plan.academicYear}</span>
                      </div>
                      <Link
                        href={`/guru/ppi/cetak/${plan.id}`}
                        className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" /> Cetak Rapor PPI
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border">
                        <span className="font-bold text-slate-700 block mb-1">Baseline Kemampuan Awal:</span>
                        <p className="text-slate-600">{plan.currentCapability}</p>
                      </div>
                      <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                        <span className="font-bold text-indigo-900 block mb-1">Tujuan Jangka Panjang:</span>
                        <p className="text-indigo-950">{plan.longTermGoal}</p>
                      </div>
                      <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100">
                        <span className="font-bold text-teal-900 block mb-1">Target Jangka Pendek:</span>
                        <p className="text-teal-950 font-bold">{plan.shortTermGoal}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 4: Buku Penghubung Jurnal */}
          {activeTab === "jurnal" && (
            <div className="space-y-4">
              {journals.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl text-center text-xs text-slate-400 border">
                  Belum ada catatan buku penghubung untuk siswa ini.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {journals.map((j: any) => {
                    const isFromParent =
                      j.authorRole === "ORANG_TUA" ||
                      (j.authorId && j.authorId === student.parentId) ||
                      (!j.authorRole && j.learningActivity?.toLowerCase().includes("orang tua"));

                    const isFromAdmin = j.authorRole === "ADMIN";

                    const authorDisplayName =
                      j.authorName ||
                      j.author?.name ||
                      (isFromParent
                        ? student.parent?.name || "Orang Tua / Wali"
                        : j.teacher?.name || "Guru Kelas");

                    return (
                      <div
                        key={j.id}
                        className={`bg-white p-5 rounded-3xl border shadow-sm space-y-3 flex flex-col justify-between ${
                          isFromParent
                            ? "border-emerald-300 bg-emerald-50/20 ring-1 ring-emerald-200"
                            : "border-slate-200"
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 gap-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-800">
                                {new Date(j.date).toLocaleDateString("id-ID", {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </span>
                              {isFromParent && (
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 whitespace-nowrap inline-flex items-center shrink-0">
                                  🏡 Dari Rumah
                                </span>
                              )}
                            </div>
                            <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-teal-50 text-teal-800 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-full border border-teal-200 shrink-0 whitespace-nowrap inline-flex items-center">
                              {j.mood}
                            </span>
                          </div>

                          <div className={`p-3 rounded-xl text-xs leading-relaxed ${
                            isFromParent
                              ? "bg-emerald-50/70 border border-emerald-200 text-emerald-950"
                              : "bg-teal-50/50 border border-teal-100 text-slate-700"
                          }`}>
                            <span className="font-bold block mb-0.5">
                              {isFromParent ? "🏡 Kabar & Aktivitas dari Rumah:" : "🏫 Aktivitas Terapi & Belajar:"}
                            </span>
                            {j.learningActivity}
                          </div>

                          {j.photoUrl && (
                            <div className="rounded-xl overflow-hidden max-h-44 bg-slate-100 border">
                              <img src={j.photoUrl} alt="Dokumentasi" className="w-full h-full object-cover" />
                            </div>
                          )}

                          {j.parentFeedback && (
                            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
                              <MessageCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold block text-emerald-900">Respon Orang Tua di Rumah:</span>
                                <p className="italic">"{j.parentFeedback}"</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-medium">
                            <span>Ditulis oleh:</span>
                            <strong className="text-slate-900 font-bold">{authorDisplayName}</strong>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isFromParent
                                ? "bg-emerald-100 text-emerald-800"
                                : isFromAdmin
                                ? "bg-purple-100 text-purple-800"
                                : "bg-teal-100 text-teal-800"
                            }`}>
                              {isFromParent ? "Orang Tua" : isFromAdmin ? "Admin" : "Guru"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
        <Footer />
      </main>
    </div>
  );
}

