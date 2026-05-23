import { Request, Response, NextFunction } from "express";

/**
 * Wraps an async Express route handler so rejected promises
 * are forwarded to the error-handling middleware automatically.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
