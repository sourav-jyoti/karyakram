"use client";

import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import CreateDropdown from './CreateDropdown';

const PageHeader = ({ onOpenPanel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (type) => {
    setIsOpen(false);
    onOpenPanel(type);
  };

  return (
    <div className="flex items-center justify-between w-full mt-4">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold text-calendlyText">Scheduling</h1>
        <button className="text-gray-400 hover:text-calendlyText transition-colors mt-2">
          <HelpCircle size={18} />
        </button>
      </div>
      
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-calendlyBlue hover:bg-calendlyBlueHover text-white px-5 py-2.5 rounded-full text-[14px] font-semibold transition-colors flex items-center gap-2"
        >
          <Plus size={16} strokeWidth={3} />
          Create
          {isOpen ? <ChevronUp size={16} strokeWidth={3} /> : <ChevronDown size={16} strokeWidth={3} />}
        </button>
        
        {isOpen && <CreateDropdown onSelect={handleSelect} />}
      </div>
    </div>
  );
};

export default PageHeader;
