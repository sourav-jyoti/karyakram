import React, { useState } from 'react';
import { ChevronDown, Info, Globe } from 'lucide-react';

const TIMEZONE_OPTIONS = [
  { value: "Asia/Kolkata", label: "India Standard Time" },
  { value: "America/New_York", label: "Eastern Standard Time" },
  { value: "America/Los_Angeles", label: "Pacific Standard Time" },
  { value: "Europe/London", label: "Greenwich Mean Time" },
  { value: "Asia/Singapore", label: "Singapore Standard Time" },
  { value: "Europe/Paris", label: "Central European Time" },
];

const MeetingsFilters = ({ selectedTimezone, onTimezoneChange }) => {
  const [showBuffers, setShowBuffers] = useState(true);
  const [isTzDropdownOpen, setIsTzDropdownOpen] = useState(false);

  const getActiveTzLabel = () => {
    return TIMEZONE_OPTIONS.find((t) => t.value === selectedTimezone)?.label ?? selectedTimezone;
  };

  const getTimezoneTimeStr = (tzId) => {
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: tzId,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      return formatter.format(new Date()).toLowerCase().replace(/\s/g, "");
    } catch (e) {
      return "";
    }
  };

  return (
    <div className="flex items-center justify-between w-full mb-4">
      <div className="flex items-center gap-6">
        <button className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-lg text-[14px] font-semibold text-calendlyText hover:border-gray-400 transition-colors bg-white shadow-sm focus:outline-none cursor-pointer">
          My Calendly <ChevronDown size={16} className="text-gray-500" />
        </button>
        
        {/* Toggle Buffers */}
        <div className="flex items-center gap-2 text-[14px] text-calendlyText">
          <span className="font-semibold">Show buffers</span>
          <Info size={16} className="text-gray-400" />
          <div 
            className={`w-10 h-5 rounded-full relative flex items-center cursor-pointer ml-1 transition-colors ${showBuffers ? 'bg-calendlyBlue' : 'bg-gray-300'}`}
            onClick={() => setShowBuffers(!showBuffers)}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute transition-transform ${showBuffers ? 'translate-x-[22px]' : 'translate-x-[2px]'}`}></div>
          </div>
        </div>

        {/* Timezone Dropdown in Filters */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsTzDropdownOpen(!isTzDropdownOpen)}
            className="flex items-center gap-2 text-[14px] font-semibold text-calendlyText hover:text-calendlyBlue transition-colors focus:outline-none cursor-pointer px-3 py-2 border border-gray-200 rounded-lg bg-white shadow-sm"
          >
            <Globe size={15} className="text-gray-500" />
            <span>{getActiveTzLabel()} ({getTimezoneTimeStr(selectedTimezone)})</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isTzDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isTzDropdownOpen && (
            <div className="absolute left-0 top-full mt-1 w-[290px] bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1.5 max-h-[220px] overflow-y-auto">
              {TIMEZONE_OPTIONS.map((tz) => (
                <button
                  key={tz.value}
                  type="button"
                  onClick={() => {
                    onTimezoneChange(tz.value);
                    setIsTzDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-[13px] font-bold transition-colors hover:bg-gray-50 flex items-center justify-between cursor-pointer
                    ${selectedTimezone === tz.value ? 'text-calendlyBlue bg-blue-50/20' : 'text-[#1D2A4B]'}
                  `}
                >
                  <span>{tz.label}</span>
                  <span className="text-[11px] text-gray-400">({getTimezoneTimeStr(tz.value)})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="text-[13px] text-calendlyGrayText font-semibold">
        Displaying 1 of 1 Events
      </div>
    </div>
  );
};

export default MeetingsFilters;
