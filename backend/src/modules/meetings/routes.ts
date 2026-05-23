import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import * as controller from "./controller.js";

const router = Router();

// GET  /scheduled-events
router.get("/", asyncHandler(controller.list));

// GET  /scheduled-events/:bookingId
router.get("/:bookingId", asyncHandler(controller.get));

// POST /scheduled-events/:bookingId/cancel
router.post("/:bookingId/cancel", asyncHandler(controller.cancel));

export default router;
