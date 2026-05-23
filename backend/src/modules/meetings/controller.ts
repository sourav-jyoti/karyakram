import { Request, Response } from "express";
import * as meetingsService from "./service.js";

// ─── List meetings ──────────────────────────────────────────────────

export async function list(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { period, status, event_type_id, page, per_page } = req.query;

  const pageNum = parseInt(page as string, 10) || 1;
  const perPage = parseInt(per_page as string, 10) || 20;

  const { meetings, total } = await meetingsService.listMeetings(
    userId,
    {
      period: typeof period === "string" ? period : undefined,
      status: typeof status === "string" ? status : undefined,
      eventTypeId: typeof event_type_id === "string" ? event_type_id : undefined,
    },
    { page: pageNum, perPage }
  );

  res.json({
    meetings: meetings.map((m) => ({
      id: m.id,
      status: m.status,
      start_at: m.startAt,
      end_at: m.endAt,
      created_at: m.createdAt,
      event_type: {
        id: m.eventType.id,
        title: m.eventType.title,
        slug: m.eventType.slug,
      },
      host: m.host,
      invitees: m.attendees.map((a) => ({
        name: a.name,
        email: a.email,
        timezone: a.timezone,
      })),
      answers: m.bookingAnswers.map((ba) => ({
        question: ba.question.label,
        answer: ba.answer,
      })),
    })),
    pagination: {
      page: pageNum,
      per_page: perPage,
      total,
    },
  });
}

// ─── Get meeting detail ─────────────────────────────────────────────

export async function get(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const bookingId = String(req.params.bookingId);
  const meeting = await meetingsService.getMeeting(userId, bookingId);

  res.json({
    meeting: {
      id: meeting.id,
      status: meeting.status,
      start_at: meeting.startAt,
      end_at: meeting.endAt,
      cancel_reason: meeting.cancelReason,
      event_type: meeting.eventType,
      host: meeting.host,
      invitees: meeting.attendees.map((a) => ({
        name: a.name,
        email: a.email,
        timezone: a.timezone,
      })),
      answers: meeting.bookingAnswers.map((ba) => ({
        question: ba.question.label,
        answer: ba.answer,
      })),
    },
  });
}

// ─── Cancel meeting (host) ──────────────────────────────────────────

export async function cancel(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { reason } = req.body as { reason?: string };
  const bookingId = String(req.params.bookingId);

  const booking = await meetingsService.cancelMeeting(userId, bookingId, reason);

  res.json({
    booking: {
      id: booking.id,
      status: booking.status,
      cancel_reason: booking.cancelReason,
    },
  });
}
