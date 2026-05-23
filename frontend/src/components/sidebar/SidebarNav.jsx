"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SidebarNavItem from "./SidebarNavItem";
import { Link2, Clock, Calendar } from "lucide-react";

const NAV = [
  { href: "/scheduling", icon: Link2, label: "Scheduling" },
  { href: "/meetings", icon: Clock, label: "Meetings" },
  { href: "/availability", icon: Calendar, label: "Availability" },
];

const SidebarNav = () => {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-4 mt-2">
      {NAV.map(({ href, icon: Icon, label }) => (
        <Link key={href} href={href}>
          <SidebarNavItem
            icon={<Icon size={18} strokeWidth={2.5} />}
            label={label}
            active={pathname === href}
          />
        </Link>
      ))}
    </nav>
  );
};

export default SidebarNav;
