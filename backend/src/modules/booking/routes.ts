import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import * as controller from "./controller.js";

const router = Router();

// ─── Public booking page ────────────────────────────────────────────

// GET  /public/:userSlug/:eventSlug
router.get("/:userSlug/:eventSlug", asyncHandler(controller.getPublicEventType));

// GET  /public/:userSlug/:eventSlug/available-dates
router.get("/:userSlug/:eventSlug/available-dates", asyncHandler(controller.getAvailableDates));

// GET  /public/:userSlug/:eventSlug/slots
router.get("/:userSlug/:eventSlug/slots", asyncHandler(controller.getSlots));

// POST /public/:userSlug/:eventSlug/book
router.post("/:userSlug/:eventSlug/book", asyncHandler(controller.book));

// ─── Token-based actions (no auth) ─────────────────────────────────

// POST /public/cancel/:cancelToken
router.post("/cancel/:cancelToken", asyncHandler(controller.cancelByToken));

// POST /public/reschedule/:rescheduleToken
router.post("/reschedule/:rescheduleToken", asyncHandler(controller.rescheduleByToken));

export default router;
