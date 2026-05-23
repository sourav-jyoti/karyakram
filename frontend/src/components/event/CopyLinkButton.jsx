"use client";

import React, { useState } from "react";
import { Link2 } from "lucide-react";
import { bookingPath } from "@/lib/format";

const CopyLinkButton = ({ bookingUrl }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!bookingUrl) return;
    const base =
      process.env.NEXT_PUBLIC_APP_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");
    const url = `${base}${bookingPath(bookingUrl)}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!bookingUrl}
      className="flex items-center gap-2 px-4 py-2 border border-calendlyBorder rounded-full text-calendlyText text-[15px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
    >
      <Link2 size={18} strokeWidth={2.5} />
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
};

export default CopyLinkButton;
