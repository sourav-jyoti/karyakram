export interface InviteeInput {
  name: string;
  email: string;
  timezone: string;
}

export interface AnswerInput {
  question_id: string;
  answer: string;
}

export interface BookingBody {
  start_at: string;
  invitee: InviteeInput;
  answers?: AnswerInput[];
}

export interface SlotResponse {
  start_at: string;
  end_at: string;
}

export interface AvailableDatesQuery {
  year: string;
  month: string;
  timezone: string;
}

export interface SlotsQuery {
  date: string;
  timezone?: string;
}
