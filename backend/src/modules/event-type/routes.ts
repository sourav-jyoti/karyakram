import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import * as controller from "./controller.js";

const router = Router();

// GET    /users/me/event-types
router.get("/", asyncHandler(controller.list));

// POST   /users/me/event-types
router.post("/", asyncHandler(controller.create));

// GET    /users/me/event-types/:eventTypeId
router.get("/:eventTypeId", asyncHandler(controller.get));

// PATCH  /users/me/event-types/:eventTypeId
router.patch("/:eventTypeId", asyncHandler(controller.update));

// DELETE /users/me/event-types/:eventTypeId
router.delete("/:eventTypeId", asyncHandler(controller.remove));

export default router;
