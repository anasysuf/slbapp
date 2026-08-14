"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ArrowLeft, GraduationCap, CheckCircle2, HelpCircle, AlertCircle } from "lucide-react";

export default function CetakRaporPpiPage() {
  const params = useParams();
  const router = useRouter();
  const [ppi, setPpi] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPpi = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/ppi");
        const data = await res.json();
        if (Array.isArray(data)) {
          const found = data.find((p) => p.id === params.id) || null;
          setPpi(found);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPpi();
  }, [params.id]);

  if (loading) {
    return <div className="p-12 text-center text-sm text-slate-500">Memuat format rapor...</div>;
  }

  if (!ppi) {
    return <div className="p-12 text-center text-sm text-slate-500">Data PPI tidak ditemukan.</div>;
  }

  const evaluations = ppi.evaluations || [];

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 print:p-0 print:bg-white text-slate-900 font-sans">
      {/* Top Action Bar (Hidden on Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
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
          <Printer className="w-4 h-4" /> Cetak Rapor / Simpan PDF
        </button>
      </div>

      {/* Printable Sheet */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-xl print:shadow-none print:rounded-none print:p-6 border border-slate-200 print:border-none space-y-6">
        {/* Kop Surat */}
        <div className="border-b-2 border-slate-900 pb-4 text-center relative">
          <div className="w-14 h-14 rounded-2xl bg-teal-800 text-white flex items-center justify-center absolute left-0 top-0 print:w-12 print:h-12">
            <GraduationCap className="w-8 h-8 print:w-7 print:h-7" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">
            {ppi.student?.foundation?.name || "YAYASAN PENDIDIKAN LUAR BIASA HARAPAN MULIA"}
          </h1>
          <h2 className="text-base font-bold text-teal-800">
            SEKOLAH LUAR BIASA (SLB) {ppi.student?.foundation?.name?.replace(/^yayasan\s*(pendidikan\s*)?/i, "") || "HARAPAN MULIA"}
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            {ppi.student?.foundation?.address || "Jl. Pendidikan Inklusi No. 45, Kota Bandung"} • Telp: {ppi.student?.foundation?.phone || "(022) 7890-1234"}
          </p>
        </div>

        {/* Title */}
        <div className="text-center py-2">
          <h3 className="text-base font-black uppercase tracking-widest text-slate-900 underline">
            LAPORAN PROGRAM PEMBELAJARAN INDIVIDUAL (PPI / IEP)
          </h3>
          <p className="text-xs font-bold text-slate-600 mt-0.5">
            Tahun Ajaran: {ppi.academicYear || "2026/2027 Ganjil"}
          </p>
        </div>

        {/* Student Identity Table */}
        <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
          <table className="w-full">
            <tbody>
              <tr className="border-b border-slate-200 bg-slate-50">
                <td className="p-2.5 font-bold text-slate-700 w-1/3">Nama Lengkap Siswa</td>
                <td className="p-2.5 font-black text-slate-900">{ppi.student?.name}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2.5 font-bold text-slate-700">Nomor Induk Siswa Nasional (NISN)</td>
                <td className="p-2.5 text-slate-800">{ppi.student?.nisn}</td>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50">
                <td className="p-2.5 font-bold text-slate-700">Kekhususan / Jenis Disabilitas</td>
                <td className="p-2.5 font-bold text-teal-900">{ppi.student?.disabilityType}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-700">Guru Pembimbing Khusus</td>
                <td className="p-2.5 text-slate-800">{ppi.teacher?.name || "Dewi Rahmawati, S.Pd"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Program Targets */}
        <div className="space-y-4 text-xs">
          <div className="p-3.5 border border-slate-300 rounded-xl bg-slate-50/70">
            <span className="font-black text-slate-900 uppercase block mb-1 text-[11px]">
              A. Baseline Kemampuan Awal Siswa (Hasil Asesmen Diagnostik)
            </span>
            <p className="text-slate-800 leading-relaxed">{ppi.currentCapability}</p>
          </div>

          <div className="p-3.5 border border-slate-300 rounded-xl bg-slate-50/70">
            <span className="font-black text-slate-900 uppercase block mb-1 text-[11px]">
              B. Tujuan Jangka Panjang (Long-Term Goal)
            </span>
            <p className="text-slate-800 leading-relaxed font-semibold">{ppi.longTermGoal}</p>
          </div>

          <div className="p-3.5 border border-slate-300 rounded-xl bg-slate-50/70">
            <span className="font-black text-slate-900 uppercase block mb-1 text-[11px]">
              C. Target Jangka Pendek (Short-Term Objective)
            </span>
            <p className="text-slate-800 leading-relaxed font-semibold">{ppi.shortTermGoal}</p>
          </div>
        </div>

        {/* Evaluation History Table */}
        <div className="space-y-2">
          <span className="font-black text-slate-900 uppercase block text-xs">
            D. Rekapitulasi Hasil Evaluasi Kemandirian Siswa
          </span>
          <table className="w-full border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold">
                <th className="border border-slate-300 p-2 text-center w-12">No</th>
                <th className="border border-slate-300 p-2 text-left w-32">Tanggal Sesi</th>
                <th className="border border-slate-300 p-2 text-center w-36">Capaian Skor</th>
                <th className="border border-slate-300 p-2 text-left">Catatan Observasi Guru</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="border border-slate-300 p-4 text-center text-slate-400 italic">
                    Belum ada data evaluasi sesi.
                  </td>
                </tr>
              ) : (
                evaluations.map((ev: any, idx: number) => (
                  <tr key={ev.id}>
                    <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                    <td className="border border-slate-300 p-2 font-medium">
                      {new Date(ev.evaluationDate).toLocaleDateString("id-ID")}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-bold">
                      {ev.score}
                    </td>
                    <td className="border border-slate-300 p-2 text-slate-700 italic">
                      "{ev.narrativeNotes || "Melakukan aktivitas dengan baik."}"
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Signature Columns */}
        <div className="pt-8 grid grid-cols-3 gap-4 text-center text-xs text-slate-800">
          <div>
            <p className="font-medium">Orang Tua / Wali Siswa,</p>
            <div className="h-20" />
            <p className="font-bold underline">( ........................................ )</p>
          </div>

          <div>
            <p className="font-medium">Guru Pembimbing Khusus,</p>
            <div className="h-20" />
            <p className="font-bold underline">{ppi.teacher?.name || "Dewi Rahmawati, S.Pd"}</p>
            <p className="text-[10px] text-slate-500">NIP. 19850412 201001 2 021</p>
          </div>

          <div>
            <p className="font-medium">Mengetahui, Kepala SLB</p>
            <div className="h-20" />
            <p className="font-bold underline">Drs. H. Bambang Soediro</p>
            <p className="text-[10px] text-slate-500">NIP. 19680315 199303 1 004</p>
          </div>
        </div>
      </div>
    </div>
  );
}
