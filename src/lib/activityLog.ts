import prisma from "./prisma";
import { Role } from "@prisma/client";

interface LogParams {
  userId: string;
  userName: string;
  userRole: Role;
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "ASSESSMENT" | "EVALUATION" | "JOURNAL";
  entity: string;
  entityId?: string;
  description: string;
  foundationId?: string | null;
}

export async function logActivity(params: LogParams) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId,
        userName: params.userName,
        userRole: params.userRole,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        description: params.description,
        foundationId: params.foundationId || null,
      },
    });
  } catch (error) {
    console.error("Gagal mencatat log aktivitas:", error);
  }
}
