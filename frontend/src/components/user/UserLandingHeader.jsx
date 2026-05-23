import React from "react";

const UserLandingHeader = ({ hostName = "Host" }) => {
  const initial = hostName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <div className="w-[30px] h-[30px] rounded-full bg-[#fde8df] text-[#d45627] flex items-center justify-center font-medium text-sm">
        {initial}
      </div>
      <span className="font-semibold text-[15px] text-calendlyText">
        {hostName}
      </span>
    </div>
  );
};

export default UserLandingHeader;
