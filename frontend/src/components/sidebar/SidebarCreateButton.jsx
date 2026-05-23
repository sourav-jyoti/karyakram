"use client";

import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

const SidebarCreateButton = ({ href = "/scheduling" }) => {
  return (
    <Link
      href={href}
      className="w-[180px] flex items-center justify-center gap-2 py-2.5 px-4 border border-calendlyBorder rounded-full text-calendlyText font-semibold hover:bg-gray-50 transition-colors shadow-sm mx-auto"
    >
      <Plus size={18} />
      Create
    </Link>
  );
};

export default SidebarCreateButton;
