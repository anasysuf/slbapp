"use client";

import { SessionProvider } from "next-auth/react";
import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SidebarProvider } from "@/context/SidebarContext";
import IdleTimeoutHandler from "@/components/IdleTimeoutHandler";

function BfCacheProtection() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Tangani saat pengguna menekan tombol Back / Forward di browser (PageShow event)
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted && pathname !== "/login") {
        // Jika halaman dipulihkan dari memory cache browser, refresh data sesi
        router.refresh();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [pathname, router]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SidebarProvider>
        <BfCacheProtection />
        <IdleTimeoutHandler />
        {children}
      </SidebarProvider>
    </SessionProvider>
  );
}
