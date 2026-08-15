"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { data: session } = useSession();
  const { openSidebar } = useSidebar();
  const role = (session?.user as any)?.role;
  const foundationName = (session?.user as any)?.foundationName;


  // Notification states
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
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

  const fetchNotifications = async () => {
    try {
      setLoadingNotifs(true);
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const handleNotificationClick = async (notif: any) => {
    setIsNotifOpen(false);
    if (!notif.isRead) {
      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: notif.id }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Error updating notification:", err);
      }
    }
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Baru saja";
      if (diffMins < 60) return `${diffMins} menit lalu`;
      if (diffHours < 24) return `${diffHours} jam lalu`;
      if (diffDays === 1) return "Kemarin";
      if (diffDays < 7) return `${diffDays} hari lalu`;
      return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    } catch {
      return "Hari ini";
    }
  };

  useEffect(() => {
    fetchNotifications();

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
              onClick={() => {
                if (!isNotifOpen) fetchNotifications();
                setIsNotifOpen(!isNotifOpen);
              }}
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
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 z-50 animate-fade-in space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-teal-600" />
                    <span className="font-extrabold text-xs text-slate-900">Pemberitahuan Sistem</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-[10px] font-bold text-teal-700 hover:text-teal-900 hover:underline"
                      >
                        Tandai Semua Dibaca
                      </button>
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-50 text-teal-800 rounded-full border border-teal-200">
                      {unreadCount} Baru
                    </span>
                  </div>
                </div>

                {loadingNotifs ? (
                  <div className="py-6 text-center text-xs text-slate-400">Memuat pemberitahuan...</div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                      <Bell className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-500">Tidak ada notifikasi baru saat ini</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {notifications.map((n) => {
                      const isUnread = !n.isRead;
                      return (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer block space-y-1 text-left ${
                            isUnread
                              ? "bg-teal-50/50 border-teal-200/80 hover:bg-teal-50"
                              : "bg-slate-50/60 border-slate-100 hover:bg-slate-100/70"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              {isUnread && (
                                <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                              )}
                              <span className="font-bold text-xs text-slate-900 leading-snug">
                                {n.title}
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-400 shrink-0 whitespace-nowrap">
                              {formatRelativeTime(n.createdAt)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug pl-3.5">
                            {n.message}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
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
