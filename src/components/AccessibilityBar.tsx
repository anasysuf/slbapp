"use client";

import { useState } from "react";
import { Eye, Volume2, Type, Sparkles } from "lucide-react";

export default function AccessibilityBar() {
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("normal");
  const [highContrast, setHighContrast] = useState(false);

  const toggleFontSize = () => {
    const next = fontSize === "normal" ? "large" : fontSize === "large" ? "xlarge" : "normal";
    setFontSize(next);

    // Apply font scaling to document root
    const root = document.documentElement;
    if (next === "large") {
      root.style.fontSize = "18px";
    } else if (next === "xlarge") {
      root.style.fontSize = "20px";
    } else {
      root.style.fontSize = "16px";
    }
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    if (!highContrast) {
      document.body.classList.add("contrast-125", "brightness-95");
    } else {
      document.body.classList.remove("contrast-125", "brightness-95");
    }
  };

  const handleSpeak = () => {
    if ("speechSynthesis" in window) {
      const textToRead = "Selamat datang di Portal Sistem Informasi Sekolah Luar Biasa Harapan Mulia. Sistem manajemen pembelajaran individual dan asesmen perkembangan siswa berkebutuhan khusus.";
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = "id-ID";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Browser Anda belum mendukung Text-to-Speech.");
    }
  };

  return (
    <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200 text-xs shrink-0">
      <button
        onClick={toggleFontSize}
        className="px-2 sm:px-2.5 py-1 bg-white hover:bg-teal-50 hover:text-teal-700 font-bold rounded-lg border border-slate-200 transition-colors flex items-center gap-1 shrink-0"
        title="Ubah Ukuran Teks (Aksesibilitas)"
      >
        <Type className="w-3.5 h-3.5 text-teal-700" />
        <span className="hidden sm:inline text-[10px]">
          {fontSize === "normal" ? "Teks: Normal" : fontSize === "large" ? "Teks: Besar" : "Teks: Ekstra"}
        </span>
      </button>

      <button
        onClick={toggleHighContrast}
        className={`px-2 sm:px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 font-bold shrink-0 ${
          highContrast
            ? "bg-slate-900 text-yellow-300 border-slate-900"
            : "bg-white hover:bg-teal-50 text-slate-700 border-slate-200"
        }`}
        title="Mode Kontras Tinggi"
      >
        <Eye className="w-3.5 h-3.5" />
        <span className="hidden sm:inline text-[10px]">{highContrast ? "Kontras: ON" : "Kontras"}</span>
      </button>

      <button
        onClick={handleSpeak}
        className="px-2 sm:px-2.5 py-1 bg-white hover:bg-teal-50 hover:text-teal-700 text-slate-700 font-bold rounded-lg border border-slate-200 transition-colors flex items-center gap-1 shrink-0"
        title="Suara Audio Ringkasan (Screen Reader Friendly)"
      >
        <Volume2 className="w-3.5 h-3.5 text-teal-600" />
        <span className="hidden sm:inline text-[10px]">Audio</span>
      </button>
    </div>

  );
}
