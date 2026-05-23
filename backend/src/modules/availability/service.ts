import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { isValidTimezone } from "../../utils/time.js";
import type { CreateScheduleBody, UpdateScheduleBody, CreateOverrideBody } from "./types.js";

// ═══════════════════════════════════════════════════════════════════
//  Schedules
// ═══════════════════════════════════════════════════════════════════

export async function listSchedules(userId: string) {
  return prisma.schedule.findMany({
    where: { userId },
    include: {
      availabilityRules: { orderBy: { dayOfWeek: "asc" } },
    },
  });
}

export async function createSchedule(userId: string, data: CreateScheduleBody) {
  if (!isValidTimezone(data.timezone)) {
    throw new AppError(400, "VALIDATION_ERROR", `Invalid timezone: ${data.timezone}`);
  }

  // Validate rules if provided
  if (data.rules) {
    validateRules(data.rules);
  }

  return prisma.schedule.create({
    data: {
      userId,
      name: data.name,
      timezone: data.timezone,
      ...(data.rules?.length && {
        availabilityRules: {
          create: data.rules.map((r) => ({
            dayOfWeek: r.day_of_week,
            startTime: timeToDate(r.start_time),
            endTime: timeToDate(r.end_time),
          })),
        },
      }),
    },
    include: {
      availabilityRules: { orderBy: { dayOfWeek: "asc" } },
    },
  });
}

export async function updateSchedule(
  userId: string,
  scheduleId: string,
  data: UpdateScheduleBody
) {
  const existing = await prisma.schedule.findFirst({
    where: { id: scheduleId, userId },
  });
  if (!existing) throw new AppError(404, "NOT_FOUND", "Schedule not found");

  if (data.timezone !== undefined && !isValidTimezone(data.timezone)) {
    throw new AppError(400, "VALIDATION_ERROR", `Invalid timezone: ${data.timezone}`);
  }

  // If rules are provided, replace all in a transaction
  if (data.rules !== undefined) {
    validateRules(data.rules);

    return prisma.$transaction(async (tx) => {
      await tx.availabilityRule.deleteMany({ where: { scheduleId } });

      return tx.schedule.update({
        where: { id: scheduleId },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.timezone !== undefined && { timezone: data.timezone }),
          availabilityRules: {
            create: data.rules!.map((r) => ({
              dayOfWeek: r.day_of_week,
              startTime: timeToDate(r.start_time),
              endTime: timeToDate(r.end_time),
            })),
          },
        },
        include: {
          availabilityRules: { orderBy: { dayOfWeek: "asc" } },
        },
      });
    });
  }

  // Simple update without rules
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.timezone !== undefined) updateData.timezone = data.timezone;

  return prisma.schedule.update({
    where: { id: scheduleId },
    data: updateData,
    include: {
      availabilityRules: { orderBy: { dayOfWeek: "asc" } },
    },
  });
}

export async function deleteSchedule(userId: string, scheduleId: string) {
  const existing = await prisma.schedule.findFirst({
    where: { id: scheduleId, userId },
  });
  if (!existing) throw new AppError(404, "NOT_FOUND", "Schedule not found");

  // Guard: check if any event type references this schedule
  const inUse = await prisma.eventType.findFirst({
    where: { scheduleId },
  });
  if (inUse) {
    throw new AppError(
      409,
      "SCHEDULE_IN_USE",
      "Cannot delete schedule — event type references it"
    );
  }

  await prisma.schedule.delete({ where: { id: scheduleId } });
}

// ═══════════════════════════════════════════════════════════════════
//  Date Overrides
// ═══════════════════════════════════════════════════════════════════

export async function listOverrides(
  scheduleId: string,
  from?: string,
  to?: string
) {
  const where: Record<string, unknown> = { scheduleId };

  if (from || to) {
    const dateFilter: Record<string, Date> = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);
    where.overrideDate = dateFilter;
  }

  return prisma.dateOverride.findMany({
    where,
    orderBy: { overrideDate: "asc" },
  });
}

export async function createOverride(scheduleId: string, data: CreateOverrideBody) {
  // Validate override mode
  if (data.is_unavailable) {
    // Block entire day — times should be null
    if (data.start_time || data.end_time) {
      throw new AppError(
        400,
        "VALIDATION_ERROR",
        "start_time and end_time must not be provided when is_unavailable is true"
      );
    }
  } else {
    // Custom hours — times required
    if (!data.start_time || !data.end_time) {
      throw new AppError(
        400,
        "VALIDATION_ERROR",
        "start_time and end_time are required when is_unavailable is false"
      );
    }
    if (data.start_time >= data.end_time) {
      throw new AppError(400, "VALIDATION_ERROR", "start_time must be before end_time");
    }
  }

  // Check uniqueness: one override per date per schedule
  const existing = await prisma.dateOverride.findFirst({
    where: {
      scheduleId,
      overrideDate: new Date(data.override_date),
    },
  });
  if (existing) {
    throw new AppError(
      409,
      "OVERRIDE_EXISTS",
      "Date override already exists for this date and schedule"
    );
  }

  return prisma.dateOverride.create({
    data: {
      scheduleId,
      overrideDate: new Date(data.override_date),
      isUnavailable: data.is_unavailable,
      startTime: data.start_time ? timeToDate(data.start_time) : null,
      endTime: data.end_time ? timeToDate(data.end_time) : null,
    },
  });
}

export async function deleteOverride(scheduleId: string, overrideId: string) {
  const existing = await prisma.dateOverride.findFirst({
    where: { id: overrideId, scheduleId },
  });
  if (!existing) throw new AppError(404, "NOT_FOUND", "Override not found");

  await prisma.dateOverride.delete({ where: { id: overrideId } });
}

// ═══════════════════════════════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════════════════════════════

/**
 * Convert a "HH:mm" string to a Date for Prisma's @db.Time columns.
 * Prisma stores TIME as a Date anchored to 1970-01-01.
 */
function timeToDate(time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const d = new Date(0); // 1970-01-01T00:00:00Z
  d.setUTCHours(hours!, minutes!, 0, 0);
  return d;
}

function validateRules(rules: Array<{ day_of_week: number; start_time: string; end_time: string }>) {
  for (const rule of rules) {
    if (rule.day_of_week < 0 || rule.day_of_week > 6) {
      throw new AppError(400, "VALIDATION_ERROR", "day_of_week must be 0–6");
    }
    if (rule.start_time >= rule.end_time) {
      throw new AppError(400, "VALIDATION_ERROR", "start_time must be before end_time");
    }
  }
}
