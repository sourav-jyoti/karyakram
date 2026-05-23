export interface EventType {
  id: string;
  title: string;
  slug: string;
  duration_minutes: number;
  type: "one_to_one" | "one_to_many";
  buffer_before_min?: number;
  buffer_after_min?: number;
  is_active: boolean;
  booking_url: string;
  schedule?: { id: string; name: string };
  custom_questions?: CustomQuestion[];
}

export interface CustomQuestion {
  id: string;
  label: string;
  field_type: string;
  is_required: boolean;
  options?: string[];
}

export interface Schedule {
  id: string;
  name: string;
  timezone: string;
  rules?: AvailabilityRule[];
}

export interface AvailabilityRule {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface DateOverride {
  id: string;
  override_date: string;
  is_unavailable: boolean;
  start_time?: string;
  end_time?: string;
}

export interface Meeting {
  id: string;
  status: string;
  start_at: string;
  end_at: string;
  event_type: { id: string; title: string; slug: string };
  invitees: { name: string; email: string; timezone: string }[];
}

export interface PublicEventType {
  id: string;
  title: string;
  duration_minutes: number;
  type: string;
  host: { name: string; timezone: string };
  custom_questions: CustomQuestion[];
}

export interface TimeSlot {
  start_at: string;
  end_at: string;
}

export interface BookingResult {
  id: string;
  status: string;
  start_at: string;
  end_at: string;
  event_type: { title: string };
  host: { name: string };
  invitee: { name: string; email: string };
  cancel_token: string;
  reschedule_token: string;
}
