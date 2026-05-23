"use client";

import React, { useState } from "react";
import { Calendar, Plus, X, Clock } from "lucide-react";
import { formatTime12 } from "@/lib/format";
import DatePickerModal from "./DatePickerModal";

const DateSpecificHours = ({ overrides = [], scheduleId, onCreateOverrides, onDeleteOverride }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleApplyDates = async (dates, config) => {
    setShowDatePicker(false);
    if (dates.length > 0 && onCreateOverrides) {
      await onCreateOverrides(dates, config);
    }
  };

  return (
    <div className="flex flex-col py-8 pl-12 flex-1">
      <div className="flex items-start justify-between w-full">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[15px] font-bold text-calendlyText mb-1">
            <Calendar size={18} strokeWidth={2.5} className="text-calendlyText" />{" "}
            Date-specific hours
          </div>
          <div className="text-[14px] text-calendlyGrayText font-medium">
            Adjust hours for specific days
          </div>
        </div>

        {/* + Hours button */}
        <button
          onClick={() => setShowDatePicker(true)}
          className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-full text-[13px] font-semibold text-[#1D2A4B] hover:bg-gray-50 hover:border-gray-400 transition-all"
        >
          <Plus size={14} strokeWidth={2.5} />
          Hours
        </button>
      </div>

      <ul className="mt-6 flex flex-col gap-2">
        {overrides.length === 0 ? (
          <li className="text-[14px] text-calendlyGrayText py-4 text-center border border-dashed border-gray-200 rounded-lg">
            No date-specific overrides set.
            <br />
            <span className="text-[12px]">Click "+ Hours" to add specific dates.</span>
          </li>
        ) : (
          overrides.map((o) => (
            <li
              key={o.id}
              className="flex items-center justify-between text-[14px] text-calendlyText border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-calendlyGrayText" />
                <div className="flex flex-col">
                  <span className="font-medium">
                    {new Date(o.override_date + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-[13px] text-calendlyGrayText">
                    {o.is_unavailable
                      ? "Unavailable"
                      : `${formatTime12(o.start_time ?? "")} – ${formatTime12(o.end_time ?? "")}`}
                  </span>
                </div>
              </div>
              {onDeleteOverride && (
                <button
                  onClick={() => onDeleteOverride(o.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-red-50"
                  title="Remove override"
                >
                  <X size={16} />
                </button>
              )}
            </li>
          ))
        )}
      </ul>

      {/* Date picker modal */}
      {showDatePicker && (
        <DatePickerModal
          onClose={() => setShowDatePicker(false)}
          onApply={handleApplyDates}
        />
      )}
    </div>
  );
};

export default DateSpecificHours;
