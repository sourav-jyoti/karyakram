import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { SLUG_REGEX } from "../../utils/constants.js";
import type { CreateEventTypeBody, UpdateEventTypeBody } from "./types.js";

// ─── Shared include for schedule + questions ────────────────────────
const eventTypeInclude = {
  schedule: { select: { id: true, name: true, timezone: true } },
  customQuestions: { orderBy: { sortOrder: "asc" as const } },
};

// ─── List ───────────────────────────────────────────────────────────

export async function listEventTypes(
  userId: string,
  filters: { isActive?: boolean; type?: string }
) {
  return prisma.eventType.findMany({
    where: {
      userId,
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
      ...(filters.type !== undefined && { type: filters.type as any }),
    },
    include: { schedule: { select: { id: true, name: true } } },
    orderBy: { title: "asc" },
  });
}

// ─── Get by ID ──────────────────────────────────────────────────────

export async function getEventType(userId: string, eventTypeId: string) {
  const et = await prisma.eventType.findFirst({
    where: { id: eventTypeId, userId },
    include: eventTypeInclude,
  });

  if (!et) throw new AppError(404, "NOT_FOUND", "Event type not found");
  return et;
}

// ─── Create ─────────────────────────────────────────────────────────

export async function createEventType(userId: string, data: CreateEventTypeBody) {
  // Validate slug format
  if (!SLUG_REGEX.test(data.slug)) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Slug must contain only lowercase letters, numbers, and hyphens"
    );
  }

  // Validate duration
  if (!data.duration_minutes || data.duration_minutes <= 0) {
    throw new AppError(400, "VALIDATION_ERROR", "duration_minutes must be a positive integer");
  }

  // Check slug uniqueness for this user
  const existing = await prisma.eventType.findFirst({
    where: { userId, slug: data.slug },
  });
  if (existing) {
    throw new AppError(409, "SLUG_TAKEN", `Slug '${data.slug}' is already in use`);
  }

  // Transactional create: event type + custom questions
  return prisma.$transaction(async (tx) => {
    const eventType = await tx.eventType.create({
      data: {
        userId,
        scheduleId: data.schedule_id,
        title: data.title,
        slug: data.slug,
        durationMinutes: data.duration_minutes,
        type: (data.type as any) ?? "one_to_one",
        maxInvitees: data.max_invitees ?? 1,
        bufferBeforeMin: data.buffer_before_min ?? 0,
        bufferAfterMin: data.buffer_after_min ?? 0,
        isActive: data.is_active ?? true,
        ...(data.custom_questions?.length && {
          customQuestions: {
            create: data.custom_questions.map((q) => ({
              label: q.label,
              fieldType: q.field_type ?? "text",
              required: q.required ?? false,
              sortOrder: q.sort_order ?? 0,
            })),
          },
        }),
      },
      include: eventTypeInclude,
    });

    return eventType;
  });
}

// ─── Update (PATCH) ─────────────────────────────────────────────────

export async function updateEventType(
  userId: string,
  eventTypeId: string,
  data: UpdateEventTypeBody
) {
  // Ensure the event type exists and belongs to the user
  const existing = await prisma.eventType.findFirst({
    where: { id: eventTypeId, userId },
  });
  if (!existing) throw new AppError(404, "NOT_FOUND", "Event type not found");

  // Validate slug if changing it
  if (data.slug !== undefined) {
    if (!SLUG_REGEX.test(data.slug)) {
      throw new AppError(
        400,
        "VALIDATION_ERROR",
        "Slug must contain only lowercase letters, numbers, and hyphens"
      );
    }
    if (data.slug !== existing.slug) {
      const conflict = await prisma.eventType.findFirst({
        where: { userId, slug: data.slug },
      });
      if (conflict) {
        throw new AppError(409, "SLUG_TAKEN", `Slug '${data.slug}' is already in use`);
      }
    }
  }

  // Build dynamic update payload — only include fields that were sent
  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.duration_minutes !== undefined) updateData.durationMinutes = data.duration_minutes;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.schedule_id !== undefined) updateData.scheduleId = data.schedule_id;
  if (data.buffer_before_min !== undefined) updateData.bufferBeforeMin = data.buffer_before_min;
  if (data.buffer_after_min !== undefined) updateData.bufferAfterMin = data.buffer_after_min;
  if (data.is_active !== undefined) updateData.isActive = data.is_active;
  if (data.max_invitees !== undefined) updateData.maxInvitees = data.max_invitees;

  // If custom_questions included, replace-all in a transaction
  if (data.custom_questions !== undefined) {
    return prisma.$transaction(async (tx) => {
      await tx.customQuestion.deleteMany({ where: { eventTypeId } });

      return tx.eventType.update({
        where: { id: eventTypeId },
        data: {
          ...updateData,
          customQuestions: {
            create: data.custom_questions!.map((q) => ({
              label: q.label,
              fieldType: q.field_type ?? "text",
              required: q.required ?? false,
              sortOrder: q.sort_order ?? 0,
            })),
          },
        },
        include: eventTypeInclude,
      });
    });
  }

  return prisma.eventType.update({
    where: { id: eventTypeId },
    data: updateData,
    include: eventTypeInclude,
  });
}

// ─── Delete ─────────────────────────────────────────────────────────

export async function deleteEventType(userId: string, eventTypeId: string) {
  const existing = await prisma.eventType.findFirst({
    where: { id: eventTypeId, userId },
  });
  if (!existing) throw new AppError(404, "NOT_FOUND", "Event type not found");

  // Guard: check for upcoming confirmed bookings
  const hasBookings = await prisma.booking.findFirst({
    where: {
      eventTypeId,
      status: "confirmed",
      startAt: { gt: new Date() },
    },
  });

  if (hasBookings) {
    throw new AppError(
      409,
      "EVENT_TYPE_HAS_BOOKINGS",
      "Cannot delete event type with upcoming confirmed bookings"
    );
  }

  await prisma.eventType.delete({ where: { id: eventTypeId } });
}
