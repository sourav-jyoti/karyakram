"use client";

import React, { useEffect, useState } from "react";
import { RefreshCw, ChevronDown, Globe } from "lucide-react";
import DayRow from "./DayRow";
import { dayLabel } from "@/lib/format";

const COMMON_TIMEZONES = [
  "Asia/Kolkata",
  "Asia/Colombo",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Pacific/Auckland",
];

function formatTimezone(tz) {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const time = formatter.format(now);
    const label = tz.replace(/_/g, " ").replace(/\//g, ", ");
    return `${label} (${time})`;
  } catch {
    return tz;
  }
}

const WeeklyHours = ({ schedule, saving, onSaveRules, onTimezoneChange }) => {
  const [rules, setRules] = useState([]);
  const [selectedTimezone, setSelectedTimezone] = useState(schedule?.timezone ?? "Asia/Kolkata");

  useEffect(() => {
    setRules(schedule?.rules?.length ? [...schedule.rules] : []);
    if (schedule?.timezone) setSelectedTimezone(schedule.timezone);
  }, [schedule]);

  const ruleForDay = (day) =>
    rules.find((r) => r.day_of_week === day);

  const toggleDay = (day) => {
    const existing = ruleForDay(day);
    let next;
    if (existing) {
      next = rules.filter((r) => r.day_of_week !== day);
    } else {
      next = [
        ...rules,
        { day_of_week: day, start_time: "09:00", end_time: "17:00" },
      ].sort((a, b) => a.day_of_week - b.day_of_week);
    }
    setRules(next);
    onSaveRules?.(next);
  };

  const updateTimes = (day, start_time, end_time) => {
    const next = rules.map((r) =>
      r.day_of_week === day ? { ...r, start_time, end_time } : r
    );
    setRules(next);
    onSaveRules?.(next);
  };

  const handleTimezoneChange = (tz) => {
    setSelectedTimezone(tz);
    onTimezoneChange?.(tz);
  };

  return (
    <div className="flex flex-col border-r border-gray-200 pr-12 py-8 flex-1">
      <div className="flex items-center gap-2 text-[15px] font-bold text-calendlyText mb-1">
        <RefreshCw size={18} strokeWidth={2.5} className="text-calendlyText" />{" "}
        Weekly hours
        {saving && (
          <span className="text-[13px] font-normal text-calendlyGrayText ml-2">
            Saving…
          </span>
        )}
      </div>
      <div className="text-[14px] text-calendlyGrayText mb-8 font-medium">
        Set when you are typically available for meetings
      </div>

      <div className="flex flex-col gap-1">
        {[0, 1, 2, 3, 4, 5, 6].map((day) => {
          const rule = ruleForDay(day);
          return (
            <DayRow
              key={day}
              day={dayLabel(day)}
              isAvailable={!!rule}
              startTime={rule?.start_time ?? "09:00"}
              endTime={rule?.end_time ?? "17:00"}
              onToggle={() => toggleDay(day)}
              onTimeChange={(start, end) => updateTimes(day, start, end)}
            />
          );
        })}
      </div>

      {/* Timezone dropdown */}
      <div className="mt-8 flex items-center gap-2">
        <Globe size={16} className="text-calendlyBlue flex-shrink-0" />
        <div className="relative flex-1">
          <select
            value={selectedTimezone}
            onChange={(e) => handleTimezoneChange(e.target.value)}
            className="w-full text-[14px] font-semibold text-calendlyBlue bg-transparent border-none outline-none cursor-pointer appearance-none pr-6 hover:text-calendlyBlueHover transition-colors"
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {formatTimezone(tz)}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-calendlyBlue pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
};

export default WeeklyHours;
