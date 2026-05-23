import React from 'react';

const PanelHeader = ({ type }) => {
  return (
    <div className="flex flex-col gap-1.5 mt-2">
      <span className="text-[13px] text-[#5A6B80] font-medium tracking-wide">Event type</span>
      <div className="flex items-center gap-3 mt-2">
        <div className="w-4 h-4 rounded-full bg-calendlyPurple"></div>
        <h2 className="text-[22px] font-bold text-[#1D2A4B] leading-none">New Meeting</h2>
      </div>
      <span className="text-[15px] text-[#5A6B80] mt-1.5 font-medium">{type}</span>
    </div>
  );
};

export default PanelHeader;
