# 🏫 Sistem Informasi Manajemen & Asesmen SLB (slbApp)

[![Next.js](https://img.shields.io/badge/Next.js-14.2.35-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Neon PostgreSQL](https://img.shields.io/badge/Database-Neon_PostgreSQL-00E599?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![License: Non-Commercial](https://img.shields.io/badge/License-Non--Commercial-red.svg?style=for-the-badge)](LICENSE)

**slbApp** adalah platform web modern yang dirancang khusus untuk Sekolah Luar Biasa (SLB), pusat terapi, dan institusi pendidikan inklusi. Sistem ini mengintegrasikan **Asesmen Diagnostik Siswa**, **Program Pembelajaran Individual (PPI)**, **Buku Penghubung Harian Orang Tua & Guru**, **Pemantauan Perkembangan Berbasis Radar & Grafik Tren**, serta **Laporan Eksekutif Yayasan**.

---

## 🌟 Fitur Utama

### 1. 🛡️ Portal Super Administrator & Master Data
- **Identitas Sekolah & Yayasan**: Pengaturan nama institusi, NPSN, semester aktif, kontak, dan logo sekolah yang langsung terintegrasi ke seluruh kop surat rapor.
- **Manajemen Pengguna Lengkap (RBAC)**: Pengelolaan akun multi-peran (Super Admin, Pengurus Yayasan, Guru Kelas, dan Orang Tua/Wali) dengan fitur reset sandi instan dan show/hide password toggle.
- **Master Rombel & Jenjang**: Pembagian kelas adaptif (TKLB, SDLB, SMPLB, SMALB) dan penugasan wali kelas binaan.
- **Master Kurikulum Khusus**: Manajemen mata pelajaran terapi, bina diri (ADL), motorik, komunikasi, dan vokasional.
- **Audit Log Terpusat**: Pencatatan riwayat aktivitas pengguna (*Create, Update, Delete, Assessment, Evaluasi*) untuk transparansi data.

### 2. 👩‍🏫 Portal Guru Kelas (Pendidik Khusus)
- **Asesmen Diagnostik**: Format observasi terstandar 5 aspek (*Akademik, Bahasa & Komunikasi, Emosi & Perilaku, Fisik & Motorik, Bina Diri/ADL*) dengan cetak lembar asesmen PDF-ready.
- **Program Pembelajaran Individual (PPI)**:
  - Penetapan *Baseline Kemampuan Awal*, *Tujuan Jangka Panjang*, dan *Target Jangka Pendek*.
  - Evaluasi berkala dengan status capaian (*Mandiri, Dengan Bantuan, Belum Mampu*).
  - Cetak Rapor PPI resmi berformat standar pendidikan khusus.
- **Buku Penghubung Digital**: Komunikasi harian 2 arah antara guru dan orang tua mengenai catatan suasana hati (mood), kesehatan, makan, aktivitas terapi, serta unggah foto dokumentasi kegiatan.
- **Generator Narasi Rapor Otomatis**: Penyusunan draf deskripsi capaian rapor naratif secara otomatis berbasis kecerdasan agregasi skor kemandirian anak.
- **Ekspor Data**: Rekapitulasi semester komprehensif ke format CSV/Excel dalam satu klik.

### 3. 👨‍👩‍👧 Portal Orang Tua & Wali Murid
- **Dashboard Perkembangan Anak**: Visualisasi capaian belajar, ringkasan kemandirian, dan profil kebutuhan khusus anak binaan.
- **Grafik Tren Kemandirian & Radar Aspek**: Analisis visual pertumbuhan kemampuan bina diri dan perkembangan multi-aspek anak dari waktu ke waktu.
- **Buku Penghubung dari Rumah**: Orang tua dapat menulis kabar harian dari rumah dan memberikan konfirmasi/tanggapan atas catatan terapi dari sekolah.
- **Akses Cepat WhatsApp Guru**: Integrasi tombol direct chat WhatsApp ke wali kelas masing-masing anak.

### 4. 🏛️ Portal Eksekutif Yayasan & Pimpinan
- **Ikhtisar Demografi Disabilitas**: Visualisasi persentase klasifikasi disabilitas siswa (Autisme, Tunarungu, Tunanetra, Tunagrahita, Tunadaksa, Slow Learner, dll.).
- **Indeks Efektivitas Kemandirian**: Pantauan agregat keberhasilan target PPI di seluruh jenjang rombel sekolah.
- **Ekspor Komprehensif (All Data Rekap)**: Unduh seluruh master database sekolah (siswa, guru, wali murid, evaluasi, dan modul) dalam satu berkas laporan.

---

## 🛠️ Arsitektur & Teknologi

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) dengan palet warna adaptif pendidikan inklusi (Emerald & Slate)
- **Database & ORM**: [Neon Serverless PostgreSQL](https://neon.tech/) & [Prisma ORM](https://www.prisma.io/)
- **Autentikasi**: [NextAuth.js](https://next-auth.js.org/) (Credentials Provider & Role-Based Middleware)
- **Visualisasi Data**: [Recharts](https://recharts.org/) (Radar Chart, Line Trend Chart, Pie Breakdown)
- **Ikonografi**: [Lucide React](https://lucide.dev/) (Tree-shaken package optimization)
- **Enkripsi**: [Bcryptjs](https://www.npmjs.com/package/bcryptjs) untuk keamanan hashing password

---

## 🚀 Panduan Memulai Cepat (Local Development)

### 1. Prasyarat
Pastikan Anda telah menginstal:
- [Node.js](https://nodejs.org/) (versi 18.17 atau lebih baru)
- [Git](https://git-scm.com/)

### 2. Kloning Repositori
```bash
git clone https://github.com/anasysuf/slbapp.git
cd slbapp
```

### 3. Instalasi Dependensi
```bash
npm install
```

### 4. Konfigurasi Environment Variable (`.env`)
Buat berkas `.env` di direktori utama (root) proyek dan sesuaikan nilainya:
```env
# Database Connection (Neon PostgreSQL)
DATABASE_URL="postgresql://username:password@ep-sample-pooler.region.neon.tech/neondb?sslmode=require"

# NextAuth Secret & URL
NEXTAUTH_SECRET="buat-kunci-rahasia-acak-di-sini-32-karakter-min"
NEXTAUTH_URL="http://localhost:3000"
```

### 5. Sinkronisasi Skema Database & Seeding
```bash
# Generate Prisma Client
npx prisma generate

# Sinkronkan skema ke database PostgreSQL
npx prisma db push

# (Opsional) Jalankan seed data awal
npm run seed
```

### 6. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka peramban (browser) dan akses: **`http://localhost:3000`**

---

## 🔑 Akun Uji Coba (Demo Credentials)

Gunakan akun berikut untuk menguji masing-masing hak akses:

| Peran (Role) | Email | Password | Hak Akses Utama |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@slb.sch.id` | `admin123` | Master data sekolah, users, kelas, mapel, & audit logs |
| **Guru Kelas 1** | `guru@slb.sch.id` | `guru123` | Asesmen diagnostik, target PPI, buku penghubung, & rekap |
| **Guru Kelas 2** | `guru2@slb.sch.id` | `guru123` | Asesmen diagnostik, target PPI, buku penghubung, & rekap |
| **Guru Kelas 3** | `guru3@slb.sch.id` | `guru123` | Asesmen diagnostik, target PPI, buku penghubung, & rekap |
| **Guru Kelas 4** | `guru4@slb.sch.id` | `guru123` | Asesmen diagnostik, target PPI, buku penghubung, & rekap |
| **Orang Tua 1** | `ortu@slb.sch.id` | `ortu123` | Pantauan ananda Farhan, radar perkembangan, & buku penghubung |
| **Orang Tua 2** | `ortu2@slb.sch.id` | `ortu123` | Pantauan ananda Farhan, radar perkembangan, & buku penghubung |
| **Orang Tua 3** | `ortu3@slb.sch.id` | `ortu123` | Pantauan ananda Farhan, radar perkembangan, & buku penghubung |
| **Yayasan** | `pimpinan@yayasan.org` | `yayasan123` | Dashboard eksekutif pimpinan & ekspor laporan menyeluruh |

---

## 📂 Struktur Direktori Proyek

```text
slbApp/
├── prisma/
│   └── schema.prisma         # Skema database relasional (User, Student, PPI, Asesmen, Journal, dll.)
├── public/                   # Aset publik statis dan favicon
├── src/
│   ├── app/                  # Next.js 14 App Router
│   │   ├── admin/            # Dashboard & Master Panel Super Admin
│   │   ├── api/              # RESTful API Endpoints (CRUD, Stats, Auth, Rekap)
│   │   ├── guru/             # Portal Guru (Asesmen, PPI, Evaluasi, Jurnal, Rekap, Cetak)
│   │   ├── login/            # Halaman Autentikasi dengan toggle Show Password
│   │   ├── ortu/             # Portal Orang Tua Murid
│   │   ├── yayasan/          # Portal Eksekutif Yayasan
│   │   ├── globals.css       # Tailwind CSS & Hardware Accelerated Utilities
│   │   └── layout.tsx        # Root Layout & NextAuth Session Provider
│   ├── components/           # Komponen UI Reusable (Header, Sidebar, Charts, Modals, Footer)
│   ├── lib/                  # Utilitas Helper (Prisma Client, Auth Options, CSV Exporter, Loggers)
│   └── middleware.ts         # NextAuth Route Protection & RBAC Redirection
├── next.config.mjs           # Optimasi Compiler, Caching, & Tree-Shaking
├── package.json              # Daftar Dependensi & Script Proyek
└── README.md                 # Dokumentasi Resmi Proyek
```

---

## ⚡ Performa & Optimasi

- **Database GroupBy Aggregation**: Kalkulasi statistik dan rekapitulasi diproses langsung pada level database server PostgreSQL.
- **Concurrent Query Execution**: Pengambilan data relasional multi-tabel menggunakan `Promise.all` paralel tanpa *waterfall delay*.
- **Client Memoization**: Pencarian dan penyaringan data di front-end dibungkus dengan `useMemo` (*zero typing lag*).
- **Mobile-First Responsive Pill/Badges**: Standarisasi bubble status simetris yang anti-gepeng di layar smartphone (320px–768px).
- **Aggressive Asset Caching**: Konfigurasi header cache immutable untuk berkas statis dan kompresi aset gambar.

---

## 👨‍💻 Pembuat & Pengembang (Author)

Dikembangkan dengan dedikasi untuk kemajuan pendidikan inklusi dan Sekolah Luar Biasa (SLB) oleh:
- **Muhammad Anas Yusuf** ([@anasysuf](https://github.com/anasysuf))

---

## 📄 Lisensi (License)

Hak Cipta © 2026 **Muhammad Anas Yusuf**. Seluruh hak cipta dilindungi undang-undang.

Proyek ini dilisensikan di bawah [Non-Commercial Software License (Lisensi Non-Komersial)](LICENSE).

- ✅ **Diizinkan (Permitted)**: Penggunaan gratis untuk sekolah luar biasa (SLB), yayasan nirlaba, guru, terapis, orang tua, dan tujuan riset/edukasi tanpa memungut biaya komersial.
- ❌ **Dilarang (Prohibited)**: Penggunaan untuk tujuan komersial, monetisasi, penjualan ulang (*reselling*), hosting SaaS berbayar, atau keuntungan finansial lainnya tanpa izin tertulis dari pemegang hak cipta (**Muhammad Anas Yusuf**).
