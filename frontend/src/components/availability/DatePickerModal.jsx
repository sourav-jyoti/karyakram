"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X, Plus } from "lucide-react";

const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const DatePickerModal = ({ onClose, onApply }) => {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDates, setSelectedDates] = useState([]);

  // Availability times state for selected dates
  const [isAvailable, setIsAvailable] = useState(true);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthName = new Date(viewYear, viewMonth).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const toggleDate = (day) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dateObj = new Date(viewYear, viewMonth, day);
    if (dateObj < today) return; // Don't allow past dates

    setSelectedDates((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
    );
  };

  const isSelected = (day) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return selectedDates.includes(dateStr);
  };

  const isPast = (day) => {
    const dateObj = new Date(viewYear, viewMonth, day);
    return dateObj < today;
  };

  const isToday = (day) => {
    return viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate();
  };

  const handleApply = () => {
    onApply(selectedDates, {
      is_unavailable: !isAvailable,
      start_time: isAvailable ? startTime : undefined,
      end_time: isAvailable ? endTime : undefined,
    });
  };

  // Check if prev month button should be disabled (don't go before current month)
  const canGoPrev = viewYear > now.getFullYear() || (viewYear === now.getFullYear() && viewMonth > now.getMonth());

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-50"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[420px] bg-white rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-200">
        {/* Header */}
        <div className="px-8 pt-7 pb-2">
          <h2 className="text-[18px] font-bold text-[#1D2A4B] leading-snug">
            Select the date(s) you want to<br />assign specific hours
          </h2>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between px-8 py-3">
          <span className="text-[15px] font-semibold text-[#1D2A4B]">
            {monthName}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              disabled={!canGoPrev}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} className="text-gray-500" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-full bg-calendlyBlue hover:bg-calendlyBlueHover transition-colors"
            >
              <ChevronRight size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 px-8">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="text-center text-[11px] font-semibold text-[#5A6B80] tracking-wider py-1.5"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 px-8 pb-4">
          {/* Empty cells for days before the 1st */}
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`empty-${i}`} className="h-10" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const past = isPast(day);
            const selected = isSelected(day);
            const todayMark = isToday(day);

            return (
              <button
                key={day}
                onClick={() => toggleDate(day)}
                disabled={past}
                className={`
                  h-10 w-10 mx-auto rounded-full flex items-center justify-center
                  text-[14px] font-medium transition-all
                  ${past
                    ? "text-gray-300 cursor-not-allowed"
                    : selected
                      ? "bg-calendlyBlue text-white font-bold shadow-sm"
                      : todayMark
                        ? "ring-2 ring-calendlyBlue text-calendlyBlue font-bold hover:bg-blue-50"
                        : "text-[#1D2A4B] hover:bg-gray-100 cursor-pointer"
                  }
                `}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* What hours are you available? Section */}
        {selectedDates.length > 0 && (
          <div className="border-t border-gray-200 px-8 py-5 bg-gray-50/50">
            <h3 className="text-[14px] font-semibold text-[#1D2A4B] mb-3">
              What hours are you available?
            </h3>
            {isAvailable ? (
              <div className="flex items-center gap-3">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-[110px] border border-gray-300 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-calendlyBlue/20 focus:border-calendlyBlue bg-white text-[#1D2A4B]"
                />
                <span className="text-gray-400 font-medium">-</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-[110px] border border-gray-300 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-calendlyBlue/20 focus:border-calendlyBlue bg-white text-[#1D2A4B]"
                />
                <button
                  type="button"
                  onClick={() => setIsAvailable(false)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Mark unavailable"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between border border-dashed border-gray-300 rounded-lg px-4 py-2 bg-white">
                <span className="text-[13px] text-gray-500 font-medium">Unavailable</span>
                <button
                  type="button"
                  onClick={() => setIsAvailable(true)}
                  className="p-1.5 bg-calendlyBlue text-white rounded-full hover:bg-calendlyBlueHover transition-colors"
                  title="Add hours"
                >
                  <Plus size={14} strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-[14px] font-semibold text-[#1D2A4B] border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={selectedDates.length === 0}
            className="px-8 py-2.5 text-[14px] font-semibold text-white bg-calendlyBlue hover:bg-calendlyBlueHover rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
};

export default DatePickerModal;
