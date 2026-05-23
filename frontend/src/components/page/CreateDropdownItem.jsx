import React from 'react';
import { ArrowRight } from 'lucide-react';

const CreateDropdownItem = ({ title, host, invitee, description, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-start px-5 py-3 hover:bg-gray-50 text-left w-full transition-colors group"
    >
      <span className="font-bold text-[#005be6] text-[15px]">{title}</span>
      {host && invitee && (
        <div className="flex items-center gap-2 text-[14px] text-[#1D2A4B] mt-1">
          <span>{host}</span>
          <ArrowRight size={14} className="text-[#1D2A4B]" strokeWidth={1.5} />
          <span>{invitee}</span>
        </div>
      )}
      <span className="text-[14px] text-[#5A6B80] mt-0.5 transition-colors">
        {description}
      </span>
    </button>
  );
};

export default CreateDropdownItem;
