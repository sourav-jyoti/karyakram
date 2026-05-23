import React from "react";
import { Calendar } from "lucide-react";
import { formatTime12 } from "@/lib/format";

const DateSpecificHours = ({ overrides = [] }) => {
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
      </div>

      <ul className="mt-6 flex flex-col gap-2">
        {overrides.length === 0 ? (
          <li className="text-[14px] text-calendlyGrayText">No overrides set.</li>
        ) : (
          overrides.map((o) => (
            <li
              key={o.id}
              className="text-[14px] text-calendlyText border border-gray-200 rounded-md px-3 py-2"
            >
              {o.override_date.slice(0, 10)}:{" "}
              {o.is_unavailable
                ? "Unavailable"
                : `${formatTime12(o.start_time ?? "")} – ${formatTime12(o.end_time ?? "")}`}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default DateSpecificHours;
