import prisma from "./prisma";

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: "JOURNAL" | "FEEDBACK" | "ASSESSMENT" | "PPI" | "EVALUATION" | "MATERIAL" | "SYSTEM" | "INFO";
  link?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    if (!params.userId || !params.title || !params.message) return null;

    const notif = await prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title.trim(),
        message: params.message.trim(),
        type: params.type || "INFO",
        link: params.link || null,
        isRead: false,
      },
    });

    return notif;
  } catch (error) {
    console.error("Gagal membuat notifikasi:", error);
    return null;
  }
}

export async function createBatchNotifications(notifications: CreateNotificationParams[]) {
  try {
    if (!notifications.length) return;

    await prisma.notification.createMany({
      data: notifications.map((n) => ({
        userId: n.userId,
        title: n.title.trim(),
        message: n.message.trim(),
        type: n.type || "INFO",
        link: n.link || null,
        isRead: false,
      })),
    });
  } catch (error) {
    console.error("Gagal membuat notifikasi batch:", error);
  }
}
