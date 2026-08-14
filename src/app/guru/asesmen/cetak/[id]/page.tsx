"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ArrowLeft, GraduationCap, ClipboardCheck } from "lucide-react";

export default function CetakAsesmenPage() {
  const params = useParams();
  const router = useRouter();
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/assessments");
        const data = await res.json();
        if (Array.isArray(data)) {
          const found = data.find((a) => a.id === params.id) || null;
          setAssessment(found);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [params.id]);

  if (loading) {
    return <div className="p-12 text-center text-sm text-slate-500">Memuat berkas asesmen...</div>;
  }

  if (!assessment) {
    return <div className="p-12 text-center text-sm text-slate-500">Data asesmen tidak ditemukan.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 print:p-0 print:bg-white text-slate-900 font-sans">
      {/* Top Navigation Action Bar */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2 bg-white rounded-xl border shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
        >
          <Printer className="w-4 h-4" /> Cetak Lembar Asesmen / PDF
        </button>
      </div>

      {/* Printable Sheet */}
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-xl print:shadow-none print:rounded-none print:p-6 border border-slate-200 print:border-none space-y-6">
        {/* Kop Surat */}
        <div className="border-b-2 border-slate-900 pb-4 text-center relative">
          <div className="w-14 h-14 rounded-2xl bg-teal-800 text-white flex items-center justify-center absolute left-0 top-0 print:w-12 print:h-12">
            <GraduationCap className="w-8 h-8 print:w-7 print:h-7" />
          </div>
          <h1 className="text-lg font-black uppercase tracking-wider text-slate-900">
            {assessment.student?.foundation?.name || "YAYASAN PENDIDIKAN LUAR BIASA HARAPAN MULIA"}
          </h1>
          <h2 className="text-base font-bold text-teal-800">
            SEKOLAH LUAR BIASA (SLB) {assessment.student?.foundation?.name?.replace(/^yayasan\s*(pendidikan\s*)?/i, "") || "HARAPAN MULIA"}
          </h2>
          <p className="text-[11px] text-slate-600 mt-0.5">
            {assessment.student?.foundation?.address || "Jl. Pendidikan Inklusi No. 45, Kota Bandung"} • Telp: {assessment.student?.foundation?.phone || "(022) 7890-1234"}
          </p>
        </div>

        {/* Header Document Title */}
        <div className="text-center py-1">
          <h3 className="text-sm sm:text-base font-black uppercase tracking-widest text-slate-900 underline">
            LEMBAR HASIL ASESMEN DIAGNOSTIK & PERKEMBANGAN SISWA
          </h3>
          <p className="text-xs font-bold text-slate-600 mt-0.5">
            Nomor Dokumen: ASESMEN/SLB/{new Date(assessment.assessmentDate).getFullYear()}/{assessment.id.slice(-6).toUpperCase()}
          </p>
        </div>

        {/* Student Bio Table */}
        <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
          <table className="w-full">
            <tbody>
              <tr className="border-b border-slate-200 bg-slate-50">
                <td className="p-2.5 font-bold text-slate-700 w-1/3">Nama Lengkap Siswa</td>
                <td className="p-2.5 font-black text-slate-900">{assessment.student?.name}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2.5 font-bold text-slate-700">NISN</td>
                <td className="p-2.5 text-slate-800">{assessment.student?.nisn}</td>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50">
                <td className="p-2.5 font-bold text-slate-700">Kekhususan / Disabilitas</td>
                <td className="p-2.5 font-bold text-teal-900">{assessment.student?.disabilityType}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2.5 font-bold text-slate-700">Tanggal Pelaksanaan Asesmen</td>
                <td className="p-2.5 text-slate-800">
                  {new Date(assessment.assessmentDate).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-700">Guru / Asesor Khusus</td>
                <td className="p-2.5 text-slate-800">{assessment.teacher?.name || "Dewi Rahmawati, S.Pd"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Assessment Assessment Content */}
        <div className="space-y-4 text-xs">
          <div className="p-3.5 border border-slate-300 rounded-xl bg-slate-50/70">
            <span className="font-black text-slate-900 uppercase block mb-1 text-[11px]">
              1. Kategori & Aspek Instrumen yang Diamati
            </span>
            <div className="space-y-1">
              <p className="font-bold text-slate-800">Kategori Bidang: {assessment.category}</p>
              <p className="text-slate-700">Nama Asesmen: {assessment.title}</p>
              <p className="text-teal-900 font-semibold">Indikator Spesifik: {assessment.aspect}</p>
            </div>
          </div>

          <div className="p-3.5 border border-slate-300 rounded-xl bg-slate-50/70">
            <span className="font-black text-slate-900 uppercase block mb-1 text-[11px]">
              2. Tingkat Capaian Kemampuan (Hasil Skoring)
            </span>
            <div className="text-sm font-black text-slate-900">
              {assessment.score === "MANDIRI" && "🟢 MANDIRI (Mampu melakukan tugas tanpa bantuan)"}
              {assessment.score === "DENGAN_BANTUAN" && "🟡 DENGAN BANTUAN (Memerlukan prompting verbal/fisik)"}
              {assessment.score === "BELUM_MAMPU" && "🔴 BELUM MAMPU (Masih dalam tahap pengenalan awal)"}
            </div>
          </div>

          <div className="p-3.5 border border-slate-300 rounded-xl bg-slate-50/70">
            <span className="font-black text-slate-900 uppercase block mb-1 text-[11px]">
              3. Deskripsi Hasil Observasi Nyata (Temuan Asesor)
            </span>
            <p className="text-slate-800 leading-relaxed italic">"{assessment.findings}"</p>
          </div>

          <div className="p-3.5 border border-slate-300 rounded-xl bg-slate-50/70">
            <span className="font-black text-slate-900 uppercase block mb-1 text-[11px]">
              4. Rekomendasi Tindak Lanjut Program Pembelajaran Individual (PPI)
            </span>
            <p className="text-slate-900 leading-relaxed font-semibold">
              {assessment.recommendation || "Lanjutkan latihan pembiasaan mandiri di sekolah dan rumah."}
            </p>
          </div>
        </div>

        {/* Signatures */}
        <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs text-slate-800">
          <div>
            <p className="font-medium">Guru / Asesor Khusus,</p>
            <div className="h-20" />
            <p className="font-bold underline">{assessment.teacher?.name || "Dewi Rahmawati, S.Pd"}</p>
            <p className="text-[10px] text-slate-500">NIP. 19850412 201001 2 021</p>
          </div>

          <div>
            <p className="font-medium">Mengetahui, Kepala SLB Harapan Mulia</p>
            <div className="h-20" />
            <p className="font-bold underline">Drs. H. Bambang Soediro</p>
            <p className="text-[10px] text-slate-500">NIP. 19680315 199303 1 004</p>
          </div>
        </div>
      </div>
    </div>
  );
}
