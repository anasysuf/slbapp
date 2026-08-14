import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center max-w-md w-full">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-9 h-9" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">Akses Tidak Diizinkan</h1>
        <p className="text-sm text-slate-600 mt-2 mb-6">
          Akun Anda tidak memiliki hak akses untuk membuka halaman ini. Silakan kembali ke menu utama peran Anda.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-colors w-full"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Halaman Login / Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
