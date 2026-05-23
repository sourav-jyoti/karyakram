import React from 'react';

const MenuItem = ({ icon: Icon, label, subtext, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-start px-4 py-2 hover:bg-gray-50 text-calendlyText text-left w-full transition-colors"
    >
      <div className="flex items-center gap-3 w-full">
        <Icon size={16} className="text-calendlyGrayText" /> 
        <span>{label}</span>
      </div>
      {subtext && (
        <span className="text-gray-500 pl-7 text-[13px] mt-0.5">{subtext}</span>
      )}
    </button>
  );
};

export default MenuItem;
