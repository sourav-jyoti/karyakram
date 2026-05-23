--USERS
--The host.One user = one scheduling page.
--slug becomes the public URL: /:slug/: event - slug

CREATE TABLE users(
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    timezone    TEXT NOT NULL, --IANA e.g. "America/New_York"
    slug        TEXT NOT NULL UNIQUE, --e.g. "alice" → /alice/30min
    created_at  TIMESTAMPTZ DEFAULT now()
);


--SCHEDULES
--A named set of working hours(e.g. "Work hours", "Weekends").
--One user can have many schedules; one is marked is_default.
--An event_type points to the schedule it uses.

CREATE TABLE schedules(
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    timezone    TEXT NOT NULL, --IANA — the timezone for this schedule
);

--AVAILABILITY RULES
--Recurring weekly windows."Stored as TIME (no date, no UTC)".
--0=Sun, 1 = Mon … 6 = Sat
--Backend expands these day - by - day into UTC instants at query time.

CREATE TABLE availability_rules(
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id  UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    day_of_week  SMALLINT NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
    start_time   TIME NOT NULL, --e.g. 09:00
    end_time     TIME NOT NULL-- e.g. 17:00
    CHECK(start_time < end_time)
);

--DATE OVERRIDES 
--Override availability for a specific date.
--is_unavailable=true → block entire day(holiday, day off).
--is_unavailable=false → custom hours that replace the recurring rule.

CREATE TABLE date_overrides(
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id     UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    override_date   DATE NOT NULL,
    start_time      TIME, -- null when is_unavailable = true
    end_time        TIME, -- null when is_unavailable = true
    is_unavailable  BOOLEAN NOT NULL DEFAULT false
);


--EVENT TYPES
--The "product" the host offers(e.g. "30-min coffee chat").
--type: 'one_to_one' i.e max_invitees = 1  or 'one_to_many' i.e max_invitees > 1
--buffer_before / after: minutes blocked before / after each booking[extra].
--slug must be unique per user → composite unique below.

CREATE TABLE event_types(
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    schedule_id         UUID NOT NULL REFERENCES schedules(id),
    title               TEXT NOT NULL,
    slug                TEXT NOT NULL, --e.g. "30min" → /alice/30min
    duration_minutes    INT NOT NULL,
    type                TEXT NOT NULL DEFAULT 'one_to_one'
                        CHECK(type IN('one_to_one', 'one_to_many')),
    max_invitees        INT NOT NULL DEFAULT 1,
    buffer_before_min   INT NOT NULL DEFAULT 0, 
    buffer_after_min    INT NOT NULL DEFAULT 0, 
    is_active           BOOLEAN NOT NULL DEFAULT true,
    UNIQUE(user_id, slug)
);


--CUSTOM QUESTIONS
--field_type: 'text' | 'textarea' | 'select' | 'checkbox'

CREATE TABLE custom_questions(
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type_id  UUID NOT NULL REFERENCES event_types(id) ON DELETE CASCADE,
    label          TEXT NOT NULL,
    field_type     TEXT NOT NULL DEFAULT 'text',
    required       BOOLEAN NOT NULL DEFAULT false,
    sort_order     INT NOT NULL DEFAULT 0
);


--BOOKINGS
--The single source of truth for a meeting.
--start_at / end_at are always UTC(TIMESTAMPTZ).
--status: 'confirmed' | 'cancelled' | 'rescheduled'
--reschedule_token: short token emailed to invitee for self - service reschedule[extra].

CREATE TABLE bookings(
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type_id     UUID NOT NULL REFERENCES event_types(id),
    host_user_id      UUID NOT NULL REFERENCES users(id),
    start_at          TIMESTAMPTZ NOT NULL,
    end_at            TIMESTAMPTZ NOT NULL,
    status            TEXT NOT NULL DEFAULT 'confirmed'
                    CHECK(status IN('confirmed', 'cancelled', 'rescheduled')),
    cancel_reason     TEXT,
    reschedule_token  TEXT UNIQUE, 
  created_at        TIMESTAMPTZ DEFAULT now()
);

--Constraint: Prevent double booking: no two confirmed bookings for the same host can overlap.

CREATE UNIQUE INDEX no_double_booking
  ON bookings(host_user_id, start_at)
  WHERE status = 'confirmed';


--ATTENDEES
--For 1: 1 → 2 rows(host + 1 invitee).
--For 1: M → 1 host row + N invitee rows.
--timezone is stored at booking time for display in emails / dashboard.

CREATE TABLE attendees(
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id  UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL,
    timezone    TEXT NOT NULL, --IANA at time of booking
    is_host     BOOLEAN NOT NULL DEFAULT false
);


--BOOKING ANSWERS
--invitee responses to custom_questions.

CREATE TABLE booking_answers(
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id   UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    question_id  UUID NOT NULL REFERENCES custom_questions(id),
    answer       TEXT NOT NULL
);


--NOTIFICATIONS
--Queue for confirmation / cancellation / reminder emails.
--type: 'confirmation' | 'cancellation' | 'reminder_24h' | 'reminder_1h'
--status: 'pending' | 'sent' | 'failed'
--Your email job worker polls WHERE status = 'pending' AND scheduled_at <= now().

CREATE TABLE notifications(
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id       UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    recipient_email  TEXT NOT NULL,
    type             TEXT NOT NULL,
    status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK(status IN('pending', 'sent', 'failed')),
    scheduled_at     TIMESTAMPTZ NOT NULL,
    sent_at          TIMESTAMPTZ
);