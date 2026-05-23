import React from "react";
import MeetingsTabs from "./MeetingsTabs";
import MeetingsActions from "./MeetingsActions";
import MeetingsDateHeader from "./MeetingsDateHeader";
import MeetingItem from "./MeetingItem";
import MeetingsFooter from "./MeetingsFooter";

const MeetingsList = ({
  period,
  onPeriodChange,
  grouped = {},
  loading,
  onCancel,
}) => {
  const dates = Object.keys(grouped);
  const total = dates.reduce((n, d) => n + grouped[d].length, 0);

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.05)] mt-6 flex flex-col">
      <div className="flex items-end justify-between border-b border-gray-200 bg-white rounded-t-lg pt-1">
        <MeetingsTabs period={period} onPeriodChange={onPeriodChange} />
        <MeetingsActions />
      </div>

      {loading ? (
        <p className="px-6 py-8 text-calendlyGrayText">Loading meetings…</p>
      ) : total === 0 ? (
        <p className="px-6 py-8 text-calendlyGrayText">
          No {period === "past" ? "past" : "upcoming"} meetings.
        </p>
      ) : (
        dates.map((date) => (
          <div key={date}>
            <MeetingsDateHeader date={date} />
            {grouped[date].map((meeting) => (
              <MeetingItem
                key={meeting.id}
                meeting={meeting}
                onCancel={onCancel}
              />
            ))}
          </div>
        ))
      )}

      <MeetingsFooter count={total} />
    </div>
  );
};

export default MeetingsList;
