import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import * as controller from "./controller.js";

const router = Router();

// ─── Schedules ──────────────────────────────────────────────────────

// GET    /availability/schedules
router.get("/", asyncHandler(controller.listSchedules));

// POST   /availability/schedules
router.post("/", asyncHandler(controller.createSchedule));

// PATCH  /availability/schedules/:scheduleId
router.patch("/:scheduleId", asyncHandler(controller.updateSchedule));

// DELETE /availability/schedules/:scheduleId
router.delete("/:scheduleId", asyncHandler(controller.deleteSchedule));

// ─── Date Overrides ─────────────────────────────────────────────────

// GET    /availability/schedules/:scheduleId/overrides
router.get("/:scheduleId/overrides", asyncHandler(controller.listOverrides));

// POST   /availability/schedules/:scheduleId/overrides
router.post("/:scheduleId/overrides", asyncHandler(controller.createOverride));

// DELETE /availability/schedules/:scheduleId/overrides/:overrideId
router.delete("/:scheduleId/overrides/:overrideId", asyncHandler(controller.deleteOverride));

export default router;
