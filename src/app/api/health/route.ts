import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();
  let dbStatus = "unknown";
  let dbLatencyMs = 0;

  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - startTime;
    dbStatus = "connected";
  } catch (error: any) {
    dbStatus = `error: ${error?.message || "Connection failed"}`;
  }

  const vercelEnv = process.env.VERCEL_ENV || process.env.NODE_ENV || "development";
  const gitCommitSha = process.env.VERCEL_GIT_COMMIT_SHA || "local";
  const gitBranch = process.env.VERCEL_GIT_COMMIT_REF || "development";

  return NextResponse.json({
    status: dbStatus === "connected" ? "healthy" : "degraded",
    environment: vercelEnv,
    branch: gitBranch,
    commit: gitCommitSha.substring(0, 7),
    timestamp,
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
    },
    message: "SLB Portal Branch & Health Test API is working!",
  });
}
