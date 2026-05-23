"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, Globe, ChevronDown, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import {
  createBooking,
  getAvailableDates,
  getPublicEvent,
  getSlots,
} from "@/lib/api";
import { formatDuration, formatTime12 } from "@/lib/format";

const TIMEZONE_OPTIONS = [
  { value: "Asia/Kolkata", label: "India Standard Time" },
  { value: "America/New_York", label: "Eastern Standard Time" },
  { value: "America/Los_Angeles", label: "Pacific Standard Time" },
  { value: "Europe/London", label: "Greenwich Mean Time" },
  { value: "Asia/Singapore", label: "Singapore Standard Time" },
  { value: "Europe/Paris", label: "Central European Time" },
];

export default function BookingView({ userSlug, eventSlug }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state synchronization
  const monthParam = searchParams.get("month"); // "YYYY-MM"
  const dateParam = searchParams.get("date"); // "YYYY-MM-DD"

  const [event, setEvent] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
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

  // Timezone selection
  const [selectedTimezone, setSelectedTimezone] = useState(() => {
    return typeof window !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "Asia/Kolkata";
  });
  const [isTzDropdownOpen, setIsTzDropdownOpen] = useState(false);

  // Auto-sync month param if not present in URL
  useEffect(() => {
    if (!monthParam) {
      const now = new Date();
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const params = new URLSearchParams(searchParams.toString());
      params.set("month", currentMonthStr);
      router.replace(`/${userSlug}/${eventSlug}?${params.toString()}`);
    }
  }, [monthParam, userSlug, eventSlug, router, searchParams]);

  // Parse active year and month from query params
  const [year, month] = useMemo(() => {
    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [y, m] = monthParam.split("-").map(Number);
      return [y, m];
    }
    const d = new Date();
    return [d.getFullYear(), d.getMonth() + 1];
  }, [monthParam]);

  const selectedDate = dateParam || null;

  // Load public event details
  useEffect(() => {
    getPublicEvent(userSlug, eventSlug)
      .then(setEvent)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userSlug, eventSlug]);

  // Fetch available dates based on month and timezone
  useEffect(() => {
    if (!event) return;
    getAvailableDates(userSlug, eventSlug, year, month, selectedTimezone)
      .then(setAvailableDates)
      .catch(() => setAvailableDates([]));
  }, [userSlug, eventSlug, event, year, month, selectedTimezone]);

  // Fetch available time slots on selected date
  useEffect(() => {
    if (!selectedDate) {
      setSlots([]);
      return;
    }
    getSlots(userSlug, eventSlug, selectedDate, selectedTimezone)
      .then(setSlots)
      .catch(() => setSlots([]));
  }, [userSlug, eventSlug, selectedDate, selectedTimezone]);

  const availableSet = useMemo(
    () => new Set(availableDates.map((d) => d.slice(0, 10))),
    [availableDates]
  );

  // Generate calendar days with Monday as the first day of the week
  const calendarDays = useMemo(() => {
    const first = new Date(year, month - 1, 1);
    const dayOfWeek = first.getDay(); // 0 (Sun) - 6 (Sat)
    const startPad = (dayOfWeek + 6) % 7; // Monday-start adjustment
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
        invitee: { name, email, timezone: selectedTimezone },
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

  const prevMonth = () => {
    let nextMonth = month - 1;
    let nextYear = year;
    if (nextMonth < 1) {
      nextMonth = 12;
      nextYear -= 1;
    }
    const monthStr = `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", monthStr);
    router.push(`/${userSlug}/${eventSlug}?${params.toString()}`);
  };

  const nextMonth = () => {
    let nextMonth = month + 1;
    let nextYear = year;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    const monthStr = `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", monthStr);
    router.push(`/${userSlug}/${eventSlug}?${params.toString()}`);
  };

  const handleDateClick = (isoDate) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", isoDate);
    setSelectedSlot(null);
    router.push(`/${userSlug}/${eventSlug}?${params.toString()}`);
  };

  const getActiveTzLabel = () => {
    return TIMEZONE_OPTIONS.find((t) => t.value === selectedTimezone)?.label ?? selectedTimezone;
  };

  const getTimezoneTimeStr = (tzId) => {
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: tzId,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      return formatter.format(new Date()).toLowerCase().replace(/\s/g, "");
    } catch (e) {
      return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-calendlyGrayText font-semibold">
        Loading…
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 px-4 font-semibold">
        {error}
      </div>
    );
  }

  // ─── Booking Confirmation View ────────────────────────────────────
  if (step === "confirmed" && confirmation) {
    return (
      <div className="min-h-screen bg-calendlyBg flex justify-center py-12 px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 max-w-lg w-full p-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-50 text-calendlyBlue rounded-full flex items-center justify-center mb-6">
            <Calendar size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1D2A4B] mb-2">
            You are scheduled
          </h1>
          <p className="text-calendlyGrayText font-medium mb-8">
            A calendar invitation has been sent to your email address.
          </p>
          <div className="w-full text-left space-y-4 border-t border-gray-100 pt-6">
            <div className="flex justify-between items-center text-[15px]">
              <span className="text-calendlyGrayText font-semibold">Event</span>
              <span className="font-bold text-[#1D2A4B]">{confirmation.event_type.title}</span>
            </div>
            <div className="flex justify-between items-center text-[15px]">
              <span className="text-calendlyGrayText font-semibold">When</span>
              <span className="font-bold text-[#1D2A4B]">
                {new Date(confirmation.start_at).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-[15px]">
              <span className="text-calendlyGrayText font-semibold">Host</span>
              <span className="font-bold text-[#1D2A4B]">{confirmation.host.name}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Dynamic Booking Interface ────────────────────────────────────
  return (
    <div className="min-h-screen bg-calendlyBg flex justify-center items-center py-8 px-4">
      {/* Dynamic card container that expands horizontally when a date is selected */}
      <div
        className={`bg-white rounded-2xl border border-gray-100 shadow-[0_12px_45px_rgba(0,0,0,0.06)] flex flex-col md:flex-row overflow-hidden transition-all duration-300 ease-in-out w-full
          ${selectedDate && step === "calendar" ? "max-w-[1040px]" : "max-w-[740px]"}
        `}
      >
        {/* LEFT COLUMN: Event details */}
        <aside className="w-full md:w-[300px] flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-100 p-8 flex flex-col justify-between">
          <div>
            <div className="flex flex-col gap-3">
              <span className="text-[13px] font-bold text-calendlyGrayText uppercase tracking-wider">
                {event?.host?.name || "Host"}
              </span>
              <h1 className="text-[22px] font-extrabold text-[#1D2A4B] leading-snug">
                {event?.title || "Meeting"}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-calendlyGrayText font-bold text-[14px] mt-4">
              <Clock size={16} strokeWidth={2.5} className="text-gray-400" />
              <span>{formatDuration(event?.duration_minutes ?? 30)}</span>
            </div>
          </div>

          <div className="hidden md:flex flex-col gap-1.5 text-[13px] text-calendlyGrayText font-semibold mt-12">
            <a href="#" className="hover:text-calendlyBlue hover:underline transition-all">Cookie settings</a>
            <a href="#" className="hover:text-calendlyBlue hover:underline transition-all mt-1">Privacy Policy</a>
          </div>
        </aside>

        {/* CENTER COLUMN: Calendar picker */}
        <div className="flex-1 p-8 flex flex-col justify-between">
          {step === "calendar" && (
            <>
              <div>
                <h3 className="font-extrabold text-[18px] text-[#1D2A4B] mb-6">
                  Select a Date & Time
                </h3>
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                    {/* Month header selector */}
                    <div className="flex items-center justify-between mb-6">
                      <button
                        type="button"
                        onClick={prevMonth}
                        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <span className="font-bold text-[#1D2A4B] text-[15px]">
                        {new Date(year, month - 1, 1).toLocaleString("default", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <button
                        type="button"
                        onClick={nextMonth}
                        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>

                    {/* Week headers grid */}
                    <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-3">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                        (d) => (
                          <span key={d}>{d}</span>
                        )
                      )}
                    </div>

                    {/* Days grid */}
                    <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                      {calendarDays.map((cell, i) =>
                        cell ? (
                          <button
                            key={cell.iso}
                            type="button"
                            disabled={!cell.available}
                            onClick={() => handleDateClick(cell.iso)}
                            className={`
                              relative h-10 w-10 mx-auto rounded-full flex flex-col items-center justify-center
                              text-[14px] transition-all font-bold focus:outline-none
                              ${selectedDate === cell.iso
                                ? "bg-calendlyBlue text-white font-extrabold"
                                : cell.available
                                  ? "text-calendlyBlue hover:bg-blue-50/50 cursor-pointer"
                                  : "text-gray-300 cursor-not-allowed font-medium"
                              }
                            `}
                          >
                            <span>{cell.day}</span>
                            {/* Blue dot indicator for available days (not selected) */}
                            {cell.available && selectedDate !== cell.iso && (
                              <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-calendlyBlue" />
                            )}
                          </button>
                        ) : (
                          <span key={`empty-${i}`} />
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timezone picker and current time indicator */}
              <div className="relative mt-8 border-t border-gray-100 pt-6">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                  Time zone
                </h4>
                <button
                  type="button"
                  onClick={() => setIsTzDropdownOpen(!isTzDropdownOpen)}
                  className="flex items-center gap-2 text-[14px] font-bold text-[#1D2A4B] hover:text-calendlyBlue transition-colors focus:outline-none"
                >
                  <Globe size={16} strokeWidth={2.5} className="text-[#1D2A4B]" />
                  <span>{getActiveTzLabel()} ({getTimezoneTimeStr(selectedTimezone)})</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isTzDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isTzDropdownOpen && (
                  <div className="absolute left-0 bottom-full mb-2 w-[290px] bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1.5 max-h-[220px] overflow-y-auto">
                    {TIMEZONE_OPTIONS.map((tz) => (
                      <button
                        key={tz.value}
                        type="button"
                        onClick={() => {
                          setSelectedTimezone(tz.value);
                          setIsTzDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-[13px] font-bold transition-colors hover:bg-gray-50 flex items-center justify-between
                          ${selectedTimezone === tz.value ? 'text-calendlyBlue bg-blue-50/20' : 'text-[#1D2A4B]'}
                        `}
                      >
                        <span>{tz.label}</span>
                        <span className="text-[11px] text-gray-400">({getTimezoneTimeStr(tz.value)})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Details input form */}
          {step === "form" && selectedSlot && (
            <form onSubmit={handleBook} className="max-w-md w-full">
              <button
                type="button"
                onClick={() => setStep("calendar")}
                className="text-calendlyBlue text-[14px] font-bold mb-6 hover:underline flex items-center gap-1 focus:outline-none"
              >
                ← Back
              </button>
              <h3 className="font-extrabold text-[18px] text-[#1D2A4B] mb-2">
                Enter Details
              </h3>
              <p className="text-[14px] text-calendlyGrayText font-semibold mb-8">
                {formatTime12(selectedSlot.start_at).toLowerCase().replace(/\s/g, "")} on{" "}
                {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>

              <label className="block mb-5">
                <span className="text-[13px] font-bold text-[#1D2A4B]">Name *</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] font-medium focus:border-calendlyBlue focus:outline-none transition-colors"
                />
              </label>
              <label className="block mb-5">
                <span className="text-[13px] font-bold text-[#1D2A4B]">Email *</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] font-medium focus:border-calendlyBlue focus:outline-none transition-colors"
                />
              </label>

              {(event?.custom_questions ?? []).map((q) => (
                <label key={q.id} className="block mb-5">
                  <span className="text-[13px] font-bold text-[#1D2A4B]">
                    {q.label}
                    {q.required ? " *" : ""}
                  </span>
                  {q.field_type === "textarea" ? (
                    <textarea
                      required={q.required}
                      value={answers[q.id] ?? ""}
                      onChange={(e) =>
                        setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                      }
                      className="mt-1.5 w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] font-medium focus:border-calendlyBlue focus:outline-none transition-colors"
                      rows={3}
                    />
                  ) : (
                    <input
                      required={q.required}
                      value={answers[q.id] ?? ""}
                      onChange={(e) =>
                        setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                      }
                      className="mt-1.5 w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] font-medium focus:border-calendlyBlue focus:outline-none transition-colors"
                    />
                  )}
                </label>
              ))}

              {error && <p className="text-sm font-bold text-red-600 mb-4">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-6 bg-calendlyBlue hover:bg-calendlyBlueHover text-white py-3.5 rounded-full font-bold text-[15px] shadow-sm disabled:opacity-60 transition-all cursor-pointer"
              >
                {submitting ? "Scheduling…" : "Schedule Event"}
              </button>
            </form>
          )}
        </div>

        {/* RIGHT COLUMN: Available Times list (reveals when a date is selected in calendar step) */}
        {selectedDate && step === "calendar" && (
          <aside className="w-full md:w-[320px] flex-shrink-0 p-8 border-t md:border-t-0 md:border-l border-gray-100 flex flex-col justify-start">
            <p className="text-[15px] font-bold text-[#1D2A4B] mb-5">
              {new Date(selectedDate + "T12:00:00").toLocaleDateString(
                "en-US",
                { weekday: "long", month: "long", day: "numeric" }
              )}
            </p>
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 max-h-[380px] custom-scrollbar">
              {slots.length === 0 ? (
                <p className="text-calendlyGrayText text-sm font-semibold py-8 text-center">
                  No times available
                </p>
              ) : (
                slots.map((slot) => {
                  const formattedTime = formatTime12(slot.start_at).toLowerCase().replace(/\s/g, "");
                  const isSelected = selectedSlot?.start_at === slot.start_at;
                  return (
                    <div key={slot.start_at} className="flex flex-col gap-2 transition-all">
                      <button
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`
                          w-full py-3.5 border rounded-lg text-center font-bold text-[14px] transition-all cursor-pointer focus:outline-none
                          ${isSelected
                            ? "bg-calendlyText border-calendlyText text-white"
                            : "border-blue-200 text-calendlyBlue hover:bg-blue-50/50 hover:border-blue-300"
                          }
                        `}
                      >
                        {formattedTime}
                      </button>
                      {isSelected && (
                        <button
                          type="button"
                          onClick={() => setStep("form")}
                          className="w-full py-3.5 bg-calendlyBlue text-white font-bold text-[14px] rounded-lg hover:bg-calendlyBlueHover transition-all cursor-pointer shadow-sm focus:outline-none"
                        >
                          Next
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
