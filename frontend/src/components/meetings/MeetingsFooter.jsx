import React from "react";

const MeetingsFooter = ({ count = 0 }) => {
  return (
    <div className="px-6 py-4 text-[13px] text-calendlyGrayText border-t border-gray-100">
      {count} meeting{count === 1 ? "" : "s"}
    </div>
  );
};

export default MeetingsFooter;
