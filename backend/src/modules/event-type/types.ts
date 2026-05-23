export interface CustomQuestionInput {
  label: string;
  field_type?: string;
  required?: boolean;
  sort_order?: number;
}

export interface CreateEventTypeBody {
  title: string;
  slug: string;
  duration_minutes: number;
  type?: "one_to_one" | "one_to_many";
  schedule_id: string;
  buffer_before_min?: number;
  buffer_after_min?: number;
  is_active?: boolean;
  max_invitees?: number;
  custom_questions?: CustomQuestionInput[];
}

export interface UpdateEventTypeBody {
  title?: string;
  slug?: string;
  duration_minutes?: number;
  type?: "one_to_one" | "one_to_many";
  schedule_id?: string;
  buffer_before_min?: number;
  buffer_after_min?: number;
  is_active?: boolean;
  max_invitees?: number;
  custom_questions?: CustomQuestionInput[];
}

export interface EventTypeListQuery {
  is_active?: string;
  type?: string;
}
