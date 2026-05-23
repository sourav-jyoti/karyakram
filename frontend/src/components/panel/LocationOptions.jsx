import React from 'react';
import { Video, Phone, MapPin, ChevronDown } from 'lucide-react';
import LocationButton from './LocationButton';

const LocationOptions = () => {
  return (
    <div className="grid grid-cols-4 gap-3 mb-2">
      <LocationButton icon={Video} label="Zoom" />
      <LocationButton icon={Phone} label="Phone call" />
      <LocationButton icon={MapPin} label="In-person" />
      <LocationButton icon={ChevronDown} label="All options" />
    </div>
  );
};

export default LocationOptions;
