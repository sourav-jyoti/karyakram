"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

function generatePaneId() {
  const bytes = new Uint8Array(6);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, '').slice(0, 8);
}

const SidebarCreateButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (type) => {
    setIsOpen(false);
    const paneId = generatePaneId();
    router.push(`/scheduling?pane=event_type_editor&paneState=${paneId}&type=${type}`);
  };

  return (
    <div className="relative w-[180px] mx-auto" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-calendlyBorder rounded-full text-calendlyText font-semibold hover:bg-gray-50 transition-colors shadow-sm focus:outline-none cursor-pointer bg-white"
      >
        <Plus size={18} />
        <span>Create</span>
        {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[320px] bg-white border border-gray-200 rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.1)] z-50 py-2 flex flex-col overflow-hidden">
          <div className="px-5 py-2 font-bold text-[#304859] text-[13px] uppercase tracking-wider">
            Event type
          </div>
          
          <button 
            type="button"
            onClick={() => handleSelect("One-on-One")}
            className="flex flex-col items-start px-5 py-3 hover:bg-gray-50 text-left w-full transition-colors group cursor-pointer focus:outline-none"
          >
            <span className="font-bold text-[#005be6] text-[14px]">One-on-One</span>
            <div className="flex items-center gap-1.5 text-[12px] text-[#1D2A4B] mt-0.5">
              <span>1 host</span>
              <ArrowRight size={12} className="text-[#1D2A4B]" strokeWidth={1.5} />
              <span>1 invitee</span>
            </div>
            <span className="text-[12px] text-[#5A6B80] mt-1 font-medium leading-normal">
              Good for coffee chats, 1:1 interviews, etc.
            </span>
          </button>

          <button 
            type="button"
            onClick={() => handleSelect("Group")}
            className="flex flex-col items-start px-5 py-3 hover:bg-gray-50 text-left w-full transition-colors group cursor-pointer focus:outline-none border-t border-gray-100"
          >
            <span className="font-bold text-[#005be6] text-[14px]">Group</span>
            <div className="flex items-center gap-1.5 text-[12px] text-[#1D2A4B] mt-0.5">
              <span>1 host</span>
              <ArrowRight size={12} className="text-[#1D2A4B]" strokeWidth={1.5} />
              <span>Multiple invitees</span>
            </div>
            <span className="text-[12px] text-[#5A6B80] mt-1 font-medium leading-normal">
              Webinars, online classes, etc.
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SidebarCreateButton;
