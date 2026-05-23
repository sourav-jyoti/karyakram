"use client";

import React, { useState, useRef, useEffect } from "react";
import { ExternalLink, MoreVertical } from "lucide-react";
import MoreOptionsMenu from "./MoreOptionsMenu";
import { bookingPath } from "@/lib/format";

const MoreOptionsButton = ({ bookingUrl, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const viewUrl = bookingUrl ? bookingPath(bookingUrl) : null;

  return (
    <div className="flex items-center gap-0 relative" ref={dropdownRef}>
      {viewUrl && (
        <a
          href={viewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-calendlyGrayText hover:bg-gray-100 p-2 rounded-md transition-colors"
        >
          <ExternalLink size={20} strokeWidth={1.5} />
        </a>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`text-calendlyGrayText hover:bg-gray-100 p-2 rounded-md transition-colors ${isOpen ? "bg-gray-100" : ""}`}
      >
        <MoreVertical size={22} strokeWidth={1.5} />
      </button>

      {isOpen && (
        <MoreOptionsMenu
          viewUrl={viewUrl}
          onDelete={
            onDelete
              ? () => {
                  setIsOpen(false);
                  onDelete();
                }
              : undefined
          }
        />
      )}
    </div>
  );
};

export default MoreOptionsButton;
