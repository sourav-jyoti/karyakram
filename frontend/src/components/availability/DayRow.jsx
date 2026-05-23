"use client";

import React from "react";
import { Plus, X } from "lucide-react";
import { formatTime12 } from "@/lib/format";

const DayRow = ({
  day,
  isAvailable,
  startTime = "09:00",
  endTime = "17:00",
  onToggle,
  onTimeChange,
}) => {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="w-8 h-8 rounded-full bg-calendlyText text-white flex items-center justify-center text-[13px] font-bold flex-shrink-0">
        {day}
      </div>

      {isAvailable ? (
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={startTime.slice(0, 5)}
              onChange={(e) => onTimeChange?.(e.target.value, endTime)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-[14px] font-medium"
            />
            <span className="text-gray-400">-</span>
            <input
              type="time"
              value={endTime.slice(0, 5)}
              onChange={(e) => onTimeChange?.(startTime, e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-[14px] font-medium"
            />
          </div>
          <span className="text-[13px] text-calendlyGrayText hidden sm:inline">
            {formatTime12(startTime)} – {formatTime12(endTime)}
          </span>
          <button
            type="button"
            onClick={onToggle}
            className="text-calendlyGrayText hover:text-calendlyText ml-2"
            title="Mark unavailable"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4 flex-1 text-[14px] text-gray-400">
          <span className="w-[195px]">Unavailable</span>
          <button
            type="button"
            onClick={onToggle}
            className="text-calendlyGrayText hover:text-calendlyText ml-2"
            title="Add hours"
          >
            <Plus size={18} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DayRow;
