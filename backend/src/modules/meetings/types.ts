export interface MeetingListQuery {
  period?: "upcoming" | "past" | "all";
  status?: "confirmed" | "cancelled" | "rescheduled";
  event_type_id?: string;
  page?: string;
  per_page?: string;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
}
