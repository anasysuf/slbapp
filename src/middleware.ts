import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    const response = NextResponse.next();
    // Cegah cache browser saat navigasi back / forward
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    // Proteksi Hak Akses RBAC per Peran
    // Khusus rute cetak rapor PPI & Asesmen, izinkan peran Guru, Admin, Orang Tua, dan Yayasan
    if (path.startsWith("/guru/ppi/cetak") || path.startsWith("/guru/asesmen/cetak")) {
      if (!token?.role || !["GURU", "ADMIN", "ORANG_TUA", "YAYASAN"].includes(token.role as string)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
      return response;
    }

    // Yayasan & Admin memiliki akses supervisi ke modul /admin, /yayasan, /guru, dan /ortu
    if (path.startsWith("/admin") && token?.role !== "ADMIN" && token?.role !== "YAYASAN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (path.startsWith("/yayasan") && token?.role !== "YAYASAN" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (path.startsWith("/guru") && token?.role !== "GURU" && token?.role !== "ADMIN" && token?.role !== "YAYASAN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (path.startsWith("/ortu") && token?.role !== "ORANG_TUA" && token?.role !== "ADMIN" && token?.role !== "YAYASAN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return response;
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // Izinkan publik mengakses /login, /api/auth, /api/health
        if (path === "/login" || path.startsWith("/api/auth") || path === "/api/health") {
          return true;
        }
        // Rute lainnya wajib memiliki token aktif
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/yayasan/:path*",
    "/guru/:path*",
    "/ortu/:path*",
    "/dashboard/:path*",
    "/api/((?!auth|health).*)",
  ],
};
