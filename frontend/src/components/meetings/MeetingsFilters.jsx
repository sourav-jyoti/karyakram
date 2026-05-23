import React, { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';

const MeetingsFilters = () => {
  const [showBuffers, setShowBuffers] = useState(true);

  return (
    <div className="flex items-center justify-between w-full mb-4">
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-lg text-[14px] font-medium text-calendlyText hover:border-gray-400 transition-colors bg-white shadow-sm">
          My Calendly <ChevronDown size={16} className="text-gray-500" />
        </button>
        
        <div className="flex items-center gap-2 text-[14px] text-calendlyText ml-2">
          <span className="font-medium">Show buffers</span>
          <Info size={16} className="text-gray-400" />
          <div 
            className={`w-10 h-5 rounded-full relative flex items-center cursor-pointer ml-1 transition-colors ${showBuffers ? 'bg-calendlyBlue' : 'bg-gray-300'}`}
            onClick={() => setShowBuffers(!showBuffers)}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute transition-transform ${showBuffers ? 'translate-x-[22px]' : 'translate-x-[2px]'}`}></div>
          </div>
        </div>
      </div>
      
      <div className="text-[13px] text-calendlyGrayText font-medium">
        Displaying 1 of 1 Events
      </div>
    </div>
  );
};

export default MeetingsFilters;
