"use client";

import React, { useState, useMemo } from "react";
import { X, ChevronDown, ChevronUp, AlertCircle, Clock, MapPin, Calendar, User, Plus } from "lucide-react";
import PanelHeader from "./PanelHeader";
import PanelFooter from "./PanelFooter";
import PanelSection from "./PanelSection";
import { slugify, summarizeWeeklyRules, formatTime12, dayLabel } from "@/lib/format";

const DURATION_OPTIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "60 min" },
  { value: 90, label: "90 min" },
  { value: 120, label: "2 hr" },
];

const BUFFER_OPTIONS = [
  { value: 0, label: "None" },
  { value: 5, label: "5 min" },
  { value: 10, label: "10 min" },
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "60 min" },
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CreateEventPanel = ({ type, schedules = [], onClose, onCreate }) => {
  const [title, setTitle] = useState("New Meeting");
  const [slug, setSlug] = useState("new-meeting");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [scheduleId, setScheduleId] = useState(schedules[0]?.id ?? "");
  const [bufferBefore, setBufferBefore] = useState(0);
  const [bufferAfter, setBufferAfter] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // Booking question state
  const [questions, setQuestions] = useState([]);
  const [newQuestionLabel, setNewQuestionLabel] = useState("");

  const selectedSchedule = useMemo(
    () => schedules.find((s) => s.id === scheduleId),
    [schedules, scheduleId]
  );

  const availabilitySummary = useMemo(() => {
    if (!selectedSchedule?.rules?.length) return "No hours set";
    return summarizeWeeklyRules(selectedSchedule.rules);
  }, [selectedSchedule]);

  // Build day-by-day breakdown for expanded availability
  const weeklyBreakdown = useMemo(() => {
    if (!selectedSchedule?.rules) return [];
    return Array.from({ length: 7 }, (_, day) => {
      const dayRules = selectedSchedule.rules.filter((r) => r.day_of_week === day);
      if (dayRules.length === 0) {
        return { day, label: DAY_NAMES[day], available: false, times: "Unavailable" };
      }
      const times = dayRules.map((r) => `${formatTime12(r.start_time)}  -  ${formatTime12(r.end_time)}`).join(", ");
      return { day, label: DAY_NAMES[day], available: true, times };
    });
  }, [selectedSchedule]);

  const handleTitleChange = (value) => {
    setTitle(value);
    if (!slug || slug === slugify(title)) setSlug(slugify(value));
  };

  const handleAddQuestion = () => {
    if (!newQuestionLabel.trim()) return;
    setQuestions((prev) => [
      ...prev,
      { label: newQuestionLabel.trim(), field_type: "text", required: false, sort_order: prev.length },
    ]);
    setNewQuestionLabel("");
  };

  const handleRemoveQuestion = (idx) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Meeting name is required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onCreate({
        title: title.trim(),
        slug: slugify(title.trim()),
        durationMinutes: Number(durationMinutes),
        scheduleId,
        bufferBefore,
        bufferAfter,
        ...(questions.length > 0 && { customQuestions: questions }),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create");
      setSubmitting(false);
    }
  };

  // Host info (hardcoded for now — matches backend DEFAULT_USER)
  const userSlug = "sourav";
  const userName = "sourav";

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
        aria-hidden
      />
      <div className="fixed top-0 right-0 h-full w-[460px] bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.08)] z-50 flex flex-col border-l border-gray-200">
        {/* Close button */}
        <div className="px-6 py-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-10 pb-28">
          {/* Header with editable name */}
          <PanelHeader
            type={type}
            title={title}
            onTitleChange={handleTitleChange}
          />

          <div className="mt-6">
            {/* ─── Duration ─────────────────────────────── */}
            <PanelSection title="Duration" isExpanded={true}>
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[15px] text-[#1D2A4B] appearance-none bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-calendlyBlue/20 focus:border-calendlyBlue transition-all"
                  >
                    {DURATION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
                <button className="flex items-center gap-1.5 text-[13px] font-medium text-calendlyBlue hover:text-calendlyBlueHover transition-colors self-start">
                  <Plus size={14} strokeWidth={2.5} />
                  Add duration option
                  <ChevronDown size={14} />
                </button>
              </div>
            </PanelSection>

            {/* ─── Location ─────────────────────────────── */}
            <PanelSection title="Location" isExpanded={false}>
              <div className="flex items-center gap-2.5 py-1">
                <AlertCircle size={18} className="text-amber-500 flex-shrink-0" />
                <span className="text-[14px] text-[#5A6B80]">No location set</span>
              </div>
              <div className="mt-3 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-[13px] text-amber-700">
                  Location is currently not supported. This feature will be available in a future update.
                </p>
              </div>
            </PanelSection>

            {/* ─── Availability ─────────────────────────── */}
            <PanelSection title="Availability" isExpanded={false}>
              <div className="flex flex-col gap-4">
                {/* Schedule selector */}
                {schedules.length > 1 && (
                  <div className="relative">
                    <select
                      value={scheduleId}
                      onChange={(e) => setScheduleId(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[15px] text-[#1D2A4B] appearance-none bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-calendlyBlue/20 focus:border-calendlyBlue transition-all"
                    >
                      {schedules.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={18}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                )}

                {/* Summary text */}
                <p className="text-[14px] text-[#5A6B80]">
                  {availabilitySummary}
                </p>

                {/* Weekly breakdown */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                  <div className="flex items-center gap-2 mb-3 text-[13px] font-medium text-[#1D2A4B]">
                    <Calendar size={14} />
                    Weekly hours
                  </div>
                  <div className="flex flex-col gap-2">
                    {weeklyBreakdown.map((d) => (
                      <div key={d.day} className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold ${
                            d.available
                              ? "bg-calendlyBlue text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {d.label[0]}
                        </div>
                        <span
                          className={`text-[13px] ${
                            d.available ? "text-[#1D2A4B]" : "text-gray-400"
                          }`}
                        >
                          {d.times}
                        </span>
                      </div>
                    ))}
                  </div>
                  {selectedSchedule?.timezone && (
                    <p className="mt-3 text-[12px] text-calendlyBlue font-medium">
                      {selectedSchedule.timezone.replace(/_/g, " ")}
                    </p>
                  )}
                </div>
              </div>
            </PanelSection>

            {/* ─── Host ─────────────────────────────────── */}
            <PanelSection title="Host" isExpanded={false}>
              <div className="flex items-center gap-3 py-1">
                <div className="w-8 h-8 rounded-full bg-calendlyBlue text-white flex items-center justify-center text-[14px] font-semibold uppercase flex-shrink-0">
                  {userName[0]}
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium text-[#1D2A4B]">
                    {userName} <span className="text-[#5A6B80] font-normal">(you)</span>
                  </span>
                  <span className="text-[12px] text-[#5A6B80]">
                    /{userSlug}/{slug || "meeting"}
                  </span>
                </div>
              </div>
            </PanelSection>

            {/* ─── More Options (expanded inline) ──────── */}
            {showMoreOptions && (
              <>
                {/* Buffer times */}
                <PanelSection title="Limits and buffers" isExpanded={true}>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[13px] font-semibold text-[#1D2A4B]">
                        Buffer time before event
                      </span>
                      <div className="relative">
                        <select
                          value={bufferBefore}
                          onChange={(e) => setBufferBefore(Number(e.target.value))}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[15px] text-[#1D2A4B] appearance-none bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-calendlyBlue/20 focus:border-calendlyBlue transition-all"
                        >
                          {BUFFER_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={18}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[13px] font-semibold text-[#1D2A4B]">
                        Buffer time after event
                      </span>
                      <div className="relative">
                        <select
                          value={bufferAfter}
                          onChange={(e) => setBufferAfter(Number(e.target.value))}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[15px] text-[#1D2A4B] appearance-none bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-calendlyBlue/20 focus:border-calendlyBlue transition-all"
                        >
                          {BUFFER_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={18}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                      </div>
                    </div>
                  </div>
                </PanelSection>

                {/* Booking questions */}
                <PanelSection title="Booking questions" isExpanded={true}>
                  <div className="flex flex-col gap-3">
                    {questions.length > 0 && (
                      <div className="flex flex-col gap-2">
                        {questions.map((q, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 bg-gray-50/50"
                          >
                            <span className="text-[14px] text-[#1D2A4B]">{q.label}</span>
                            <button
                              onClick={() => handleRemoveQuestion(idx)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        value={newQuestionLabel}
                        onChange={(e) => setNewQuestionLabel(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddQuestion()}
                        placeholder="Add a question..."
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-calendlyBlue/20 focus:border-calendlyBlue transition-all"
                      />
                      <button
                        onClick={handleAddQuestion}
                        disabled={!newQuestionLabel.trim()}
                        className="px-4 py-2.5 bg-calendlyBlue hover:bg-calendlyBlueHover text-white rounded-lg text-[13px] font-semibold transition-colors disabled:opacity-40"
                      >
                        Add
                      </button>
                    </div>
                    <p className="text-[12px] text-[#5A6B80]">
                      Questions will be shown to invitees when booking this event.
                    </p>
                  </div>
                </PanelSection>
              </>
            )}

            {error && (
              <p className="text-sm text-red-600 mt-4">{error}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <PanelFooter
          onMoreOptions={() => setShowMoreOptions((v) => !v)}
          onSubmit={handleSubmit}
          submitting={submitting}
          showMoreOptions={!showMoreOptions}
        />
      </div>
    </>
  );
};

export default CreateEventPanel;
