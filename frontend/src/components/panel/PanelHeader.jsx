import React, { useRef, useEffect } from 'react';

const PanelHeader = ({ type, title, onTitleChange }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  return (
    <div className="flex flex-col gap-1.5 mt-2">
      <span className="text-[13px] text-[#5A6B80] font-medium tracking-wide">Event type</span>
      <div className="flex items-center gap-3 mt-2">
        <div className="w-4 h-4 rounded-full bg-calendlyPurple flex-shrink-0"></div>
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="New Meeting"
          className="text-[22px] font-bold text-[#1D2A4B] leading-none bg-transparent border-none outline-none w-full placeholder:text-gray-300 focus:border-b-2 focus:border-calendlyBlue transition-colors"
        />
      </div>
      <span className="text-[15px] text-[#5A6B80] mt-1.5 font-medium">{type}</span>
    </div>
  );
};

export default PanelHeader;
