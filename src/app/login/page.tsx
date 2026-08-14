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
  ClipboardList,
  Target,
  BarChart3,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 flex flex-col justify-center items-center p-3 sm:p-6 md:p-8 selection:bg-teal-500 selection:text-white relative overflow-hidden">
      {/* Decorative Gradient Spheres */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl relative z-10 my-auto">
        {/* Main Split Grid Card */}
        <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Visual Brand Showcase (Visible on Desktop/Tablet) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-teal-900 via-teal-950 to-slate-950 text-white p-6 sm:p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-56 h-56 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-6 relative z-10">
              {/* Brand Logo & Title */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-400 to-emerald-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-xl shadow-teal-500/30 shrink-0">
                  <GraduationCap className="w-7 h-7 text-slate-950" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-none">
                    SLB Portal
                  </h1>
                  <p className="text-xs text-teal-300 font-semibold mt-1">
                    Sistem Inklusi & Pembelajaran Khusus
                  </p>
                </div>
              </div>

              {/* Tagline */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs font-semibold text-teal-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Platform Pendidikan Luar Biasa</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-snug">
                  Mendampingi Tumbuh Kembang Setiap Anak Istimewa
                </h2>
                <p className="text-xs sm:text-sm text-teal-200/90 leading-relaxed">
                  Integrasi instrumen asesmen diagnostik 5 aspek, rencana program individual (PPI/IEP), buku penghubung real-time, dan rekapitulasi semester.
                </p>
              </div>

              {/* Feature Bullets */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-3 text-xs text-teal-100">
                  <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <ClipboardList className="w-4 h-4 text-teal-300" />
                  </div>
                  <span>Asesmen Diagnostik Kemandirian (ADL & Akademik)</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-teal-100">
                  <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4 text-amber-300" />
                  </div>
                  <span>Program Pembelajaran Individual (PPI) Terstruktur</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-teal-100">
                  <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <HeartHandshake className="w-4 h-4 text-rose-300" />
                  </div>
                  <span>Buku Penghubung Harian Guru & Orang Tua</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-teal-100">
                  <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-4 h-4 text-emerald-300" />
                  </div>
                  <span>Rekapitulasi Semester & Rapor Cetak Resmi</span>
                </div>
              </div>
            </div>

            {/* Footer Left */}
            <div className="pt-6 border-t border-teal-800/60 mt-6 text-[11px] text-teal-300/80 flex items-center justify-between">
              <span>Versi 2.0 Inklusif</span>
              <span>© 2026 Yayasan SLB</span>
            </div>
          </div>

          {/* Right Column: Login Form & Quick Demo Buttons */}
          <div className="lg:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-between">
            {/* Active Session Notification (If already logged in) */}
            {status === "authenticated" && session?.user ? (
              <div className="my-auto space-y-5">
                <div className="p-6 bg-teal-50 border border-teal-200 rounded-3xl text-center space-y-3 shadow-sm">
                  <div className="w-12 h-12 bg-teal-700 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                    <UserCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-teal-950">Sesi Anda Sedang Aktif</h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Masuk sebagai: <strong>{session.user.name}</strong> ({(session.user as any).role})
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => router.push(getDashboardUrl())}
                    className="w-full py-3.5 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-bold text-sm rounded-2xl shadow-lg shadow-teal-700/25 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Lanjutkan ke Dashboard ({session.user.name?.split(" ")[0]})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={async () => {
                      await signOut({ redirect: false });
                      window.location.href = "/login";
                    }}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar & Masuk dengan Akun Lain</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Masuk ke Portal
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Silakan masukkan email & kata sandi atau klik akun demo di bawah
                  </p>
                </div>

                {isSessionExpired && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold rounded-2xl flex items-start gap-2.5 shadow-sm animate-fade-in">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-amber-950">Sesi Berakhir Otomatis</span>
                      Sesi berakhir karena tidak ada aktivitas selama 1 jam demi keamanan data sekolah.
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl animate-shake">
                    {error}
                  </div>
                )}

                {/* Form Input */}
                <form onSubmit={(e) => handleLogin(e)} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Alamat Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@slb.sch.id"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50 text-slate-900 font-semibold"
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
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50 text-slate-900 font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-teal-700/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
                  >
                    {loading ? (
                      "Memverifikasi Kredensial..."
                    ) : (
                      <>
                        <span>Masuk ke Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Quick 1-Click Demo Logins */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
                    Akses Cepat 1-Klik Akun Demo
                  </div>

                  {/* Section Guru */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 flex items-center justify-between">
                      <span>👨‍🏫 Guru Pengampu Rombel (1 Guru = 1 Rombel):</span>
                      <span className="text-[9px] text-teal-600 font-normal">Sandi: guru123</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDemoClick("guru@slb.sch.id", "guru123")}
                        className="p-2 bg-teal-50 hover:bg-teal-100/90 border border-teal-200/80 rounded-xl text-left transition-all flex items-center gap-2 group shadow-sm"
                      >
                        <div className="w-6 h-6 rounded-lg bg-teal-700 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                          G1
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-xs font-bold text-teal-950 truncate">Bu Dewi, S.Pd</div>
                          <div className="text-[10px] text-teal-700 truncate">Kelas 2 SDLB (Autis)</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDemoClick("guru2@slb.sch.id", "guru123")}
                        className="p-2 bg-indigo-50 hover:bg-indigo-100/90 border border-indigo-200/80 rounded-xl text-left transition-all flex items-center gap-2 group shadow-sm"
                      >
                        <div className="w-6 h-6 rounded-lg bg-indigo-700 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                          G2
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-xs font-bold text-indigo-950 truncate">Pak Ahmad, S.Pd</div>
                          <div className="text-[10px] text-indigo-700 truncate">Kelas 11 SMALB (Netra)</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDemoClick("guru3@slb.sch.id", "guru123")}
                        className="p-2 bg-sky-50 hover:bg-sky-100/90 border border-sky-200/80 rounded-xl text-left transition-all flex items-center gap-2 group shadow-sm"
                      >
                        <div className="w-6 h-6 rounded-lg bg-sky-700 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                          G3
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-xs font-bold text-sky-950 truncate">Bu Siti, S.Pd</div>
                          <div className="text-[10px] text-sky-700 truncate">Kelas 8 SMPLB (Rungu)</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDemoClick("guru4@slb.sch.id", "guru123")}
                        className="p-2 bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200/80 rounded-xl text-left transition-all flex items-center gap-2 group shadow-sm"
                      >
                        <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                          G4
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-xs font-bold text-emerald-950 truncate">Pak Agus, S.Pd</div>
                          <div className="text-[10px] text-emerald-700 truncate">Kelas TKLB (Sensori)</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Section Orang Tua */}
                  <div className="space-y-1.5 pt-0.5">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800 flex items-center justify-between">
                      <span>👨‍👩‍👧 Portal Orang Tua Siswa:</span>
                      <span className="text-[9px] text-rose-600 font-normal">Sandi: ortu123</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDemoClick("ortu@slb.sch.id", "ortu123")}
                        className="p-2 bg-rose-50 hover:bg-rose-100/90 border border-rose-200/80 rounded-xl text-left transition-all flex flex-col group shadow-sm"
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-xs">👨‍👦</span>
                          <span className="text-xs font-bold text-rose-950 truncate">Bpk Hendra</span>
                        </div>
                        <span className="text-[9px] text-rose-700 truncate">Wali Rizky (SDLB)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDemoClick("ortu2@slb.sch.id", "ortu123")}
                        className="p-2 bg-pink-50 hover:bg-pink-100/90 border border-pink-200/80 rounded-xl text-left transition-all flex flex-col group shadow-sm"
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-xs">👩‍👧</span>
                          <span className="text-xs font-bold text-pink-950 truncate">Ibu Ratna</span>
                        </div>
                        <span className="text-[9px] text-pink-700 truncate">Wali Dimas & Siti</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDemoClick("ortu3@slb.sch.id", "ortu123")}
                        className="p-2 bg-orange-50 hover:bg-orange-100/90 border border-orange-200/80 rounded-xl text-left transition-all flex flex-col group shadow-sm"
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-xs">👩‍👦</span>
                          <span className="text-xs font-bold text-orange-950 truncate">Ibu Maya</span>
                        </div>
                        <span className="text-[9px] text-orange-700 truncate">Wali Kenzo (TKLB)</span>
                      </button>
                    </div>
                  </div>

                  {/* Section Admin & Yayasan */}
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleDemoClick("admin@slb.sch.id", "admin123")}
                      className="p-2 bg-purple-50 hover:bg-purple-100/90 border border-purple-200/80 rounded-xl text-left transition-all flex items-center gap-2 group shadow-sm"
                    >
                      <div className="w-6 h-6 rounded-lg bg-purple-700 text-white flex items-center justify-center text-xs">
                        ⚙️
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-purple-950 truncate">Super Admin</div>
                        <div className="text-[10px] text-purple-700 truncate">Kendali Penuh</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDemoClick("yayasan@slb.sch.id", "yayasan123")}
                      className="p-2 bg-amber-50 hover:bg-amber-100/90 border border-amber-200/80 rounded-xl text-left transition-all flex items-center gap-2 group shadow-sm"
                    >
                      <div className="w-6 h-6 rounded-lg bg-amber-700 text-white flex items-center justify-center text-xs">
                        🏛️
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-amber-950 truncate">Pengurus Yayasan</div>
                        <div className="text-[10px] text-amber-700 truncate">Eksekutif / Rekap</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs">
          Memuat portal SLB...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
