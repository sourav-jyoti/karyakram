"use client";

import React, { useState } from "react";
import {
  Calendar,
  Edit2,
  Filter,
  RefreshCw,
  AlertTriangle,
  MapPin,
  Globe,
  User,
  FileText,
  MessageSquare
} from "lucide-react";

const MeetingItem = ({ meeting, onCancel, selectedTimezone }) => {
  const [expanded, setExpanded] = useState(false);
  const invitee = meeting.invitees?.[0];
  const initials = invitee?.name?.charAt(0)?.toUpperCase() ?? "?";

  // Format primary and secondary times based on the selected timezone
  const tz = selectedTimezone || "Asia/Kolkata";

  const formatInTimezone = (utcString, timezone, options) => {
    try {
      return new Date(utcString).toLocaleTimeString("en-US", {
        timeZone: timezone,
        ...options
      });
    } catch (e) {
      return new Date(utcString).toLocaleTimeString("en-US", options);
    }
  };

  const getPrimaryTimeRange = (start, end, tzId) => {
    const startStr = formatInTimezone(start, tzId, { hour: "numeric", minute: "2-digit", hour12: true });
    const endStr = formatInTimezone(end, tzId, { hour: "numeric", minute: "2-digit", hour12: true });

    const cleanTime = (tStr) => {
      return tStr.toLowerCase().replace(/\s/g, "").replace(/:00/, "");
    };
    return `${cleanTime(startStr)} - ${cleanTime(endStr)}`;
  };

  const getSecondaryTimeRange = (start, end, tzId) => {
    const startStr = formatInTimezone(start, tzId, { hour: "2-digit", minute: "2-digit", hour12: true });
    const endStr = formatInTimezone(end, tzId, { hour: "2-digit", minute: "2-digit", hour12: true });

    const cleanTime = (tStr) => {
      return tStr.toLowerCase().replace(/\s/g, "");
    };

    let tzName = tzId;
    if (tzId === "Asia/Kolkata") tzName = "India, Sri Lanka Time";
    else if (tzId === "America/New_York") tzName = "Eastern Time";
    else if (tzId === "America/Los_Angeles") tzName = "Pacific Time";
    else if (tzId === "Europe/London") tzName = "Greenwich Mean Time";
    else if (tzId === "Asia/Singapore") tzName = "Singapore Time";
    else if (tzId === "Europe/Paris") tzName = "Central European Time";
    else {
      try {
        const parts = new Intl.DateTimeFormat("en-US", { timeZone: tzId, timeZoneName: "long" }).formatToParts(new Date());
        tzName = parts.find(p => p.type === "timeZoneName")?.value ?? tzId;
      } catch (e) { }
    }

    return `${cleanTime(startStr)} - ${cleanTime(endStr)} (${tzName})`;
  };

  const primaryTimeStr = getPrimaryTimeRange(meeting.start_at, meeting.end_at, tz);
  const secondaryTimeStr = getSecondaryTimeRange(meeting.start_at, meeting.end_at, tz);

  // Formatted creation timestamp
  const getCreatedTimestampStr = () => {
    if (!meeting.created_at) return "Created by host";
    const date = new Date(meeting.created_at);
    return `Created ${date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })} by ${meeting.host?.name || "the host"}`;
  };

  return (
    <div className="border-b border-gray-150 bg-white hover:bg-gray-50/30 transition-all flex flex-col">
      {/* ─── Collapsed Card Row ─── */}
      <div className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-12 w-full max-w-5xl">
          {/* Time & Timezone section */}
          <div className="flex items-start gap-4 min-w-[240px]">
            <div className="w-[18px] h-[18px] rounded-full bg-calendlyPurple mt-1 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-calendlyText">
                {primaryTimeStr}
              </span>
              <span className="text-[12px] text-calendlyGrayText font-medium mt-0.5">
                {secondaryTimeStr}
              </span>
            </div>
          </div>

          {/* Invitee and Meeting metadata */}
          <div className="flex items-center gap-4 min-w-[280px]">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-calendlyBlue flex items-center justify-center text-[13px] font-extrabold flex-shrink-0">
              {initials}
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-calendlyText leading-tight">
                {invitee?.name ?? "—"}
              </span>
              <span className="text-[13px] text-calendlyGrayText font-semibold mt-0.5">
                Event type <span className="font-extrabold text-calendlyText">{meeting.event_type?.title}</span>
              </span>
            </div>
          </div>

          {/* Host count info */}
          <div className="hidden md:block text-[13px] text-calendlyGrayText font-semibold min-w-[150px]">
            1 host | 0 non-hosts
          </div>
        </div>

        {/* Action / Details triggers */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-[13px] font-bold text-calendlyBlue hover:text-calendlyBlueHover flex items-center gap-1.5 focus:outline-none cursor-pointer"
          >
            <span className="text-[10px]">{expanded ? "▼" : "▶"}</span>
            <span>Details</span>
          </button>
        </div>
      </div>

      {/* ─── Expanded Details Panel ─── */}
      {expanded && (
        <div className="px-6 pb-8 pt-2 border-t border-gray-100 bg-white/70 flex flex-col md:flex-row gap-10 transition-all duration-300">

          {/* LEFT SIDE: Core booking actions & secondary options */}
          <div className="w-full md:w-[240px] flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="w-full py-2 px-4 border border-gray-300 rounded-full text-center font-bold text-[13px] text-calendlyText hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors cursor-pointer bg-white"
              >
                <RefreshCw size={14} />
                <span>Reschedule</span>
              </button>

              <button
                type="button"
                className="w-full py-2 px-4 border border-gray-300 rounded-full text-center font-bold text-[13px] text-calendlyText hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors cursor-pointer bg-white"
              >
                <Calendar size={14} />
                <span>Cancel</span>
              </button>
            </div>

            {/* Note about cancellation */}
            <div className="text-[11px] text-gray-400 font-semibold leading-relaxed border-t border-gray-100 pt-4">
              * Note: Cancelation backend logic is fully implemented, but the frontend client interface for this action is currently not supported.
            </div>


          </div>

          {/* RIGHT SIDE: Rich metadata content values */}
          <div className="flex-1 space-y-6 text-[14px] text-calendlyText">

            {/* 1. Invitee Section */}
            <div>
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Invitee
              </h4>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-calendlyBlue flex items-center justify-center text-[12px] font-bold flex-shrink-0 mt-0.5">
                  {initials}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-calendlyText">{invitee?.name}</span>
                  <span className="text-[13px] text-calendlyGrayText font-medium">{invitee?.email}</span>
                </div>
              </div>
            </div>


            {/* 3. Invitee Timezone */}
            <div>
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Invitee Time Zone
              </h4>
              <div className="flex items-center gap-2 text-calendlyGrayText font-medium">
                <Globe size={15} />
                <span>{invitee?.timezone || "Not specified"}</span>
              </div>
            </div>

            {/* 4. Questions & Answers */}
            <div>
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Questions
              </h4>
              <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 space-y-3.5">
                <p className="text-[13px] text-gray-400 font-bold">
                  Please share anything that will help prepare for our meeting.
                </p>
                {meeting.answers && meeting.answers.length > 0 ? (
                  meeting.answers.map((ans, idx) => (
                    <div key={idx} className="flex flex-col gap-1 border-t border-gray-100/50 pt-2 first:border-0 first:pt-0">
                      <span className="text-[13px] font-bold text-calendlyGrayText">{ans.question}</span>
                      <span className="font-semibold text-[13px] text-[#1D2A4B]">{ans.answer || "—"}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[13px] text-calendlyText font-semibold">a</p>
                )}
              </div>
            </div>

            {/* 5. Meeting Host */}
            <div>
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Meeting Host
              </h4>
              <div className="flex items-center gap-2.5">
                <div className="w-[26px] h-[26px] rounded-full bg-orange-50 text-[#d45627] flex items-center justify-center font-bold text-[11px]">
                  {meeting.host?.name?.charAt(0)?.toUpperCase() || "H"}
                </div>
                <span className="text-[13px] font-semibold text-calendlyGrayText">
                  Host will attend this meeting
                </span>
              </div>
            </div>

            {/* 7. Creation Metadata */}
            <div className="text-[12px] text-gray-400 font-semibold italic border-t border-gray-100 pt-4">
              {getCreatedTimestampStr()}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingItem;
