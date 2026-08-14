"use client";

import { useState, Suspense } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building2,
  HeartHandshake,
  BookOpen,
  CheckCircle2,
  LogOut,
  UserCheck,
  Clock,
} from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSessionExpired = searchParams.get("sessionExpired") === "true";
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("guru@slb.sch.id");
  const [password, setPassword] = useState("guru123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    const loginEmail = customEmail || email;
    const loginPass = customPass || password;

    try {
      const res = await signIn("credentials", {
        email: loginEmail,
        password: loginPass,
        redirect: false,
      });

      if (res?.error) {
        setError("Email atau kata sandi tidak valid. Coba gunakan tombol akun demo di bawah.");
      } else {
        if (loginEmail.includes("admin")) {
          router.push("/admin");
        } else if (loginEmail.includes("yayasan")) {
          router.push("/yayasan");
        } else if (loginEmail.includes("ortu")) {
          router.push("/ortu");
        } else {
          router.push("/guru");
        }
        router.refresh();
      }
    } catch (err: any) {
      setError("Terjadi kesalahan saat masuk ke sistem.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    handleLogin(undefined, demoEmail, demoPass);
  };

  const getDashboardUrl = () => {
    const role = (session?.user as any)?.role;
    if (role === "ADMIN") return "/admin";
    if (role === "YAYASAN") return "/yayasan";
    if (role === "ORANG_TUA") return "/ortu";
    return "/guru";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 flex flex-col justify-center items-center p-4 selection:bg-teal-500 selection:text-white">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-12 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white shadow-xl shadow-teal-500/20 mb-3 border border-white/20">
            <GraduationCap className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            SLB Portal
          </h1>
          <p className="text-sm text-teal-300 font-medium mt-1 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Sistem Manajemen PPI & Asesmen Khusus
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
          {/* Active Session Notification (If already logged in) */}
          {status === "authenticated" && session?.user ? (
            <div className="space-y-4">
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-center space-y-2">
                <div className="w-10 h-10 bg-teal-600 text-white rounded-xl flex items-center justify-center mx-auto shadow">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-teal-950">Sesi Anda Sedang Aktif</h3>
                <p className="text-xs text-slate-600">
                  Masuk sebagai: <strong>{session.user.name}</strong> ({(session.user as any).role})
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => router.push(getDashboardUrl())}
                  className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <span>Buka Dashboard ({session.user.name?.split(" ")[0]})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={async () => {
                    await signOut({ redirect: false });
                    window.location.href = "/login";
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar / Ganti Akun Lain</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Masuk ke Portal</h2>
              <p className="text-xs text-slate-500 mb-6">
                Silakan masukkan kredensial atau klik salah satu akun demo
              </p>

              {isSessionExpired && (
                <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-2xl flex items-start gap-2.5 shadow-sm animate-fade-in">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-amber-950">Sesi Berakhir Otomatis</span>
                    Sesi Anda telah berakhir secara otomatis karena tidak ada aktivitas selama 1 jam demi menjaga privasi dan keamanan data sekolah. Silakan masuk kembali.
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                  {error}
                </div>
              )}

              <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@slb.sch.id"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50 text-slate-900 font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50 text-slate-900 font-medium"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    "Memproses..."
                  ) : (
                    <>
                      <span>Masuk ke Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Demo Logins */}
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
                  Akses Cepat 1-Klik (Akun Demo Multi-Peran)
                </div>

                {/* Section Guru */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700">
                    👨‍🏫 Guru Pengampu Rombel (1 Guru = 1 Kelas):
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDemoClick("guru@slb.sch.id", "guru123")}
                      className="p-2 bg-teal-50 hover:bg-teal-100/80 border border-teal-200 rounded-xl text-left transition-colors flex items-center gap-2 group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                        G1
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-teal-900 truncate">Bu Dewi</div>
                        <div className="text-[10px] text-teal-600 truncate">Kelas 2 SDLB (Autis)</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDemoClick("guru2@slb.sch.id", "guru123")}
                      className="p-2 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 rounded-xl text-left transition-colors flex items-center gap-2 group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                        G2
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-indigo-900 truncate">Pak Ahmad</div>
                        <div className="text-[10px] text-indigo-600 truncate">Kelas 11 SMALB (Netra)</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDemoClick("guru3@slb.sch.id", "guru123")}
                      className="p-2 bg-sky-50 hover:bg-sky-100/80 border border-sky-200 rounded-xl text-left transition-colors flex items-center gap-2 group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                        G3
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-sky-900 truncate">Bu Siti</div>
                        <div className="text-[10px] text-sky-600 truncate">Kelas 8 SMPLB (Rungu)</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDemoClick("guru4@slb.sch.id", "guru123")}
                      className="p-2 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl text-left transition-colors flex items-center gap-2 group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                        G4
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-emerald-900 truncate">Pak Agus</div>
                        <div className="text-[10px] text-emerald-600 truncate">Kelas TKLB (Sensori)</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Section Orang Tua */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700">
                    👨‍👩‍👧 Portal Orang Tua Siswa:
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDemoClick("ortu@slb.sch.id", "ortu123")}
                      className="p-2 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-xl text-left transition-colors flex flex-col group"
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-xs">👨‍👦</span>
                        <span className="text-xs font-bold text-rose-900 truncate">Ortu 1 (Hendra)</span>
                      </div>
                      <span className="text-[9px] text-rose-600 truncate">Wali Rizky (SDLB)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDemoClick("ortu2@slb.sch.id", "ortu123")}
                      className="p-2 bg-pink-50 hover:bg-pink-100/80 border border-pink-200 rounded-xl text-left transition-colors flex flex-col group"
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-xs">👩‍👧</span>
                        <span className="text-xs font-bold text-pink-900 truncate">Ortu 2 (Ratna)</span>
                      </div>
                      <span className="text-[9px] text-pink-600 truncate">Wali Dimas & Siti</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDemoClick("ortu3@slb.sch.id", "ortu123")}
                      className="p-2 bg-orange-50 hover:bg-orange-100/80 border border-orange-200 rounded-xl text-left transition-colors flex flex-col group"
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-xs">👩‍👦</span>
                        <span className="text-xs font-bold text-orange-900 truncate">Ortu 3 (Maya)</span>
                      </div>
                      <span className="text-[9px] text-orange-600 truncate">Wali Kenzo (TKLB)</span>
                    </button>
                  </div>
                </div>

                {/* Section Admin & Yayasan */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleDemoClick("admin@slb.sch.id", "admin123")}
                    className="p-2 bg-purple-50 hover:bg-purple-100/80 border border-purple-200 rounded-xl text-left transition-colors flex items-center gap-2 group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs">
                      ⚙️
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-purple-900 truncate">Super Admin</div>
                      <div className="text-[10px] text-purple-600 truncate">Kendali Penuh</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoClick("yayasan@slb.sch.id", "yayasan123")}
                    className="p-2 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 rounded-xl text-left transition-colors flex items-center gap-2 group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs">
                      🏛️
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-amber-900 truncate">Yayasan</div>
                      <div className="text-[10px] text-amber-600 truncate">Eksekutif / Rapor</div>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 SLB Portal. Sistem Pendidikan Inklusif & Kebutuhan Khusus.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs">Memuat halaman login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
