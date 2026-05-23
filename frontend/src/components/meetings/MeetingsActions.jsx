import React from 'react';
import { Upload, Filter, ChevronDown } from 'lucide-react';

const MeetingsActions = () => {
  return (
    <div className="flex items-center gap-3 pr-6 pb-2.5">
      <button className="flex items-center gap-2 px-4 py-1.5 border border-gray-300 rounded-full text-[14px] font-semibold text-calendlyText hover:bg-gray-50 transition-colors bg-white shadow-sm">
        <Upload size={16} strokeWidth={2} />
        Export
      </button>
      <button className="flex items-center gap-2 px-4 py-1.5 border border-gray-300 rounded-full text-[14px] font-semibold text-calendlyText hover:bg-gray-50 transition-colors bg-white shadow-sm">
        <Filter size={16} strokeWidth={2} />
        Filter <ChevronDown size={16} className="ml-0.5" strokeWidth={2} />
      </button>
    </div>
  );
};

export default MeetingsActions;
