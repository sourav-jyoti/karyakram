import React from 'react';

const LocationButton = ({ icon: Icon, label }) => {
  return (
    <button className="flex flex-col items-center justify-center gap-2.5 border border-gray-200 rounded-lg p-3 hover:border-gray-400 hover:bg-gray-50 transition-all bg-white h-[90px]">
      <Icon size={22} className="text-gray-600" strokeWidth={1.5} />
      <span className="text-[12px] font-medium text-calendlyText text-center leading-tight">{label}</span>
    </button>
  );
};

export default LocationButton;
