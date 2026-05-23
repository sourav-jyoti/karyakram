/**
 * Convert a UUID string to a 32-bit integer suitable for pg_advisory_xact_lock.
 * Takes the first 8 hex characters of the UUID and parses as base-16.
 */
export function hashToInt(uuid: string): number {
  const hex = uuid.replace(/-/g, "").substring(0, 8);
  return parseInt(hex, 16);
}
