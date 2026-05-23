import { DateTime, IANAZone } from "luxon";

/**
 * Validate an IANA timezone string using Luxon.
 */
export function isValidTimezone(tz: string): boolean {
  return IANAZone.isValidZone(tz);
}

/**
 * Expand one availability rule into a UTC interval for a specific calendar date.
 * DST-safe: anchors to the host's timezone so "09:00 Monday" stays at 09:00
 * wall-clock time even across DST transitions.
 *
 * @param date      - 'YYYY-MM-DD' in the host's local calendar
 * @param startTime - 'HH:mm' from availability_rules, in hostTz
 * @param endTime   - 'HH:mm' from availability_rules, in hostTz
 * @param hostTz    - IANA e.g. 'Asia/Kolkata'
 * @returns null when the wall-clock time doesn't exist on that date (DST gap)
 */
export function expandRuleToUtc(
  date: string,
  startTime: string,
  endTime: string,
  hostTz: string
): { startUtc: DateTime; endUtc: DateTime } | null {
  const startLocal = DateTime.fromISO(`${date}T${startTime}`, { zone: hostTz });
  const endLocal = DateTime.fromISO(`${date}T${endTime}`, { zone: hostTz });

  // Wall-clock time doesn't exist on this date (clock skipped forward)
  if (!startLocal.isValid || !endLocal.isValid) return null;

  return {
    startUtc: startLocal.toUTC(),
    endUtc: endLocal.toUTC(),
  };
}

/**
 * Convert a UTC ISO string to an invitee's local timezone.
 */
export function toInviteeTz(utcIso: string, inviteeTz: string): DateTime {
  return DateTime.fromISO(utcIso, { zone: "utc" }).setZone(inviteeTz);
}

/**
 * Get the day-of-week (0=Sun … 6=Sat) for a YYYY-MM-DD date
 * in the given timezone.
 */
export function getDayOfWeek(date: string, tz: string): number {
  const dt = DateTime.fromISO(date, { zone: tz });
  // Luxon weekday: 1=Mon … 7=Sun. Convert to 0=Sun … 6=Sat.
  return dt.weekday === 7 ? 0 : dt.weekday;
}

/**
 * Get "now" as a Luxon DateTime in UTC.
 */
export function nowUtc(): DateTime {
  return DateTime.utc();
}

/**
 * Parse a TIME column value (e.g. "09:00:00" or "09:00") into "HH:mm".
 * Prisma may return Date objects for TIME columns — handle both cases.
 */
export function parseTimeColumn(value: unknown): string {
  if (typeof value === "string") {
    // "09:00:00" → "09:00"
    return value.substring(0, 5);
  }
  if (value instanceof Date) {
    // Prisma returns TIME as a Date anchored to 1970-01-01
    const hours = String(value.getUTCHours()).padStart(2, "0");
    const minutes = String(value.getUTCMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }
  return String(value);
}

/**
 * Parse a DATE column value into "YYYY-MM-DD".
 */
export function parseDateColumn(value: unknown): string {
  if (typeof value === "string") {
    return value.substring(0, 10);
  }
  if (value instanceof Date) {
    return DateTime.fromJSDate(value, { zone: "utc" }).toISODate()!;
  }
  return String(value);
}
