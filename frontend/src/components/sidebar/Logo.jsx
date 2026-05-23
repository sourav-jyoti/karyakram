import React from 'react';
import { ChevronsLeft } from 'lucide-react';

const Logo = () => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2 text-calendlyBlue font-bold text-[1.4rem] tracking-tight">
        <div className="w-[30px] h-[30px] rounded-full bg-calendlyBlue flex items-center justify-center text-white relative flex-shrink-0">
          <div className="w-[14px] h-[14px] bg-white rounded-full absolute left-1 border-2 border-calendlyBlue"></div>
          <span className="z-10 ml-1 text-sm font-black">C</span>
        </div>
        Karyakram
      </div>
      <button className="text-calendlyGrayText hover:text-calendlyText transition-colors flex-shrink-0">
        <ChevronsLeft size={20} />
      </button>
    </div>
  );
};

export default Logo;
