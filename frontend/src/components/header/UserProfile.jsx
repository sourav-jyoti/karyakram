import React from 'react';
import { ChevronDown } from 'lucide-react';

const UserProfile = () => {
  return (
    <button className="flex items-center gap-2 hover:bg-gray-50 py-1 px-1 rounded-md transition-colors">
      <div className="w-8 h-8 rounded-full bg-[#fde8df] text-[#d45627] flex items-center justify-center font-medium text-sm">
        v
      </div>
      <ChevronDown size={16} className="text-calendlyText" />
    </button>
  );
};

export default UserProfile;
