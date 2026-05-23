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
      <CreateDropdownItem 
        title="Round robin"
        host="Rotating hosts"
        invitee="1 invitee"
        description="Distribute meetings between team members"
        onClick={() => onSelect('Round robin')}
      />
      <CreateDropdownItem 
        title="Collective"
        host="Multiple hosts"
        invitee="1 invitee"
        description="Panel interviews, group sales calls, etc."
        onClick={() => onSelect('Collective')}
      />

      <div className="h-px bg-gray-200 my-2 w-full"></div>

      <div className="px-5 py-3 font-bold text-[#304859] text-[14px]">
        More ways to meet
      </div>
      
      <CreateDropdownItem 
        title="One-off meeting"
        description="Offer time outside your normal schedule"
        onClick={() => onSelect('One-off meeting')}
      />
      <CreateDropdownItem 
        title="Meeting poll"
        description="Let invitees vote on a time to meet"
        onClick={() => onSelect('Meeting poll')}
      />
    </div>
  );
};

export default CreateDropdown;
