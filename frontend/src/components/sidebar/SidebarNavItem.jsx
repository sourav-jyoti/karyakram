import React from "react";

const SidebarNavItem = ({ icon, label, active }) => {
  return (
    <div
      className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-md text-[15px] font-medium transition-colors ${
        active
          ? "bg-calendlyLightBlue text-calendlyBlue"
          : "text-calendlyText hover:bg-gray-50"
      }`}
    >
      <span
        className={`${active ? "text-calendlyBlue" : "text-calendlyGrayText"}`}
      >
        {icon}
      </span>
      {label}
    </div>
  );
};

export default SidebarNavItem;
