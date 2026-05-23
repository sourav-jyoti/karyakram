import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import * as controller from "./controller.js";

const router = Router();

// GET  /internal/notifications/pending
router.get("/pending", asyncHandler(controller.getPending));

// PATCH /internal/notifications/:notificationId
router.patch("/:notificationId", asyncHandler(controller.update));

export default router;
