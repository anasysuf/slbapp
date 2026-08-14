"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Clock, ShieldAlert, LogOut, CheckCircle2 } from "lucide-react";

const IDLE_TIMEOUT_MS = 60 * 60 * 1000; // 1 Jam = 3,600,000 ms
const WARNING_BEFORE_MS = 5 * 60 * 1000; // Peringatan muncul 5 menit sebelum logout (55 menit idle)
const CHECK_INTERVAL_MS = 10 * 1000; // Cek setiap 10 detik
const STORAGE_KEY = "slb_portal_last_activity";

export default function IdleTimeoutHandler() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const isLoggingOut = useRef(false);

  // Update last activity timestamp in localStorage
  const updateActivity = useCallback(() => {
    if (status !== "authenticated" || isLoggingOut.current) return;
    const now = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY, now.toString());
    } catch {}
    if (showWarning) {
      setShowWarning(false);
    }
  }, [status, showWarning]);

  // Perform logout
  const handleAutoLogout = useCallback(async () => {
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;
    setShowWarning(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
      await signOut({ redirect: false });
      window.location.href = "/login?sessionExpired=true";
    } catch (err) {
      window.location.href = "/login?sessionExpired=true";
    }
  }, []);

  // Stay logged in button clicked
  const handleStayLoggedIn = () => {
    updateActivity();
    setShowWarning(false);
  };

  useEffect(() => {
    if (status !== "authenticated") {
      setShowWarning(false);
      return;
    }

    // Set initial activity on mount if not present
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      updateActivity();
    }

    // Throttled activity listener
    let lastRecorded = 0;
    const onUserInteraction = () => {
      const now = Date.now();
      // Throttle event handling to once every 2 seconds
      if (now - lastRecorded > 2000) {
        lastRecorded = now;
        updateActivity();
      }
    };

    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "touchstart",
      "scroll",
      "click",
    ];

    events.forEach((event) => {
      window.addEventListener(event, onUserInteraction, { passive: true });
    });

    // Check interval
    const interval = setInterval(() => {
      if (status !== "authenticated" || isLoggingOut.current) return;

      const raw = localStorage.getItem(STORAGE_KEY);
      const lastActive = raw ? parseInt(raw, 10) : Date.now();
      const elapsed = Date.now() - lastActive;

      if (elapsed >= IDLE_TIMEOUT_MS) {
        // Exceeded 1 hour idle -> Logout immediately
        handleAutoLogout();
      } else if (elapsed >= IDLE_TIMEOUT_MS - WARNING_BEFORE_MS) {
        // Between 55m and 60m idle -> Show warning modal with countdown
        const remaining = Math.max(0, Math.floor((IDLE_TIMEOUT_MS - elapsed) / 1000));
        setSecondsRemaining(remaining);
        setShowWarning(true);
      } else {
        if (showWarning) {
          setShowWarning(false);
        }
      }
    }, CHECK_INTERVAL_MS);

    // Also check on tab visibility change (e.g. laptop opened after sleep)
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const elapsed = Date.now() - parseInt(raw, 10);
          if (elapsed >= IDLE_TIMEOUT_MS) {
            handleAutoLogout();
          }
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, onUserInteraction);
      });
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearInterval(interval);
    };
  }, [status, updateActivity, handleAutoLogout, showWarning]);

  // Live countdown timer while warning is open
  useEffect(() => {
    if (!showWarning) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showWarning, handleAutoLogout]);

  if (!showWarning || status !== "authenticated") {
    return null;
  }

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-5 animate-scale-up">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-amber-200">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/70 text-amber-900 rounded-full text-xs font-bold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Peringatan Keamanan Sesi</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900">
            Sesi Anda Akan Segera Berakhir
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Anda telah tidak aktif selama hampir <strong>1 jam</strong>. Untuk melindungi keamanan data sekolah dan siswa, sistem akan keluar otomatis dalam:
          </p>
        </div>

        {/* Countdown Box */}
        <div className="py-3 px-6 bg-slate-50 border border-slate-200 rounded-2xl inline-block">
          <span className="font-mono text-3xl font-black text-amber-600 tracking-wider">
            {formattedTime}
          </span>
          <span className="block text-[11px] font-semibold text-slate-400 mt-0.5">
            menit : detik
          </span>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={handleStayLoggedIn}
            className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-600/30 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Saya Masih di Sini (Lanjutkan Sesi)</span>
          </button>

          <button
            type="button"
            onClick={handleAutoLogout}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
}
