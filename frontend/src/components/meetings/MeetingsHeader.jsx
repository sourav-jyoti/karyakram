import React from 'react';
import { HelpCircle } from 'lucide-react';

const MeetingsHeader = () => {
  return (
    <div className="flex items-center gap-2 mb-6">
      <h1 className="text-[26px] font-bold text-calendlyText">Meetings</h1>
      <button className="text-calendlyGrayText hover:text-calendlyText transition-colors mt-2">
        <HelpCircle size={18} />
      </button>
    </div>
  );
};

export default MeetingsHeader;
