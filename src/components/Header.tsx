"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Bell,
  Calendar,
  Sparkles,
  UserCircle2,
  Menu,
  X,
  CheckCircle2,
  MessageCircle,
  ClipboardCheck,
  ArrowRight,
  ChevronDown,
  KeyRound,
  LogOut,
  ShieldCheck,
  Building2,
  Lock,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import AccessibilityBar from "./AccessibilityBar";
import { useSidebar } from "@/context/SidebarContext";
import Link from "next/link";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { data: session } = useSession();
  const { openSidebar } = useSidebar();
  const role = (session?.user as any)?.role;
  const foundationName = (session?.user as any)?.foundationName;

  // Notification states
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  // User Dropdown & Change Password Modal states
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  // Change password form
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const todayFormatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  useEffect(() => {
    // Generate dynamic notifications based on role
    if (role === "GURU") {
      setNotifications([
        {
          id: "1",
          type: "FEEDBACK",
          title: "Respon Orang Tua Masuk",
          desc: "Bpk. Hendra mengirimkan catatan di buku penghubung Rizky.",
          time: "10 menit lalu",
          unread: true,
          link: "/guru/jurnal",
        },
        {
          id: "2",
          type: "INFO",
          title: "Tahun Ajaran Aktif",
          desc: "Tahun Ajaran 2026/2027 Semester Ganjil telah disinkronkan.",
          time: "1 jam lalu",
          unread: false,
          link: "/guru/rekap",
        },
      ]);
    } else if (role === "ORANG_TUA") {
      setNotifications([
        {
          id: "1",
          type: "JOURNAL",
          title: "Kabar Harian dari Sekolah",
          desc: "Ibu Guru telah memperbarui catatan aktivitas terapi dan belajar ananda hari ini.",
          time: "15 menit lalu",
          unread: true,
          link: "/ortu",
        },
      ]);
    } else if (role === "YAYASAN") {
      setNotifications([
        {
          id: "1",
          type: "YAYASAN",
          title: "Laporan Agregat Semester",
          desc: "Capaian kemandirian siswa per rombel telah diperbarui untuk supervisi.",
          time: "30 menit lalu",
          unread: true,
          link: "/guru/rekap",
        },
      ]);
    } else {
      setNotifications([
        {
          id: "1",
          type: "ADMIN",
          title: "Sistem Inklusif Siap Pakai",
          desc: "Seluruh instrumen asesmen dan modul PPI aktif dan terenkripsi.",
          time: "Hari ini",
          unread: true,
          link: "/admin",
        },
      ]);
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [role]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = "/login";
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Kata sandi baru minimal 6 karakter.");
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess("Kata sandi Anda berhasil diperbarui!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setIsChangePasswordModalOpen(false);
          setPasswordSuccess(null);
        }, 2000);
      } else {
        setPasswordError(data.error || "Gagal mengubah kata sandi");
      }
    } catch (err: any) {
      setPasswordError("Terjadi kesalahan sistem: " + err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const getRoleBadge = (r: string) => {
    switch (r) {
      case "ADMIN":
        return { label: "Super Admin", color: "bg-purple-100 text-purple-900 border-purple-200" };
      case "YAYASAN":
        return { label: "Pengurus Yayasan", color: "bg-amber-100 text-amber-900 border-amber-200" };
      case "GURU":
        return { label: "Guru Khusus SLB", color: "bg-teal-100 text-teal-900 border-teal-200" };
      case "ORANG_TUA":
        return { label: "Orang Tua / Wali", color: "bg-rose-100 text-rose-900 border-rose-200" };
      default:
        return { label: r || "Pengguna", color: "bg-slate-100 text-slate-800 border-slate-200" };
    }
  };

  const roleInfo = getRoleBadge(role);
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <>
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-20 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Mobile Hamburger Toggle */}
          <button
            onClick={openSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200 shrink-0"
            aria-label="Buka Menu Navigasi"
          >
            <Menu className="w-5 h-5 text-teal-700" />
          </button>

          <div className="min-w-0">
            <h1 className="text-base sm:text-lg md:text-xl font-black text-slate-900 tracking-tight truncate flex items-center gap-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>


        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
          {/* SLB Accessibility Bar */}
          <AccessibilityBar />

          {/* Date display */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>{todayFormatted}</span>
          </div>

          {/* Notifications Popover */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors relative"
              aria-label="Notifikasi"
            >
              <Bell className="w-4 h-4 text-slate-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-fade-in space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-teal-600" />
                    <span className="font-extrabold text-xs text-slate-900">Pemberitahuan Terkini</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-50 text-teal-800 rounded-full">
                    {unreadCount} Baru
                  </span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.link}
                      onClick={() => setIsNotifOpen(false)}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50/60 border border-slate-100 transition-colors block space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{n.title}</span>
                        <span className="text-[9px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{n.desc}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Interactive Dropdown (Kanan Atas) */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all shadow-sm group"
            >
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white font-black text-xs flex items-center justify-center shadow-sm shrink-0">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
              </div>

              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                  {session?.user?.name || "Pengguna SLB"}
                </div>
                <div className="text-[10px] text-teal-700 font-semibold leading-tight">
                  {roleInfo.label}
                </div>
              </div>

              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-fade-in divide-y divide-slate-100">
                {/* User Identity Box */}
                <div className="p-3 space-y-1.5">
                  <div className="text-xs font-black text-slate-900 truncate">
                    {session?.user?.name || "Pengguna SLB"}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {session?.user?.email || "user@slb.sch.id"}
                  </div>
                  <div className="pt-1">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleInfo.color}`}>
                      {roleInfo.label}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="py-1.5 space-y-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setPasswordError(null);
                      setPasswordSuccess(null);
                      setOldPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setIsChangePasswordModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-700 hover:text-teal-900 hover:bg-teal-50 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <KeyRound className="w-4 h-4 text-teal-700" />
                      <span>Ganti Kata Sandi</span>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-md border border-amber-200">
                      Nonaktif
                    </span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Keluar dari Akun</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal Mandiri: Ganti Kata Sandi */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 px-6 py-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-teal-300" />
                <h2 className="font-bold text-base sm:text-lg">Ganti Kata Sandi Akun</h2>
              </div>
              <button
                onClick={() => setIsChangePasswordModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-5 sm:p-6 space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <Lock className="w-4 h-4 text-amber-700" />
                  <span>Fitur Dinonaktifkan Sementara</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Fitur perubahan kata sandi mandiri sedang dinonaktifkan sementara oleh administrator sistem. Silakan hubungi admin sekolah bila Anda membutuhkan bantuan pengaturan akun.
                </p>
              </div>

              {passwordError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                  ⚠️ {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {/* Old Password */}
              <div className="opacity-60">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Kata Sandi Lama *
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Masukkan sandi saat ini..."
                    disabled
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold bg-slate-100 cursor-not-allowed text-slate-500"
                  />
                  <button
                    type="button"
                    disabled
                    className="absolute right-3 top-3 text-slate-400 cursor-not-allowed"
                  >
                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="opacity-60">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Kata Sandi Baru * (Min. 6 Karakter)
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ketik sandi baru yang aman..."
                    disabled
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold bg-slate-100 cursor-not-allowed text-slate-500"
                  />
                  <button
                    type="button"
                    disabled
                    className="absolute right-3 top-3 text-slate-400 cursor-not-allowed"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="opacity-60">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Konfirmasi Kata Sandi Baru *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru..."
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold bg-slate-100 cursor-not-allowed text-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled
                  className="px-5 py-2.5 bg-slate-300 text-slate-500 text-xs font-bold rounded-xl transition-all cursor-not-allowed flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Fitur Dinonaktifkan Sementara</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}
