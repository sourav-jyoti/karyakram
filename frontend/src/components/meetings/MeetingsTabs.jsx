import React from "react";

const MeetingsTabs = ({ period = "upcoming", onPeriodChange }) => {
  const tabClass = (active) =>
    `pb-3 text-[14px] font-medium transition-colors border-b-2 ${
      active
        ? "font-bold text-calendlyText border-calendlyBlue"
        : "text-calendlyGrayText hover:text-calendlyText border-transparent"
    }`;

  return (
    <div className="flex items-center gap-8 pt-4 px-6">
      <button
        type="button"
        className={tabClass(period === "upcoming")}
        onClick={() => onPeriodChange?.("upcoming")}
      >
        Upcoming
      </button>
      <button
        type="button"
        className={tabClass(period === "past")}
        onClick={() => onPeriodChange?.("past")}
      >
        Past
      </button>
    </div>
  );
};

export default MeetingsTabs;
