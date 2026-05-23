import React from 'react';
import BannerButton from './BannerButton';

const TermsBanner = () => {
  return (
    <div className="w-full bg-[#ebf3ff] border border-[#b6d4fe] rounded-lg p-4 px-6 flex items-center justify-between mb-2">
      <div className="flex flex-col gap-0.5">
        <h3 className="font-semibold text-calendlyText text-[15px]">Review our updated Terms of Use</h3>
        <p className="text-calendlyText text-[14px]">
          We've updated our Terms of Use to reflect how Calendly works today. Take a moment to review what's changed.
        </p>
      </div>
      <div className="flex items-center gap-6 flex-shrink-0">
        <button className="text-[14px] font-semibold text-calendlyText hover:underline">
          Review terms
        </button>
        <BannerButton />
      </div>
    </div>
  );
};

export default TermsBanner;
