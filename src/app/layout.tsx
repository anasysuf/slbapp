import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SLB Portal & PPI - Sistem Informasi Sekolah Luar Biasa",
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
      </body>
    </html>
  );
}
