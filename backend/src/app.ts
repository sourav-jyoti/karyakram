import express from "express";

import { errorHandler } from "./middlewares/errorHandler.js";
import { injectUser } from "./middlewares/injectUser.js";

import eventTypeRoutes from "./modules/event-type/routes.js";
import availabilityRoutes from "./modules/availability/routes.js";
import bookingRoutes from "./modules/booking/routes.js";
import meetingsRoutes from "./modules/meetings/routes.js";
import notificationRoutes from "./modules/notifications/routes.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Admin routes — inject default user
app.use("/api/users/me/event-types", injectUser, eventTypeRoutes);
app.use("/api/availability/schedules", injectUser, availabilityRoutes);
app.use("/api/scheduled-events", injectUser, meetingsRoutes);

// Public routes — no auth
app.use("/api/public", bookingRoutes);

// Internal routes — no auth (consumed by background worker)
app.use("/api/internal/notifications", notificationRoutes);

// Global error handler (must be AFTER all routes)
app.use(errorHandler);

export default app;
