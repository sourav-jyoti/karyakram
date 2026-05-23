import React from "react";
import { ChevronDown, List } from "lucide-react";

const ScheduleHeader = ({ schedules = [], selected, onSelect }) => {
  return (
    <div className="flex items-start justify-between px-8 py-6 border-b border-gray-200">
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-calendlyText">
          Schedule
        </span>
        {schedules.length > 1 ? (
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
        ) : (
          <span className="text-[18px] font-bold text-calendlyBlue">
            {selected?.name ?? "—"}
          </span>
        )}
        <div className="text-[13px] font-semibold text-calendlyGrayText mt-1">
          Timezone: {selected?.timezone ?? "—"}
        </div>
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
  );
};

export default ScheduleHeader;
