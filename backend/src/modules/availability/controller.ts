import { Request, Response } from "express";
import * as availabilityService from "./service.js";
import type { CreateScheduleBody, UpdateScheduleBody, CreateOverrideBody } from "./types.js";
import { AppError } from "../../utils/AppError.js";
import { parseTimeColumn, parseDateColumn } from "../../utils/time.js";

// ═══════════════════════════════════════════════════════════════════
//  Schedules
// ═══════════════════════════════════════════════════════════════════

export async function listSchedules(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const schedules = await availabilityService.listSchedules(userId);
  res.json({
    schedules: schedules.map((s) => formatSchedule(s)),
  });
}

export async function createSchedule(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const body = req.body as CreateScheduleBody;

  if (!body.name || !body.timezone) {
    throw new AppError(400, "VALIDATION_ERROR", "name and timezone are required");
  }

  const schedule = await availabilityService.createSchedule(userId, body);
  res.status(201).json({ schedule: formatSchedule(schedule) });
}

export async function updateSchedule(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const body = req.body as UpdateScheduleBody;
  const scheduleId = String(req.params.scheduleId);
  const schedule = await availabilityService.updateSchedule(userId, scheduleId, body);
  res.json({ schedule: formatSchedule(schedule) });
}

export async function deleteSchedule(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const scheduleId = String(req.params.scheduleId);
  await availabilityService.deleteSchedule(userId, scheduleId);
  res.json({ message: "Schedule deleted" });
}

// ═══════════════════════════════════════════════════════════════════
//  Date Overrides
// ═══════════════════════════════════════════════════════════════════

export async function listOverrides(req: Request, res: Response): Promise<void> {
  const { from, to } = req.query;
  const scheduleId = String(req.params.scheduleId);
  const overrides = await availabilityService.listOverrides(
    scheduleId,
    from as string | undefined,
    to as string | undefined
  );
  res.json({
    overrides: overrides.map((o) => formatOverride(o)),
  });
}

export async function createOverride(req: Request, res: Response): Promise<void> {
  const body = req.body as CreateOverrideBody;
  const scheduleId = String(req.params.scheduleId);

  if (!body.override_date || body.is_unavailable === undefined) {
    throw new AppError(400, "VALIDATION_ERROR", "override_date and is_unavailable are required");
  }

  const override = await availabilityService.createOverride(scheduleId, body);
  res.status(201).json({ override: formatOverride(override) });
}

export async function deleteOverride(req: Request, res: Response): Promise<void> {
  const scheduleId = String(req.params.scheduleId);
  const overrideId = String(req.params.overrideId);
  await availabilityService.deleteOverride(scheduleId, overrideId);
  res.json({ message: "Override removed" });
}

// ═══════════════════════════════════════════════════════════════════
//  Response formatters
// ═══════════════════════════════════════════════════════════════════

function formatSchedule(s: any) {
  return {
    id: s.id,
    name: s.name,
    timezone: s.timezone,
    ...(s.availabilityRules && {
      rules: s.availabilityRules.map((r: any) => ({
        id: r.id,
        day_of_week: r.dayOfWeek,
        start_time: parseTimeColumn(r.startTime),
        end_time: parseTimeColumn(r.endTime),
      })),
    }),
  };
}

function formatOverride(o: any) {
  return {
    id: o.id,
    override_date: parseDateColumn(o.overrideDate),
    is_unavailable: o.isUnavailable,
    start_time: o.startTime ? parseTimeColumn(o.startTime) : null,
    end_time: o.endTime ? parseTimeColumn(o.endTime) : null,
  };
}
