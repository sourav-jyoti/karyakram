"use client";

import React from "react";
import { formatTimeRange } from "@/lib/format";

const MeetingItem = ({ meeting, onCancel }) => {
  const invitee = meeting.invitees?.[0];
  const initials = invitee?.name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-12 w-full max-w-4xl">
        <div className="flex items-center gap-4 min-w-[200px]">
          <div className="w-[18px] h-[18px] rounded-full bg-calendlyPurple" />
          <span className="text-[14px] text-calendlyGrayText">
            {formatTimeRange(meeting.start_at, meeting.end_at)}
          </span>
        </div>

        <div className="flex items-center gap-4 min-w-[250px]">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[13px] font-bold text-gray-700">
            {initials}
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] text-calendlyText">
              {invitee?.name ?? "—"}
            </span>
            <span className="text-[13px] text-calendlyGrayText">
              Event type{" "}
              <span className="font-bold text-calendlyText">
                {meeting.event_type?.title}
              </span>
            </span>
          </div>
        </div>

        <div className="text-[13px] text-calendlyGrayText capitalize">
          {meeting.status}
        </div>
      </div>

      {meeting.status === "confirmed" && onCancel && (
        <button
          type="button"
          onClick={() => onCancel(meeting.id)}
          className="text-[14px] font-medium text-red-600 hover:underline"
        >
          Cancel
        </button>
      )}
    </div>
  );
};

export default MeetingItem;
