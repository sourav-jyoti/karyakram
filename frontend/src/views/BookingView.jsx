"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import UserLandingHeader from "@/components/user/UserLandingHeader";
import {
  createBooking,
  getAvailableDates,
  getPublicEvent,
  getSlots,
} from "@/lib/api";
import { formatDuration, formatTime12 } from "@/lib/format";

export default function BookingView({ userSlug, eventSlug }) {
  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );

  const [event, setEvent] = useState(null);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [step, setStep] = useState("calendar");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState({});
  const [confirmation, setConfirmation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth() + 1;

  useEffect(() => {
    getPublicEvent(userSlug, eventSlug)
      .then(setEvent)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userSlug, eventSlug]);

  useEffect(() => {
    if (!event) return;
    getAvailableDates(userSlug, eventSlug, year, month, timezone)
      .then(setAvailableDates)
      .catch(() => setAvailableDates([]));
  }, [userSlug, eventSlug, event, year, month, timezone]);

  useEffect(() => {
    if (!selectedDate) {
      setSlots([]);
      return;
    }
    getSlots(userSlug, eventSlug, selectedDate, timezone)
      .then(setSlots)
      .catch(() => setSlots([]));
  }, [userSlug, eventSlug, selectedDate, timezone]);

  const availableSet = useMemo(
    () => new Set(availableDates.map((d) => d.slice(0, 10))),
    [availableDates]
  );

  const calendarDays = useMemo(() => {
    const first = new Date(year, month - 1, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const cells = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, iso, available: availableSet.has(iso) });
    }
    return cells;
  }, [year, month, availableSet]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await createBooking(userSlug, eventSlug, {
        start_at: selectedSlot.start_at,
        invitee: { name, email, timezone },
        answers: (event?.custom_questions ?? []).map((q) => ({
          question_id: q.id,
          value: answers[q.id] ?? "",
        })),
      });
      setConfirmation(result);
      setStep("confirmed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  const prevMonth = () =>
    setViewDate(new Date(year, month - 2, 1));
  const nextMonth = () =>
    setViewDate(new Date(year, month, 1));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-calendlyGrayText">
        Loading…
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 px-4">
        {error}
      </div>
    );
  }

  if (step === "confirmed" && confirmation) {
    return (
      <div className="min-h-screen bg-calendlyBg flex justify-center py-12 px-4">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 max-w-lg w-full p-8">
          <h1 className="text-2xl font-bold text-calendlyText mb-2">
            You are scheduled
          </h1>
          <p className="text-calendlyGrayText mb-6">
            A calendar invitation has been sent to your email address.
          </p>
          <dl className="space-y-3 text-[15px]">
            <div>
              <dt className="text-calendlyGrayText">Event</dt>
              <dd className="font-semibold">{confirmation.event_type.title}</dd>
            </div>
            <div>
              <dt className="text-calendlyGrayText">When</dt>
              <dd className="font-semibold">
                {new Date(confirmation.start_at).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-calendlyGrayText">Host</dt>
              <dd className="font-semibold">{confirmation.host.name}</dd>
            </div>
          </dl>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-calendlyBg flex justify-center py-8 px-4">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 max-w-4xl w-full flex flex-col md:flex-row overflow-hidden">
        <aside className="md:w-[280px] border-b md:border-b-0 md:border-r border-gray-200 p-6 bg-gray-50">
          <UserLandingHeader hostName={event?.host?.name} />
          <h2 className="text-xl font-bold text-calendlyText mt-4">
            {event?.title}
          </h2>
          <p className="text-calendlyGrayText mt-2">
            {formatDuration(event?.duration_minutes ?? 30)}
          </p>
          <p className="text-[13px] text-calendlyGrayText mt-4">{timezone}</p>
        </aside>

        <div className="flex-1 p-6">
          {step === "calendar" && (
            <>
              <h3 className="font-bold text-calendlyText mb-4">
                Select a Date & Time
              </h3>
              <div className="flex flex-col lg:flex-row gap-8">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={prevMonth}
                      className="text-calendlyBlue font-bold px-2"
                    >
                      ‹
                    </button>
                    <span className="font-semibold">
                      {viewDate.toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <button
                      type="button"
                      onClick={nextMonth}
                      className="text-calendlyBlue font-bold px-2"
                    >
                      ›
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-[12px] text-calendlyGrayText mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (d) => (
                        <span key={d}>{d}</span>
                      )
                    )}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((cell, i) =>
                      cell ? (
                        <button
                          key={cell.iso}
                          type="button"
                          disabled={!cell.available}
                          onClick={() => {
                            setSelectedDate(cell.iso);
                            setSelectedSlot(null);
                          }}
                          className={`h-9 w-9 rounded-full text-[14px] ${
                            selectedDate === cell.iso
                              ? "bg-calendlyBlue text-white"
                              : cell.available
                                ? "text-calendlyBlue font-semibold hover:bg-calendlyLightBlue"
                                : "text-gray-300 cursor-not-allowed"
                          }`}
                        >
                          {cell.day}
                        </button>
                      ) : (
                        <span key={`empty-${i}`} />
                      )
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                  {selectedDate ? (
                    <>
                      <p className="font-semibold text-calendlyText mb-3">
                        {new Date(selectedDate + "T12:00:00").toLocaleDateString(
                          "en-US",
                          { weekday: "long", month: "long", day: "numeric" }
                        )}
                      </p>
                      <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto">
                        {slots.length === 0 ? (
                          <p className="text-calendlyGrayText text-sm">
                            No times available
                          </p>
                        ) : (
                          slots.map((slot) => (
                            <button
                              key={slot.start_at}
                              type="button"
                              onClick={() => {
                                setSelectedSlot(slot);
                                setStep("form");
                              }}
                              className="border border-calendlyBlue text-calendlyBlue rounded-md py-2 font-semibold hover:bg-calendlyLightBlue text-[14px]"
                            >
                              {formatTime12(slot.start_at)}
                            </button>
                          ))
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-calendlyGrayText text-sm">
                      Select a date to see available times
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {step === "form" && selectedSlot && (
            <form onSubmit={handleBook} className="max-w-md">
              <button
                type="button"
                onClick={() => setStep("calendar")}
                className="text-calendlyBlue text-sm mb-4 hover:underline"
              >
                ← Back
              </button>
              <h3 className="font-bold text-calendlyText mb-1">
                Enter Details
              </h3>
              <p className="text-sm text-calendlyGrayText mb-6">
                {formatTime12(selectedSlot.start_at)} on{" "}
                {new Date(selectedDate + "T12:00:00").toLocaleDateString()}
              </p>

              <label className="block mb-4">
                <span className="text-sm font-semibold">Name *</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </label>
              <label className="block mb-4">
                <span className="text-sm font-semibold">Email *</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </label>

              {(event?.custom_questions ?? []).map((q) => (
                <label key={q.id} className="block mb-4">
                  <span className="text-sm font-semibold">
                    {q.label}
                    {q.is_required ? " *" : ""}
                  </span>
                  {q.field_type === "textarea" ? (
                    <textarea
                      required={q.is_required}
                      value={answers[q.id] ?? ""}
                      onChange={(e) =>
                        setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                      }
                      className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                      rows={3}
                    />
                  ) : (
                    <input
                      required={q.is_required}
                      value={answers[q.id] ?? ""}
                      onChange={(e) =>
                        setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                      }
                      className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  )}
                </label>
              ))}

              {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-calendlyBlue hover:bg-calendlyBlueHover text-white py-3 rounded-full font-semibold disabled:opacity-60"
              >
                {submitting ? "Scheduling…" : "Schedule Event"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
