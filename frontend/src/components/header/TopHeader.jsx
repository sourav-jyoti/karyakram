import React from 'react';
import UserProfile from './UserProfile';
import { UserPlus } from 'lucide-react';

const TopHeader = () => {
  return (
    <div className="w-full flex justify-end items-center px-8 py-3 bg-white gap-4 flex-shrink-0 h-[60px]">
      <button className="text-calendlyText hover:bg-gray-100 p-2 rounded-full transition-colors flex items-center justify-center">
        <UserPlus size={20} strokeWidth={2} />
      </button>
      <UserProfile />
    </div>
  );
};

export default TopHeader;
