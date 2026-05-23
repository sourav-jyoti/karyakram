import React from 'react';

const AvailabilityTabs = () => {
  return (
    <div className="flex items-center gap-8 px-1 border-b border-gray-200 w-full mb-6">
      <button className="pb-3 text-[14px] font-bold text-calendlyText border-b-2 border-calendlyBlue">
        Schedules
      </button>
      <button className="pb-3 text-[14px] font-medium text-calendlyGrayText hover:text-calendlyText transition-colors border-b-2 border-transparent">
        Calendar settings
      </button>
      <button className="pb-3 text-[14px] font-medium text-calendlyGrayText hover:text-calendlyText transition-colors border-b-2 border-transparent">
        Advanced settings
      </button>
    </div>
  );
};

export default AvailabilityTabs;
