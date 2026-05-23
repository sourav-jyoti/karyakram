import { DateTime } from "luxon";
import { prisma } from "../../lib/prisma.js";
import { sendEmail } from "../../lib/mailer.js";

const POLL_INTERVAL_MS = 15_000; // 15 seconds

/**
 * Process all pending notifications that are due.
 * Fetches notification + booking + event type + host data,
 * builds the email, sends it, and marks it as sent/failed.
 */
async function processPendingNotifications(): Promise<void> {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        status: "pending",
        scheduledAt: { lte: new Date() },
      },
      include: {
        booking: {
          include: {
            eventType: true,
            host: true,
            attendees: true,
          },
        },
      },
      take: 20,
      orderBy: { scheduledAt: "asc" },
    });

    for (const notification of notifications) {
      try {
        const { booking } = notification;
        const hostTz = booking.host.timezone;
        const invitee = booking.attendees.find((a) => !a.isHost);

        // Format times in both timezones
        const startUtc = DateTime.fromJSDate(booking.startAt, { zone: "utc" });
        const startHost = startUtc.setZone(hostTz).toFormat("cccc, LLLL d, yyyy 'at' h:mm a ZZZZ");
        const startInvitee = invitee
          ? startUtc.setZone(invitee.timezone).toFormat("cccc, LLLL d, yyyy 'at' h:mm a ZZZZ")
          : startHost;

        // Build email content based on notification type
        let subject: string;
        let text: string;

        switch (notification.type) {
          case "confirmation":
            subject = `Booking Confirmed: ${booking.eventType.title}`;
            text = buildConfirmationEmail(booking, startHost, startInvitee, invitee);
            break;
          case "cancellation":
            subject = `Booking Cancelled: ${booking.eventType.title}`;
            text = buildCancellationEmail(booking, startHost);
            break;
          case "reminder_24h":
            subject = `Reminder (24h): ${booking.eventType.title}`;
            text = buildReminderEmail(booking, startHost, startInvitee, invitee, "24 hours");
            break;
          case "reminder_1h":
            subject = `Reminder (1h): ${booking.eventType.title}`;
            text = buildReminderEmail(booking, startHost, startInvitee, invitee, "1 hour");
            break;
          default:
            subject = `Karyakram Notification`;
            text = `You have a notification for ${booking.eventType.title}`;
        }

        await sendEmail({
          recipientEmail: notification.recipientEmail,
          subject,
          text,
        });

        await prisma.notification.update({
          where: { id: notification.id },
          data: { status: "sent", sentAt: new Date() },
        });
      } catch (err: any) {
        console.error("Email send failed:", notification.id, err.message);
        await prisma.notification.update({
          where: { id: notification.id },
          data: { status: "failed" },
        });
      }
    }
  } catch (err) {
    console.error("Notification worker error:", err);
  }
}

// ─── Email builders ─────────────────────────────────────────────────

function buildConfirmationEmail(booking: any, startHost: string, startInvitee: string, invitee: any): string {
  const lines = [
    `Your booking for "${booking.eventType.title}" has been confirmed!`,
    ``,
    `Host: ${booking.host.name}`,
    `Duration: ${booking.eventType.durationMinutes} minutes`,
    `Time (host): ${startHost}`,
  ];

  if (invitee && startInvitee !== startHost) {
    lines.push(`Time (invitee): ${startInvitee}`);
  }

  if (booking.cancelToken) {
    lines.push(``, `Cancel: https://karyakram.com/cancel/${booking.cancelToken}`);
  }
  if (booking.rescheduleToken) {
    lines.push(`Reschedule: https://karyakram.com/reschedule/${booking.rescheduleToken}`);
  }

  return lines.join("\n");
}

function buildCancellationEmail(booking: any, startHost: string): string {
  return [
    `Your booking for "${booking.eventType.title}" has been cancelled.`,
    ``,
    `Original time: ${startHost}`,
    booking.cancelReason ? `Reason: ${booking.cancelReason}` : "",
  ].filter(Boolean).join("\n");
}

function buildReminderEmail(
  booking: any,
  startHost: string,
  startInvitee: string,
  invitee: any,
  timeframe: string
): string {
  const lines = [
    `Reminder: Your "${booking.eventType.title}" meeting is in ${timeframe}.`,
    ``,
    `Host: ${booking.host.name}`,
    `Time (host): ${startHost}`,
  ];

  if (invitee && startInvitee !== startHost) {
    lines.push(`Time (invitee): ${startInvitee}`);
  }

  return lines.join("\n");
}

// ─── Worker start ───────────────────────────────────────────────────

export function startNotificationWorker(): void {
  setInterval(processPendingNotifications, POLL_INTERVAL_MS);
  console.log("📧 Notification worker started — polling every 15s");
}
