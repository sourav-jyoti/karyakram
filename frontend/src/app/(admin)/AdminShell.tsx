"use client";

import Sidebar from "@/components/layout/Sidebar";
import TopHeader from "@/components/header/TopHeader";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-white overflow-hidden font-sans text-calendlyText">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-calendlyBg overflow-y-auto">
        <TopHeader />
        <main className="flex-1 px-8 pb-8">{children}</main>
      </div>
    </div>
  );
}
