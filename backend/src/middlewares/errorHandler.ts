import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

/**
 * Global Express error handler.
 * Must be registered AFTER all routes: app.use(errorHandler)
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Something went wrong." },
  });
}
