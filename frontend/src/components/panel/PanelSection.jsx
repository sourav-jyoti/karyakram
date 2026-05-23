import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const PanelSection = ({ title, children, isExpanded: initialExpanded }) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  return (
    <div className="w-full border-t border-gray-200 py-5">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left focus:outline-none group"
      >
        <span className="text-[16px] font-bold text-[#1D2A4B] group-hover:text-calendlyBlue transition-colors">{title}</span>
        {isExpanded ? (
          <ChevronUp size={20} className="text-gray-500 group-hover:text-calendlyBlue transition-colors" />
        ) : (
          <ChevronDown size={20} className="text-gray-500 group-hover:text-calendlyBlue transition-colors" />
        )}
      </button>
      
      {isExpanded && (
        <div className="mt-4 w-full animate-in slide-in-from-top-1 fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

export default PanelSection;
