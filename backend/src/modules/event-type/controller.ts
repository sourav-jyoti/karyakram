import { Request, Response } from "express";
import * as eventTypeService from "./service.js";
import type { CreateEventTypeBody, UpdateEventTypeBody } from "./types.js";
import { AppError } from "../../utils/AppError.js";

// ─── List ───────────────────────────────────────────────────────────

export async function list(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { is_active, type } = req.query;

  const filters: { isActive?: boolean; type?: string } = {};
  if (is_active !== undefined) filters.isActive = is_active === "true";
  if (typeof type === "string") filters.type = type;

  const eventTypes = await eventTypeService.listEventTypes(userId, filters);

  res.json({
    event_types: eventTypes.map((et) => formatEventType(et)),
  });
}

// ─── Get ────────────────────────────────────────────────────────────

export async function get(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const eventTypeId = String(req.params.eventTypeId);
  const et = await eventTypeService.getEventType(userId, eventTypeId);
  res.json({ event_type: formatEventType(et) });
}

// ─── Create ─────────────────────────────────────────────────────────

export async function create(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const body = req.body as CreateEventTypeBody;

  if (!body.title || !body.slug || !body.duration_minutes || !body.schedule_id) {
    throw new AppError(400, "VALIDATION_ERROR", "title, slug, duration_minutes, and schedule_id are required");
  }

  const et = await eventTypeService.createEventType(userId, body);
  res.status(201).json({ event_type: formatEventType(et) });
}

// ─── Update ─────────────────────────────────────────────────────────

export async function update(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const body = req.body as UpdateEventTypeBody;
  const eventTypeId = String(req.params.eventTypeId);
  const et = await eventTypeService.updateEventType(userId, eventTypeId, body);
  res.json({ event_type: formatEventType(et) });
}

// ─── Delete ─────────────────────────────────────────────────────────

export async function remove(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const eventTypeId = String(req.params.eventTypeId);
  await eventTypeService.deleteEventType(userId, eventTypeId);
  res.json({ message: "Event type deleted" });
}

// ─── Response formatter ─────────────────────────────────────────────

function formatEventType(et: any) {
  const result: Record<string, unknown> = {
    id: et.id,
    title: et.title,
    slug: et.slug,
    duration_minutes: et.durationMinutes,
    type: et.type,
    max_invitees: et.maxInvitees,
    buffer_before_min: et.bufferBeforeMin,
    buffer_after_min: et.bufferAfterMin,
    is_active: et.isActive,
    booking_url: `/${et.user?.slug ?? ""}/${et.slug}`,
  };

  if (et.schedule) {
    result.schedule = { id: et.schedule.id, name: et.schedule.name };
  }

  if (et.customQuestions) {
    result.custom_questions = et.customQuestions.map((q: any) => ({
      id: q.id,
      label: q.label,
      field_type: q.fieldType,
      required: q.required,
      sort_order: q.sortOrder,
    }));
  }

  return result;
}
