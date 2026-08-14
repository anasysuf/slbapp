"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Bell, Calendar, Sparkles, UserCircle2, Menu, X, CheckCircle2, MessageCircle, ClipboardCheck, ArrowRight } from "lucide-react";
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

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

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
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [role]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-20 px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={openSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200 shrink-0"
          aria-label="Buka Menu Navigasi"
        >
          <Menu className="w-5 h-5 text-teal-700" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            {title}
          </h1>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 sm:line-clamp-none">{subtitle}</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {/* SLB Accessibility Bar */}
        <AccessibilityBar />

        {/* Date display */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-medium text-slate-600">
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

        {/* User preview badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50/80 rounded-lg border border-teal-100">
          <UserCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-teal-700 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-teal-900 block truncate max-w-[120px] sm:max-w-[150px]">
              {session?.user?.name?.split(" ")[0] || "User"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
