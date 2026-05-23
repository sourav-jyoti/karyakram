import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { DEFAULT_USER_ID } from "../utils/constants.js";

/**
 * Augment Express Request with user info for admin routes.
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        timezone: string;
        slug: string;
      };
    }
  }
}

/**
 * Middleware that loads the default user from the database and attaches
 * it to req.user. Used on admin routes only.
 *
 * In a real app this would validate a JWT / session and resolve the user.
 */
export async function injectUser(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: DEFAULT_USER_ID },
      select: { id: true, name: true, email: true, timezone: true, slug: true },
    });

    if (user) {
      req.user = user;
    }

    next();
  } catch (err) {
    next(err);
  }
}
