"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import React, { Suspense } from "react";
import {
  GraduationCap,
  Users,
  ClipboardList,
  Target,
  FileCheck,
  BookOpen,
  Settings,
  Building2,
  HeartHandshake,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Activity,
  UserCheck,
  X,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

function SidebarNavList({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTabParam = searchParams ? searchParams.get("tab") || "siswa" : "siswa";
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const guruLinks = [
    { href: "/guru", label: "Dashboard Guru", icon: GraduationCap },
    { href: "/guru/siswa", label: "Kelola Siswa Kelas", icon: Users },
    { href: "/guru/asesmen", label: "Asesmen Khusus", icon: ClipboardList },
    { href: "/guru/ppi", label: "Rencana PPI (IEP)", icon: Target },
    { href: "/guru/evaluasi", label: "Input Evaluasi", icon: FileCheck },
    { href: "/guru/jurnal", label: "Buku Penghubung", icon: HeartHandshake },
    { href: "/guru/materi", label: "Materi & Tugas", icon: BookOpen },
  ];

  const ortuLinks = [
    { href: "/ortu", label: "Portal Orang Tua", icon: HeartHandshake },
  ];

  const yayasanLinks = [
    { href: "/yayasan", label: "Dashboard Eksekutif", icon: Building2 },
    { href: "/admin?tab=siswa", label: "Data Siswa Yayasan", icon: Users, tab: "siswa" },
    { href: "/admin?tab=logs", label: "Log Aktivitas", icon: Activity, tab: "logs" },
  ];

  const adminLinks = [
    { href: "/admin?tab=siswa", label: "Master Data Siswa", icon: Users, tab: "siswa" },
    { href: "/admin?tab=pengguna", label: "Manajemen Pengguna", icon: UserCheck, tab: "pengguna" },
    { href: "/admin?tab=kelas", label: "Rombel & Jenjang", icon: GraduationCap, tab: "kelas" },
    { href: "/admin?tab=mapel", label: "Mata Pelajaran Khusus", icon: BookOpen, tab: "mapel" },
    { href: "/admin?tab=logs", label: "Log Aktivitas Yayasan", icon: Activity, tab: "logs" },
  ];

  let currentLinks = guruLinks;
  if (role === "ORANG_TUA") currentLinks = ortuLinks;
  if (role === "YAYASAN") currentLinks = yayasanLinks;
  if (role === "ADMIN") currentLinks = adminLinks;

  return (
    <div className="space-y-1">
      <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {role === "ADMIN" ? "Menu Master Admin" : `Menu Navigasi (${role || "GURU"})`}
      </div>

      {currentLinks.map((item: any) => {
        const Icon = item.icon;
        let isActive = pathname === item.href;
        if (role === "ADMIN" || (role === "YAYASAN" && item.tab)) {
          isActive = pathname === "/admin" && activeTabParam === item.tab;
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              isActive
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </div>
            {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
          </Link>
        );
      })}
    </div>
  );
}

export default function Sidebar() {
  const { data: session } = useSession();
  const { isOpen, closeSidebar } = useSidebar();
  const role = (session?.user as any)?.role;
  const foundationName = (session?.user as any)?.foundationName;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = "/login";
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-extrabold text-sm tracking-tight text-white truncate">SLB Portal</h1>
            <p className="text-[11px] text-teal-400 font-medium truncate">
              {foundationName || "Sistem Inklusi & PPI"}
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={closeSidebar}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Tutup Menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation with Suspense boundary for useSearchParams */}
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <Suspense fallback={<div className="px-3 py-2 text-xs text-slate-500">Memuat menu...</div>}>
          <SidebarNavList onItemClick={closeSidebar} />
        </Suspense>
      </div>

      {/* User Info & Sign Out */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-teal-800/60 border border-teal-500/40 text-teal-300 flex items-center justify-center font-bold text-xs shrink-0">
            {session?.user?.name ? session.user.name.charAt(0) : "U"}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold truncate text-slate-200">
              {session?.user?.name || "Pengguna SLB"}
            </div>
            <div className="text-[10px] text-teal-400 font-medium flex items-center gap-1 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              {role === "ADMIN" ? "ADMIN YAYASAN" : role || "GURU"}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 rounded-lg transition-colors border border-rose-900/30 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar dari Akun</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Always visible on large screens) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r border-slate-800 shrink-0 min-h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-in on small screens) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={closeSidebar}
          />

          {/* Drawer Sheet */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
