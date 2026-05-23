import React from "react";
import { Search } from "lucide-react";

const SearchBar = ({ value = "", onChange }) => {
  return (
    <div className="relative w-full max-w-[28rem] mt-2">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search size={18} className="text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-calendlyBlue focus:ring-1 focus:ring-calendlyBlue text-[14px] transition-colors shadow-sm"
        placeholder="Search event types"
      />
    </div>
  );
};

export default SearchBar;
