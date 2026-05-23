import React from 'react';
import CreateDropdownItem from './CreateDropdownItem';

const CreateDropdown = ({ onSelect }) => {
  return (
    <div className="absolute top-12 right-0 w-[350px] bg-white border border-gray-200 rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.1)] z-50 py-2 flex flex-col overflow-hidden">
      <div className="px-5 py-3 font-bold text-[#304859] text-[14px]">
        Event type
      </div>
      
      <CreateDropdownItem 
        title="One-on-One"
        host="1 host"
        invitee="1 invitee"
        description="Good for coffee chats, 1:1 interviews, etc."
        onClick={() => onSelect('One-on-One')}
      />
      <CreateDropdownItem 
        title="Group"
        host="1 host"
        invitee="Multiple invitees"
        description="Webinars, online classes, etc."
        onClick={() => onSelect('Group')}
      />
    </div>
  );
};

export default CreateDropdown;
