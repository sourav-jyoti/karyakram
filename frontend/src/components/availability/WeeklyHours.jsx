"use client";

import React, { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import DayRow from "./DayRow";
import { dayLabel } from "@/lib/format";

const WeeklyHours = ({ schedule, saving, onSaveRules }) => {
  const [rules, setRules] = useState([]);

  useEffect(() => {
    setRules(schedule?.rules?.length ? [...schedule.rules] : []);
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

      <div className="mt-8 text-[14px] font-semibold text-calendlyText">
        {schedule?.timezone ?? "—"}
      </div>
    </div>
  );
};

export default WeeklyHours;
