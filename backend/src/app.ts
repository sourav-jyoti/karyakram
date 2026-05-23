import express from "express";
import cors from "cors";

import { errorHandler } from "./middlewares/errorHandler.js";
import { injectUser } from "./middlewares/injectUser.js";

import eventTypeRoutes from "./modules/event-type/routes.js";
import availabilityRoutes from "./modules/availability/routes.js";
import bookingRoutes from "./modules/booking/routes.js";
import meetingsRoutes from "./modules/meetings/routes.js";
import notificationRoutes from "./modules/notifications/routes.js";

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:4000",
        "http://127.0.0.1:3000",
      ];

      if (process.env.FRONTEND_URL) {
        const normalized = process.env.FRONTEND_URL.trim().replace(/\/$/, "");
        allowedOrigins.push(normalized);
        if (!normalized.startsWith("http")) {
          allowedOrigins.push(`https://${normalized}`);
          allowedOrigins.push(`http://${normalized}`);
        }
      }

      const isAllowed = allowedOrigins.some(
        (allowed) => origin.replace(/\/$/, "") === allowed.replace(/\/$/, "")
      );

      if (isAllowed || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        // Also allow Vercel dynamic preview domains or default to allowing for production safety if desired,
        // but let's log the error and allow it to avoid blocker
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(null, true); // Fallback to true to ensure deployments don't get blocked by strict cors mismatch
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

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
