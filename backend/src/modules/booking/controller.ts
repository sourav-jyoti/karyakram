import { Request, Response } from "express";
import * as bookingService from "./service.js";
import type { BookingBody } from "./types.js";
import { AppError } from "../../utils/AppError.js";

// ─── GET /public/:userSlug/:eventSlug ───────────────────────────────

export async function getPublicEventType(req: Request, res: Response): Promise<void> {
  const userSlug = String(req.params.userSlug);
  const eventSlug = String(req.params.eventSlug);
  const { user, eventType } = await bookingService.getPublicEventType(userSlug, eventSlug);

  res.json({
    event_type: {
      id: eventType.id,
      title: eventType.title,
      duration_minutes: eventType.durationMinutes,
      type: eventType.type,
      host: {
        name: user.name,
        timezone: user.timezone,
      },
      custom_questions: eventType.customQuestions.map((q) => ({
        id: q.id,
        label: q.label,
        field_type: q.fieldType,
        required: q.required,
        sort_order: q.sortOrder,
      })),
    },
  });
}

// ─── GET /public/:userSlug/:eventSlug/available-dates ───────────────

export async function getAvailableDates(req: Request, res: Response): Promise<void> {
  const userSlug = String(req.params.userSlug);
  const eventSlug = String(req.params.eventSlug);
  const { year, month, timezone } = req.query;

  if (!year || !month || !timezone) {
    throw new AppError(400, "VALIDATION_ERROR", "year, month, and timezone are required");
  }

  const dates = await bookingService.getAvailableDates(
    userSlug,
    eventSlug,
    parseInt(year as string, 10),
    parseInt(month as string, 10),
    timezone as string
  );

  res.json({ available_dates: dates });
}

// ─── GET /public/:userSlug/:eventSlug/slots ─────────────────────────

export async function getSlots(req: Request, res: Response): Promise<void> {
  const userSlug = String(req.params.userSlug);
  const eventSlug = String(req.params.eventSlug);
  const { date, timezone } = req.query;

  if (!date) {
    throw new AppError(400, "VALIDATION_ERROR", "date is required");
  }

  const slots = await bookingService.getAvailableSlots(
    userSlug,
    eventSlug,
    date as string,
    timezone as string | undefined
  );

  res.json({ date, slots });
}

// ─── POST /public/:userSlug/:eventSlug/book ─────────────────────────

export async function book(req: Request, res: Response): Promise<void> {
  const userSlug = String(req.params.userSlug);
  const eventSlug = String(req.params.eventSlug);
  const body = req.body as BookingBody;

  if (!body.start_at || !body.invitee?.name || !body.invitee?.email || !body.invitee?.timezone) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "start_at, invitee.name, invitee.email, and invitee.timezone are required"
    );
  }

  const booking = await bookingService.createBooking(
    userSlug,
    eventSlug,
    body.start_at,
    body.invitee,
    body.answers
  );

  res.status(201).json({ booking });
}

// ─── POST /public/cancel/:cancelToken ───────────────────────────────

export async function cancelByToken(req: Request, res: Response): Promise<void> {
  const cancelToken = String(req.params.cancelToken);
  const { reason } = req.body as { reason?: string };

  const booking = await bookingService.cancelByToken(cancelToken, reason);
  res.json({ booking });
}

// ─── POST /public/reschedule/:rescheduleToken ───────────────────────

export async function rescheduleByToken(req: Request, res: Response): Promise<void> {
  const rescheduleToken = String(req.params.rescheduleToken);
  const { new_start_at } = req.body as { new_start_at: string };

  if (!new_start_at) {
    throw new AppError(400, "VALIDATION_ERROR", "new_start_at is required");
  }

  const booking = await bookingService.rescheduleByToken(rescheduleToken, new_start_at);
  res.json({ booking });
}
