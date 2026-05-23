import React from "react";
import Logo from "../sidebar/Logo";
import SidebarCreateButton from "../sidebar/SidebarCreateButton";
import SidebarNav from "../sidebar/SidebarNav";

const Sidebar = () => {
  return (
    <div className="w-[260px] border-r border-calendlyBorder bg-white flex flex-col justify-between py-6 h-full flex-shrink-0">
      <div>
        <div className="px-6 mb-8 flex justify-between items-center">
          <Logo />
        </div>
        <div className="px-4 mb-4">
          <SidebarCreateButton href="/scheduling" />
        </div>
        <SidebarNav />
      </div>
    </div>
  );
};

export default Sidebar;
