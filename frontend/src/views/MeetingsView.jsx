"use client";

import { useCallback, useEffect, useState } from "react";
import MeetingsHeader from "@/components/meetings/MeetingsHeader";
import MeetingsFilters from "@/components/meetings/MeetingsFilters";
import MeetingsList from "@/components/meetings/MeetingsList";
import { cancelMeeting, getMeetings } from "@/lib/api";
import { formatDateHeader } from "@/lib/format";

export default function MeetingsView() {
  const [period, setPeriod] = useState("upcoming");
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedTimezone, setSelectedTimezone] = useState(() => {
    return typeof window !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "Asia/Kolkata";
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { meetings: data } = await getMeetings({ period });
      setMeetings(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load meetings");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = async (id) => {
    if (!confirm("Cancel this meeting?")) return;
    await cancelMeeting(id);
    await load();
  };

  const grouped = meetings.reduce((acc, m) => {
    const key = formatDateHeader(m.start_at);
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <>
      <MeetingsHeader />
      <MeetingsFilters
        selectedTimezone={selectedTimezone}
        onTimezoneChange={setSelectedTimezone}
      />
      {error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}
      <MeetingsList
        period={period}
        onPeriodChange={setPeriod}
        grouped={grouped}
        loading={loading}
        onCancel={handleCancel}
        selectedTimezone={selectedTimezone}
      />
    </>
  );
}
