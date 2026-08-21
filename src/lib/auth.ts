import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // Maksimal 1 jam (3600 detik)
  },
  jwt: {
    maxAge: 60 * 60, // Maksimal 1 jam
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          include: {
            foundation: true,
          },
        });

        if (!user) return null;

        // Check password strictly with bcrypt hash
        if (!user.passwordHash || (!user.passwordHash.startsWith("$2a$") && !user.passwordHash.startsWith("$2b$"))) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (isValid) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            foundationId: user.foundationId,
            foundationName: user.foundation?.name,
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return url;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {}
      return baseUrl || "/";
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role as Role;
        token.id = user.id;
        token.foundationId = (user as any).foundationId;
        token.foundationName = (user as any).foundationName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role as Role;
        (session.user as any).id = token.id as string;
        (session.user as any).foundationId = token.foundationId as string;
        (session.user as any).foundationName = token.foundationName as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "slb-app-super-secret-key-2026-production-ready",
};
