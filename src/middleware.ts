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

    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (path.startsWith("/yayasan") && token?.role !== "YAYASAN" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (path.startsWith("/guru") && token?.role !== "GURU" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (path.startsWith("/ortu") && token?.role !== "ORANG_TUA" && token?.role !== "ADMIN") {
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
        // Izinkan publik mengakses /login
        if (req.nextUrl.pathname === "/login") return true;
        // Rute lainnya wajib memiliki token aktif
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/yayasan/:path*", "/guru/:path*", "/ortu/:path*", "/dashboard/:path*"],
};
