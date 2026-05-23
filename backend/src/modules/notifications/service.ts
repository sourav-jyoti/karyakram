import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

// ─── Get pending notifications ──────────────────────────────────────

export async function getPendingNotifications() {
  return prisma.notification.findMany({
    where: {
      status: "pending",
      scheduledAt: { lte: new Date() },
    },
    take: 20,
    orderBy: { scheduledAt: "asc" },
  });
}

// ─── Update notification status ─────────────────────────────────────

export async function updateNotification(
  notificationId: string,
  status: "sent" | "failed",
  sentAt?: string
) {
  const existing = await prisma.notification.findUnique({
    where: { id: notificationId },
  });
  if (!existing) throw new AppError(404, "NOT_FOUND", "Notification not found");

  const updateData: Record<string, unknown> = { status };
  if (sentAt) {
    updateData.sentAt = new Date(sentAt);
  } else if (status === "sent") {
    updateData.sentAt = new Date();
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: updateData as any,
  });
}
