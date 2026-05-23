import type {
  BookingResult,
  DateOverride,
  EventType,
  Meeting,
  PublicEventType,
  Schedule,
  TimeSlot,
} from "./types";

const API_BASE =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "")
    : (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "");

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      (data as { error?: { message?: string } })?.error?.message ??
      res.statusText;
    throw new Error(message || "Request failed");
  }

  return data as T;
}

// —— Event types ——

export async function getEventTypes(): Promise<EventType[]> {
  const { event_types } = await request<{ event_types: EventType[] }>(
    "/api/users/me/event-types"
  );
  return event_types;
}

export async function createEventType(body: {
  title: string;
  slug: string;
  duration_minutes: number;
  schedule_id: string;
  buffer_before_min?: number;
  buffer_after_min?: number;
}): Promise<EventType> {
  const { event_type } = await request<{ event_type: EventType }>(
    "/api/users/me/event-types",
    { method: "POST", body: JSON.stringify(body) }
  );
  return event_type;
}

export async function deleteEventType(id: string): Promise<void> {
  await request(`/api/users/me/event-types/${id}`, { method: "DELETE" });
}

// —— Availability ——

export async function getSchedules(): Promise<Schedule[]> {
  const { schedules } = await request<{ schedules: Schedule[] }>(
    "/api/availability/schedules"
  );
  return schedules;
}

export async function updateSchedule(
  scheduleId: string,
  body: {
    name?: string;
    timezone?: string;
    rules?: { day_of_week: number; start_time: string; end_time: string }[];
  }
): Promise<Schedule> {
  const { schedule } = await request<{ schedule: Schedule }>(
    `/api/availability/schedules/${scheduleId}`,
    { method: "PATCH", body: JSON.stringify(body) }
  );
  return schedule;
}

export async function getOverrides(
  scheduleId: string,
  from: string,
  to: string
): Promise<DateOverride[]> {
  const { overrides } = await request<{ overrides: DateOverride[] }>(
    `/api/availability/schedules/${scheduleId}/overrides?from=${from}&to=${to}`
  );
  return overrides;
}

// —— Meetings ——

export async function getMeetings(params: {
  period?: "upcoming" | "past" | "all";
  page?: number;
}): Promise<{ meetings: Meeting[]; total: number }> {
  const q = new URLSearchParams();
  if (params.period) q.set("period", params.period);
  if (params.page) q.set("page", String(params.page));
  const { meetings, pagination } = await request<{
    meetings: Meeting[];
    pagination: { total: number };
  }>(`/api/scheduled-events?${q}`);
  return { meetings, total: pagination.total };
}

export async function cancelMeeting(
  bookingId: string,
  reason?: string
): Promise<void> {
  await request(`/api/scheduled-events/${bookingId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

// —— Public booking ——

export async function getPublicEvent(
  userSlug: string,
  eventSlug: string
): Promise<PublicEventType> {
  const { event_type } = await request<{ event_type: PublicEventType }>(
    `/api/public/${userSlug}/${eventSlug}`
  );
  return event_type;
}

export async function getAvailableDates(
  userSlug: string,
  eventSlug: string,
  year: number,
  month: number,
  timezone: string
): Promise<string[]> {
  const { available_dates } = await request<{ available_dates: string[] }>(
    `/api/public/${userSlug}/${eventSlug}/available-dates?year=${year}&month=${month}&timezone=${encodeURIComponent(timezone)}`
  );
  return available_dates;
}

export async function getSlots(
  userSlug: string,
  eventSlug: string,
  date: string,
  timezone?: string
): Promise<TimeSlot[]> {
  const q = timezone ? `&timezone=${encodeURIComponent(timezone)}` : "";
  const { slots } = await request<{ slots: TimeSlot[] }>(
    `/api/public/${userSlug}/${eventSlug}/slots?date=${date}${q}`
  );
  return slots;
}

export async function createBooking(
  userSlug: string,
  eventSlug: string,
  body: {
    start_at: string;
    invitee: { name: string; email: string; timezone?: string };
    answers?: { question_id: string; value: string }[];
  }
): Promise<BookingResult> {
  const { booking } = await request<{ booking: BookingResult }>(
    `/api/public/${userSlug}/${eventSlug}/book`,
    { method: "POST", body: JSON.stringify(body) }
  );
  return booking;
}

export async function cancelByToken(
  cancelToken: string,
  reason?: string
): Promise<void> {
  await request(`/api/public/cancel/${cancelToken}`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}
