export interface RuleInput {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface CreateScheduleBody {
  name: string;
  timezone: string;
  rules?: RuleInput[];
}

export interface UpdateScheduleBody {
  name?: string;
  timezone?: string;
  rules?: RuleInput[];
}

export interface CreateOverrideBody {
  override_date: string;
  is_unavailable: boolean;
  start_time?: string;
  end_time?: string;
}

export interface OverrideListQuery {
  from?: string;
  to?: string;
}
