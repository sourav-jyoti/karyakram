import React from 'react';

const MeetingsDateHeader = ({ date }) => {
  return (
    <div className="px-6 py-4 border-b border-gray-200 bg-white">
      <span className="text-[14px] text-calendlyText font-semibold">{date}</span>
    </div>
  );
};

export default MeetingsDateHeader;
