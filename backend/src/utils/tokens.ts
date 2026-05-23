import crypto from "crypto";

/**
 * Generate a cryptographically random token prefixed with "tok_".
 * Used for cancel_token and reschedule_token.
 */
export function generateToken(): string {
  return `tok_${crypto.randomUUID().replace(/-/g, "")}`;
}
