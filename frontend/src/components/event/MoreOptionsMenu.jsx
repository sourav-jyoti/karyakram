"use client";

import React from "react";
import { ExternalLink, Trash } from "lucide-react";
import MenuItem from "./MenuItem";
import MenuSeparator from "./MenuSeparator";

const MoreOptionsMenu = ({ viewUrl, onDelete }) => {
  return (
    <div className="absolute top-10 right-0 w-[240px] bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1 flex flex-col text-[14px]">
      {viewUrl && (
        <MenuItem icon={ExternalLink} label="View booking page" href={viewUrl} />
      )}
      {onDelete && (
        <>
          <MenuSeparator />
          <MenuItem icon={Trash} label="Delete" onClick={onDelete} />
        </>
      )}
    </div>
  );
};

export default MoreOptionsMenu;
