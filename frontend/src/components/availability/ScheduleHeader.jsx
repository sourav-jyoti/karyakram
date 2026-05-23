import React from "react";
import { ChevronDown, List, Info } from "lucide-react";

const ScheduleHeader = ({ schedules = [], selected, onSelect }) => {
  return (
    <div className="flex flex-col px-8 py-6 border-b border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-calendlyText">
            Schedule
          </span>
          {schedules.length > 1 ? (
            <div className="flex items-center gap-1">
              <select
                value={selected?.id ?? ""}
                onChange={(e) => onSelect?.(e.target.value)}
                className="text-[18px] font-bold text-calendlyBlue bg-transparent border-none outline-none cursor-pointer"
              >
                {schedules.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="text-calendlyBlue" />
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-[18px] font-bold text-calendlyBlue">
                {selected?.name ?? "Working hours"}{" "}
                <span className="text-[14px] font-normal text-calendlyGrayText">(default)</span>
              </span>
              <ChevronDown size={16} className="text-calendlyBlue mt-0.5" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center bg-gray-100 rounded-md p-1 border border-gray-200">
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-1.5 bg-white rounded shadow-sm text-[13px] font-semibold text-calendlyText"
            >
              <List size={16} /> List
            </button>
          </div>
        </div>
      </div>

      {/* Note about single default schedule */}
      <div className="mt-4 flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        <Info size={16} className="text-calendlyBlue flex-shrink-0 mt-0.5" />
        <p className="text-[13px] text-[#1D2A4B] leading-relaxed">
          Currently only one default schedule is available for every event type. 
          Particular dates can be modified using <strong>Date-specific hours</strong>.
        </p>
      </div>
    </div>
  );
};

export default ScheduleHeader;
