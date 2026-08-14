"use client";

import { useSession } from "next-auth/react";
import { Bell, Calendar, Sparkles, UserCircle2, Menu } from "lucide-react";
import AccessibilityBar from "./AccessibilityBar";
import { useSidebar } from "@/context/SidebarContext";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { data: session } = useSession();
  const { openSidebar } = useSidebar();
  
  const todayFormatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

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
