/**
 * Hard-coded default user ID for this auth-less version.
 * Replace with actual auth user resolution later.
 */
export const DEFAULT_USER_ID = "11111111-1111-1111-1111-111111111111";

/**
 * Step size (in minutes) when sliding the slot window.
 * 15-min granularity is a common Calendly-style default.
 */
export const SLOT_STEP_MINUTES = 15;

/**
 * Slug validation regex — lowercase alphanumeric + hyphens only.
 */
export const SLUG_REGEX = /^[a-z0-9-]+$/;

/**
 * Booking state machine — allowed transitions.
 * Terminal states (cancelled, rescheduled) have no outgoing transitions.
 */
export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  confirmed: ["cancelled", "rescheduled"],
};

/**
 * Assert that a status transition is valid.
 * Throws AppError 409 INVALID_TRANSITION on illegal moves.
 */
import { AppError } from "./AppError.js";

export function assertTransition(current: string, next: string): void {
  if (!ALLOWED_TRANSITIONS[current]?.includes(next)) {
    throw new AppError(
      409,
      "INVALID_TRANSITION",
      `Cannot transition from '${current}' to '${next}'`
    );
  }
}
