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
  BarChart3,
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
    { href: "/guru/rekap", label: "Rekapitulasi Semester", icon: BarChart3 },
  ];

  const ortuLinks = [
    { href: "/ortu", label: "Portal Orang Tua", icon: HeartHandshake },
  ];

  const yayasanLinks = [
    { href: "/yayasan", label: "Dashboard Eksekutif", icon: Building2 },
    { href: "/guru/rekap", label: "Rekapitulasi Semester", icon: BarChart3 },
    { href: "/admin?tab=sekolah", label: "Profil & Logo Sekolah", icon: Building2, tab: "sekolah" },
    { href: "/admin?tab=siswa", label: "Data Siswa Yayasan", icon: Users, tab: "siswa" },
    { href: "/admin?tab=guru", label: "Data Guru & Pengampu", icon: GraduationCap, tab: "guru" },
    { href: "/admin?tab=ortu", label: "Data Orang Tua", icon: HeartHandshake, tab: "ortu" },
    { href: "/admin?tab=kelas", label: "Rombel & Jenjang", icon: GraduationCap, tab: "kelas" },
    { href: "/guru/asesmen", label: "Pantau Asesmen Khusus", icon: ClipboardList },
    { href: "/guru/ppi", label: "Pantau Rencana PPI", icon: Target },
    { href: "/guru/jurnal", label: "Pantau Buku Penghubung", icon: HeartHandshake },
    { href: "/guru/materi", label: "Materi & Tugas Adaptif", icon: BookOpen },
    { href: "/admin?tab=logs", label: "Log Aktivitas Sistem", icon: Activity, tab: "logs" },
  ];


  const adminLinks = [
    { href: "/admin?tab=sekolah", label: "Profil & Logo Sekolah", icon: Building2, tab: "sekolah" },
    { href: "/guru/rekap", label: "Rekapitulasi Semester", icon: BarChart3 },
    { href: "/admin?tab=siswa", label: "Master Data Siswa", icon: Users, tab: "siswa" },
    { href: "/admin?tab=guru", label: "Manajemen Guru", icon: GraduationCap, tab: "guru" },
    { href: "/admin?tab=ortu", label: "Manajemen Orang Tua", icon: HeartHandshake, tab: "ortu" },
    { href: "/admin?tab=yayasan", label: "Manajemen Yayasan", icon: Building2, tab: "yayasan" },
    { href: "/admin?tab=admin", label: "Manajemen Admin", icon: ShieldCheck, tab: "admin" },
    { href: "/admin?tab=kelas", label: "Rombel & Jenjang", icon: GraduationCap, tab: "kelas" },
    { href: "/admin?tab=mapel", label: "Mata Pelajaran Khusus", icon: BookOpen, tab: "mapel" },
    { href: "/admin?tab=logs", label: "Log Aktivitas Yayasan", icon: Activity, tab: "logs" },
  ];

  let currentLinks = guruLinks;
  if (role === "ORANG_TUA") currentLinks = ortuLinks;
  if (role === "YAYASAN") currentLinks = yayasanLinks;
  if (role === "ADMIN") currentLinks = adminLinks;

  return (
    <div className="space-y-1.5">
      <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {role === "ADMIN" ? "Menu Master Admin" : `Menu Navigasi (${role || "GURU"})`}
      </div>

      {currentLinks.map((item: any) => {
        const Icon = item.icon;
        let isActive = false;
        if (item.tab) {
          isActive = pathname === "/admin" && activeTabParam === item.tab;
        } else {
          isActive = pathname === item.href;
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={`flex items-center justify-between w-full h-10 px-3.5 rounded-xl text-xs font-semibold transition-all ${
              isActive
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/30 font-bold"
                : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 overflow-hidden">
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
              <span className="truncate">{item.label}</span>
            </div>
            {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-80" />}
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
    <div className="flex flex-col h-full min-h-screen bg-slate-900 text-slate-100">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40 shrink-0">
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

      {/* Sidebar Footer Widget: WhatsApp & Made with love in Malang */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 shrink-0 mt-auto space-y-2">
        <a
          href="https://api.whatsapp.com/send?phone=6288228342864&text=Haloo%2C+saya+tertarik+untuk+membuat+website+seperti+SLB+Portal+ini%21"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] shadow-sm"
        >
          <svg className="w-3.5 h-3.5 fill-emerald-400 shrink-0" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
          <span>WhatsApp Contact Me</span>
        </a>
        <div className="text-center text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
          <span>Made with</span>
          <span className="text-rose-400">❤️</span>
          <span>in Malang</span>
        </div>
      </div>
    </div>
  );


  return (
    <>
      {/* Desktop Sidebar (Always visible on large screens) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r border-slate-800 shrink-0 min-h-screen bg-slate-900 self-stretch print:hidden">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-in on small screens) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex print:hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={closeSidebar}
          />

          {/* Drawer Sheet */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 shadow-2xl z-50 min-h-screen">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
