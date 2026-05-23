const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

export function formatTime12(isoOrTime: string): string {
  if (isoOrTime.includes("T")) {
    return new Date(isoOrTime).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
  const [h, m] = isoOrTime.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDateHeader(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTimeRange(startAt: string, endAt: string): string {
  return `${formatTime12(startAt)} - ${formatTime12(endAt)}`;
}

export function dayLabel(dayOfWeek: number): string {
  return DAY_LABELS[dayOfWeek] ?? "?";
}

export function dayName(dayOfWeek: number): string {
  return DAY_NAMES[dayOfWeek] ?? "";
}

export function summarizeWeeklyRules(
  rules: { day_of_week: number; start_time: string; end_time: string }[]
): string {
  if (!rules.length) return "No hours set";
  const days = [...new Set(rules.map((r) => r.day_of_week))].sort(
    (a, b) => a - b
  );
  const start = formatTime12(rules[0].start_time);
  const end = formatTime12(rules[0].end_time);
  const dayRange =
    days.length === 5 &&
    days.every((d, i) => d === i + 1)
      ? "Weekdays"
      : days.map((d) => DAY_NAMES[d]?.slice(0, 3)).join(", ");
  return `${dayRange}, ${start} - ${end}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function bookingPath(bookingUrl: string): string {
  return bookingUrl.startsWith("/") ? bookingUrl : `/${bookingUrl}`;
}
