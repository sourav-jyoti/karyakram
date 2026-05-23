import React from 'react';
import { AlertCircle } from 'lucide-react';

const EventMeta = ({ duration, location, isLocationWarning, type }) => {
  return (
    <div className="flex items-center gap-1.5 text-[15px] text-calendlyGrayText mt-1">
      <span>{duration}</span>
      <span>•</span>
      {isLocationWarning ? (
        <span className="flex items-center gap-1 text-[#d89000]">
          <AlertCircle size={15} className="fill-[#ffbb00] text-white" />
          {location}
        </span>
      ) : (
        <span>{location}</span>
      )}
      <span>•</span>
      <span>{type}</span>
    </div>
  );
};

export default EventMeta;
