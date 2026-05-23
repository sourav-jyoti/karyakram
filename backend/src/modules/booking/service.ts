import { DateTime } from "luxon";
import { prisma } from "../../lib/prisma.js";
import { pool } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { expandRuleToUtc, getDayOfWeek, nowUtc, parseTimeColumn } from "../../utils/time.js";
import { generateToken } from "../../utils/tokens.js";
import { hashToInt } from "../../utils/hashToInt.js";
import { SLOT_STEP_MINUTES, assertTransition } from "../../utils/constants.js";
import type { InviteeInput, AnswerInput } from "./types.js";

// ─── Public event type info ─────────────────────────────────────────

export async function getPublicEventType(userSlug: string, eventSlug: string) {
  const user = await prisma.user.findUnique({ where: { slug: userSlug } });
  if (!user) throw new AppError(404, "NOT_FOUND", "User not found");

  const eventType = await prisma.eventType.findFirst({
    where: { userId: user.id, slug: eventSlug, isActive: true },
    include: {
      schedule: true,
      customQuestions: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!eventType) throw new AppError(404, "NOT_FOUND", "Event type not found");

  return { user, eventType };
}

// ─── Available dates (month view) ───────────────────────────────────

export async function getAvailableDates(
  userSlug: string,
  eventSlug: string,
  year: number,
  month: number,
  inviteeTz: string
) {
  const { user, eventType } = await getPublicEventType(userSlug, eventSlug);
  const schedule = eventType.schedule;
  const hostTz = schedule.timezone;

  // Build all days in the requested month (in host timezone)
  const monthStart = DateTime.fromObject({ year, month, day: 1 }, { zone: hostTz });
  const daysInMonth = monthStart.daysInMonth!;

  // Load rules for this schedule
  const rules = await prisma.availabilityRule.findMany({
    where: { scheduleId: schedule.id },
  });
  const rulesByDay = new Map<number, boolean>();
  for (const r of rules) {
    rulesByDay.set(r.dayOfWeek, true);
  }

  // Load overrides for this month
  const monthEnd = monthStart.plus({ months: 1 }).minus({ days: 1 });
  const overrides = await prisma.dateOverride.findMany({
    where: {
      scheduleId: schedule.id,
      overrideDate: {
        gte: monthStart.toJSDate(),
        lte: monthEnd.toJSDate(),
      },
    },
  });
  const overrideMap = new Map<string, { isUnavailable: boolean }>();
  for (const o of overrides) {
    const dateStr = DateTime.fromJSDate(o.overrideDate, { zone: "utc" }).toISODate()!;
    overrideMap.set(dateStr, { isUnavailable: o.isUnavailable });
  }

  // Determine candidate days
  const candidateDates: string[] = [];
  const now = nowUtc();

  for (let d = 1; d <= daysInMonth; d++) {
    const dt = DateTime.fromObject({ year, month, day: d }, { zone: hostTz });
    const dateStr = dt.toISODate()!;

    // Skip days in the past
    if (dt.endOf("day").toUTC() < now) continue;

    const override = overrideMap.get(dateStr);
    if (override) {
      if (override.isUnavailable) continue; // Blocked day
      candidateDates.push(dateStr);          // Custom hours — mark available
      continue;
    }

    // Check if there's a recurring rule for this day
    const dow = getDayOfWeek(dateStr, hostTz);
    if (rulesByDay.has(dow)) {
      candidateDates.push(dateStr);
    }
  }

  // Batch-check booking counts for candidate days
  if (candidateDates.length === 0) return [];

  // For simplicity, return all candidate dates.
  // A more sophisticated version would subtract fully-booked days.
  // The /slots endpoint does the exact calculation.
  return candidateDates;
}

// ─── Slot calculation ───────────────────────────────────────────────

export async function getAvailableSlots(
  userSlug: string,
  eventSlug: string,
  date: string,
  inviteeTz?: string
) {
  const { user, eventType } = await getPublicEventType(userSlug, eventSlug);
  const schedule = eventType.schedule;
  const hostTz = schedule.timezone;

  // Step 1: Determine working window
  const override = await prisma.dateOverride.findFirst({
    where: {
      scheduleId: schedule.id,
      overrideDate: new Date(date),
    },
  });

  let startTime: string;
  let endTime: string;

  if (override) {
    if (override.isUnavailable) return [];
    startTime = parseTimeColumn(override.startTime);
    endTime = parseTimeColumn(override.endTime);
  } else {
    const dow = getDayOfWeek(date, hostTz);
    const rule = await prisma.availabilityRule.findFirst({
      where: { scheduleId: schedule.id, dayOfWeek: dow },
    });
    if (!rule) return [];
    startTime = parseTimeColumn(rule.startTime);
    endTime = parseTimeColumn(rule.endTime);
  }

  // Step 2: Expand to UTC
  const window = expandRuleToUtc(date, startTime, endTime, hostTz);
  if (!window) return []; // DST gap

  // Step 3: Fetch conflicting bookings
  const bookings = await prisma.booking.findMany({
    where: {
      hostUserId: user.id,
      status: "confirmed",
      startAt: { lt: window.endUtc.toJSDate() },
      endAt: { gt: window.startUtc.toJSDate() },
    },
    select: { startAt: true, endAt: true },
  });

  // Step 4: Build busy intervals (with buffers)
  const busyIntervals = bookings.map((b) => ({
    busyStart: DateTime.fromJSDate(b.startAt).minus({ minutes: eventType.bufferBeforeMin }),
    busyEnd: DateTime.fromJSDate(b.endAt).plus({ minutes: eventType.bufferAfterMin }),
  }));

  // Step 5: Slide window to generate candidate slots
  const durationMin = eventType.durationMinutes;
  const slotStep = Math.min(SLOT_STEP_MINUTES, durationMin);
  const now = nowUtc();
  const slots: Array<{ start_at: string; end_at: string }> = [];

  let cursor = window.startUtc;
  while (cursor.plus({ minutes: durationMin }) <= window.endUtc) {
    const slotEnd = cursor.plus({ minutes: durationMin });

    // Check not in the past
    if (cursor > now) {
      // Check against busy intervals
      const isFree = busyIntervals.every(
        (b) => slotEnd <= b.busyStart || cursor >= b.busyEnd
      );

      if (isFree) {
        slots.push({
          start_at: cursor.toISO()!,
          end_at: slotEnd.toISO()!,
        });
      }
    }

    cursor = cursor.plus({ minutes: slotStep });
  }

  return slots;
}

// ─── Create booking ─────────────────────────────────────────────────

export async function createBooking(
  userSlug: string,
  eventSlug: string,
  startAtIso: string,
  invitee: InviteeInput,
  answers?: AnswerInput[]
) {
  const { user, eventType } = await getPublicEventType(userSlug, eventSlug);

  const startAt = DateTime.fromISO(startAtIso, { zone: "utc" });
  if (!startAt.isValid) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid start_at datetime");
  }

  const endAt = startAt.plus({ minutes: eventType.durationMinutes });

  // Validate: not in the past
  if (startAt <= nowUtc()) {
    throw new AppError(422, "OUTSIDE_BOOKING_WINDOW", "Cannot book a slot in the past");
  }

  // Validate required custom questions
  if (eventType.customQuestions.length > 0) {
    const requiredIds = eventType.customQuestions
      .filter((q) => q.required)
      .map((q) => q.id);

    const providedIds = new Set((answers ?? []).map((a) => a.question_id));

    for (const reqId of requiredIds) {
      if (!providedIds.has(reqId)) {
        throw new AppError(422, "VALIDATION_ERROR", "All required questions must be answered");
      }
    }
  }

  // Use advisory lock via raw pg pool for double-booking prevention
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Advisory lock keyed on host user ID
    const lockKey = hashToInt(user.id);
    await client.query("SELECT pg_advisory_xact_lock($1)", [lockKey]);

    // Re-check availability inside the lock
    const conflict = await client.query(
      `SELECT 1 FROM bookings
       WHERE host_user_id = $1
         AND status = 'confirmed'
         AND start_at < $3
         AND end_at   > $2
       LIMIT 1`,
      [user.id, startAt.toJSDate(), endAt.toJSDate()]
    );

    if (conflict.rows.length > 0) {
      await client.query("ROLLBACK");
      throw new AppError(409, "SLOT_TAKEN", "This slot was just booked. Please choose another time.");
    }

    // Generate tokens
    const cancelToken = generateToken();
    const rescheduleToken = generateToken();

    // Insert booking
    const bookingResult = await client.query(
      `INSERT INTO bookings (event_type_id, host_user_id, start_at, end_at, status, cancel_token, reschedule_token)
       VALUES ($1, $2, $3, $4, 'confirmed', $5, $6)
       RETURNING id, status, start_at, end_at, cancel_token, reschedule_token`,
      [eventType.id, user.id, startAt.toJSDate(), endAt.toJSDate(), cancelToken, rescheduleToken]
    );
    const booking = bookingResult.rows[0]!;

    // Insert host as attendee
    await client.query(
      `INSERT INTO attendees (booking_id, name, email, timezone, is_host)
       VALUES ($1, $2, $3, $4, true)`,
      [booking.id, user.name, user.email, user.timezone]
    );

    // Insert invitee as attendee
    await client.query(
      `INSERT INTO attendees (booking_id, name, email, timezone, is_host)
       VALUES ($1, $2, $3, $4, false)`,
      [booking.id, invitee.name, invitee.email, invitee.timezone]
    );

    // Insert answers
    if (answers?.length) {
      for (const ans of answers) {
        await client.query(
          `INSERT INTO booking_answers (booking_id, question_id, answer)
           VALUES ($1, $2, $3)`,
          [booking.id, ans.question_id, ans.answer]
        );
      }
    }

    // Enqueue notifications
    await enqueueNotifications(client, booking);

    await client.query("COMMIT");

    return {
      id: booking.id,
      status: booking.status,
      start_at: booking.start_at,
      end_at: booking.end_at,
      event_type: { title: eventType.title },
      host: { name: user.name },
      invitee: { name: invitee.name, email: invitee.email },
      cancel_token: booking.cancel_token,
      reschedule_token: booking.reschedule_token,
    };
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

// ─── Cancel by token (invitee) ──────────────────────────────────────

export async function cancelByToken(cancelToken: string, reason?: string) {
  const booking = await prisma.booking.findUnique({
    where: { cancelToken },
  });
  if (!booking) throw new AppError(404, "NOT_FOUND", "Booking not found");

  assertTransition(booking.status, "cancelled");

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: "cancelled",
      cancelReason: reason ?? null,
    },
  });

  // Enqueue cancellation notifications
  await enqueueCancellationNotifications(booking.id);

  return { id: updated.id, status: updated.status };
}

// ─── Reschedule by token (invitee) ──────────────────────────────────

export async function rescheduleByToken(rescheduleToken: string, newStartAtIso: string) {
  const booking = await prisma.booking.findUnique({
    where: { rescheduleToken },
    include: {
      eventType: { include: { schedule: true } },
      host: true,
      attendees: { where: { isHost: false } },
    },
  });
  if (!booking) throw new AppError(404, "NOT_FOUND", "Booking not found");

  assertTransition(booking.status, "rescheduled");

  const newStartAt = DateTime.fromISO(newStartAtIso, { zone: "utc" });
  if (!newStartAt.isValid) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid new_start_at datetime");
  }
  if (newStartAt <= nowUtc()) {
    throw new AppError(422, "OUTSIDE_BOOKING_WINDOW", "Cannot reschedule to a past time");
  }

  const newEndAt = newStartAt.plus({ minutes: booking.eventType.durationMinutes });
  const invitee = booking.attendees[0];

  // Use advisory lock for the new booking
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const lockKey = hashToInt(booking.hostUserId);
    await client.query("SELECT pg_advisory_xact_lock($1)", [lockKey]);

    // Check slot availability
    const conflict = await client.query(
      `SELECT 1 FROM bookings
       WHERE host_user_id = $1
         AND status = 'confirmed'
         AND start_at < $3
         AND end_at   > $2
         AND id != $4
       LIMIT 1`,
      [booking.hostUserId, newStartAt.toJSDate(), newEndAt.toJSDate(), booking.id]
    );

    if (conflict.rows.length > 0) {
      await client.query("ROLLBACK");
      throw new AppError(409, "SLOT_TAKEN", "The new slot is not available");
    }

    // Mark original as rescheduled
    await client.query(
      `UPDATE bookings SET status = 'rescheduled' WHERE id = $1`,
      [booking.id]
    );

    // Create new confirmed booking
    const cancelToken = generateToken();
    const newRescheduleToken = generateToken();

    const newBookingResult = await client.query(
      `INSERT INTO bookings (event_type_id, host_user_id, start_at, end_at, status, cancel_token, reschedule_token)
       VALUES ($1, $2, $3, $4, 'confirmed', $5, $6)
       RETURNING id, status, start_at, end_at`,
      [booking.eventTypeId, booking.hostUserId, newStartAt.toJSDate(), newEndAt.toJSDate(), cancelToken, newRescheduleToken]
    );
    const newBooking = newBookingResult.rows[0]!;

    // Copy attendees to new booking
    await client.query(
      `INSERT INTO attendees (booking_id, name, email, timezone, is_host)
       VALUES ($1, $2, $3, $4, true)`,
      [newBooking.id, booking.host.name, booking.host.email, booking.host.timezone]
    );

    if (invitee) {
      await client.query(
        `INSERT INTO attendees (booking_id, name, email, timezone, is_host)
         VALUES ($1, $2, $3, $4, false)`,
        [newBooking.id, invitee.name, invitee.email, invitee.timezone]
      );
    }

    // Enqueue reschedule notifications for the new booking
    await enqueueNotifications(client, newBooking);

    await client.query("COMMIT");

    return {
      id: newBooking.id,
      status: newBooking.status,
      start_at: newBooking.start_at,
      end_at: newBooking.end_at,
    };
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

// ═══════════════════════════════════════════════════════════════════
//  Notification helpers (used inside transactions)
// ═══════════════════════════════════════════════════════════════════

async function enqueueNotifications(client: any, booking: any) {
  const now = DateTime.utc().toISO();
  const startAt = DateTime.fromJSDate(new Date(booking.start_at));

  // Confirmation — send immediately
  await client.query(
    `INSERT INTO notifications (booking_id, recipient_email, type, scheduled_at)
     SELECT $1, a.email, 'confirmation', $2
     FROM attendees a WHERE a.booking_id = $1`,
    [booking.id, now]
  );

  // 24h reminder
  const remind24h = startAt.minus({ hours: 24 }).toISO();
  await client.query(
    `INSERT INTO notifications (booking_id, recipient_email, type, scheduled_at)
     SELECT $1, a.email, 'reminder_24h', $2
     FROM attendees a WHERE a.booking_id = $1`,
    [booking.id, remind24h]
  );

  // 1h reminder
  const remind1h = startAt.minus({ hours: 1 }).toISO();
  await client.query(
    `INSERT INTO notifications (booking_id, recipient_email, type, scheduled_at)
     SELECT $1, a.email, 'reminder_1h', $2
     FROM attendees a WHERE a.booking_id = $1`,
    [booking.id, remind1h]
  );
}

async function enqueueCancellationNotifications(bookingId: string) {
  const now = DateTime.utc().toISO();

  await prisma.$executeRawUnsafe(
    `INSERT INTO notifications (booking_id, recipient_email, type, scheduled_at)
     SELECT $1, a.email, 'cancellation', $2
     FROM attendees a WHERE a.booking_id = $1`,
    bookingId,
    now
  );
}
