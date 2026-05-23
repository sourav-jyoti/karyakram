import { Request, Response } from "express";
import * as notificationService from "./service.js";
import type { UpdateNotificationBody } from "./types.js";
import { AppError } from "../../utils/AppError.js";

// ─── GET /internal/notifications/pending ────────────────────────────

export async function getPending(_req: Request, res: Response): Promise<void> {
  const notifications = await notificationService.getPendingNotifications();

  res.json({
    notifications: notifications.map((n) => ({
      id: n.id,
      booking_id: n.bookingId,
      recipient_email: n.recipientEmail,
      type: n.type,
      scheduled_at: n.scheduledAt,
    })),
  });
}

// ─── PATCH /internal/notifications/:notificationId ──────────────────

export async function update(req: Request, res: Response): Promise<void> {
  const body = req.body as UpdateNotificationBody;

  if (!body.status || !["sent", "failed"].includes(body.status)) {
    throw new AppError(400, "VALIDATION_ERROR", "status must be 'sent' or 'failed'");
  }

  const notificationId = String(req.params.notificationId);

  const notification = await notificationService.updateNotification(
    notificationId,
    body.status,
    body.sent_at
  );

  res.json({
    notification: {
      id: notification.id,
      status: notification.status,
      sent_at: notification.sentAt,
    },
  });
}
