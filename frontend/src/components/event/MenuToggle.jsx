import React from 'react';

const MenuToggle = ({ label, isOn, onToggle }) => {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-calendlyText hover:bg-gray-50 transition-colors cursor-pointer" onClick={onToggle}>
      <span className="text-[14px]">{label}</span>
      <div className={`w-8 h-[18px] rounded-full relative flex items-center transition-colors ${isOn ? 'bg-calendlyBlue' : 'bg-gray-300'}`}>
         <div className={`w-3.5 h-3.5 bg-white rounded-full absolute transition-transform ${isOn ? 'translate-x-[16px]' : 'translate-x-[2px]'}`}></div>
      </div>
    </div>
  );
};

export default MenuToggle;
