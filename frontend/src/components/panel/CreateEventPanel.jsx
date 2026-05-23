"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import PanelHeader from "./PanelHeader";
import PanelFooter from "./PanelFooter";
import { slugify } from "@/lib/format";

const CreateEventPanel = ({ type, schedules = [], onClose, onCreate }) => {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [scheduleId, setScheduleId] = useState(schedules[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleTitleChange = (value) => {
    setTitle(value);
    if (!slug || slug === slugify(title)) setSlug(slugify(value));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !slug.trim()) {
      setError("Title and URL slug are required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onCreate({
        title: title.trim(),
        slug: slug.trim(),
        durationMinutes: Number(durationMinutes),
        scheduleId,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create");
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
        aria-hidden
      />
      <div className="fixed top-0 right-0 h-full w-[460px] bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.08)] z-50 flex flex-col border-l border-gray-200">
        <div className="px-6 py-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-10 pb-28">
          <PanelHeader type={type} />

          <div className="flex flex-col gap-6 mt-8">
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold text-calendlyText">
                Event name
              </span>
              <input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-[15px]"
                placeholder="30 Minute Meeting"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold text-calendlyText">
                URL slug
              </span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-[15px]"
                placeholder="30min"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold text-calendlyText">
                Duration (minutes)
              </span>
              <input
                type="number"
                min={5}
                step={5}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-[15px] w-32"
              />
            </label>

            {schedules.length > 0 && (
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-semibold text-calendlyText">
                  Availability schedule
                </span>
                <select
                  value={scheduleId}
                  onChange={(e) => setScheduleId(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-[15px]"
                >
                  {schedules.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.timezone})
                    </option>
                  ))}
                </select>
              </label>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </div>

        <PanelFooter
          onClose={onClose}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      </div>
    </>
  );
};

export default CreateEventPanel;
