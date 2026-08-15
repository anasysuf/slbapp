import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });


export const metadata: Metadata = {
  title: "SLB Portal - Sistem Informasi Sekolah Luar Biasa",
  description: "Sistem Manajemen Pembelajaran Khusus, Program Pembelajaran Individual (PPI), dan Asesmen Perkembangan Siswa SLB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <body className={`${inter.variable} font-sans h-full bg-slate-50 text-slate-800`}>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
