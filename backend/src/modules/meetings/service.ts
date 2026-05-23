import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { assertTransition } from "../../utils/constants.js";
import { DateTime } from "luxon";

// ─── List meetings ──────────────────────────────────────────────────

export async function listMeetings(
  userId: string,
  filters: {
    period: string | undefined;
    status: string | undefined;
    eventTypeId: string | undefined;
  },
  pagination: { page: number; perPage: number }
) {
  const now = new Date();
  const where: Record<string, unknown> = { hostUserId: userId };

  // Period filter
  if (filters.period === "upcoming") {
    where.startAt = { gt: now };
  } else if (filters.period === "past") {
    where.endAt = { lt: now };
  }

  // Status filter
  if (filters.status) {
    where.status = filters.status;
  }

  // Event type filter
  if (filters.eventTypeId) {
    where.eventTypeId = filters.eventTypeId;
  }

  // Sort: upcoming → ASC, past → DESC, all → DESC
  const orderBy = filters.period === "upcoming"
    ? { startAt: "asc" as const }
    : { startAt: "desc" as const };

  const [meetings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        eventType: { select: { id: true, title: true, slug: true } },
        attendees: { where: { isHost: false } },
      },
      orderBy,
      skip: (pagination.page - 1) * pagination.perPage,
      take: pagination.perPage,
    }),
    prisma.booking.count({ where }),
  ]);

  return { meetings, total };
}

// ─── Get meeting detail ─────────────────────────────────────────────

export async function getMeeting(userId: string, bookingId: string) {
  const meeting = await prisma.booking.findFirst({
    where: { id: bookingId, hostUserId: userId },
    include: {
      eventType: { select: { id: true, title: true } },
      host: { select: { name: true, email: true } },
      attendees: { where: { isHost: false } },
      bookingAnswers: {
        include: { question: { select: { label: true } } },
      },
    },
  });

  if (!meeting) throw new AppError(404, "NOT_FOUND", "Meeting not found");
  return meeting;
}

// ─── Cancel meeting (host-initiated) ────────────────────────────────

export async function cancelMeeting(userId: string, bookingId: string, reason?: string) {
  const meeting = await prisma.booking.findFirst({
    where: { id: bookingId, hostUserId: userId },
  });
  if (!meeting) throw new AppError(404, "NOT_FOUND", "Meeting not found");

  assertTransition(meeting.status, "cancelled");

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "cancelled",
      cancelReason: reason ?? null,
    },
  });

  // Enqueue cancellation notifications
  const now = DateTime.utc().toISO();
  await prisma.$executeRawUnsafe(
    `INSERT INTO notifications (booking_id, recipient_email, type, scheduled_at)
     SELECT $1, a.email, 'cancellation', $2
     FROM attendees a WHERE a.booking_id = $1`,
    bookingId,
    now
  );

  return updated;
}
