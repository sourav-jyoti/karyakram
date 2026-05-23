"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/page/PageHeader";
import PageTabs from "@/components/page/PageTabs";
import SearchBar from "@/components/page/SearchBar";
import EventCardList from "@/components/event/EventCardList";
import CreateEventPanel from "@/components/panel/CreateEventPanel";
import {
  createEventType,
  deleteEventType,
  getEventTypes,
  getSchedules,
} from "@/lib/api";
import { formatDuration, summarizeWeeklyRules } from "@/lib/format";

export default function SchedulingView() {
  const [events, setEvents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive panel state from URL
  const pane = searchParams.get("pane");
  const paneState = searchParams.get("paneState");
  const paneType = searchParams.get("type");
  const isPanelOpen = pane === "event_type_editor" && !!paneState;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [eventTypes, scheduleList] = await Promise.all([
        getEventTypes(),
        getSchedules(),
      ]);
      setSchedules(scheduleList);
      setEvents(
        eventTypes.map((et) => ({
          id: et.id,
          title: et.title,
          slug: et.slug,
          duration: formatDuration(et.duration_minutes),
          durationMinutes: et.duration_minutes,
          location: "No location set",
          isLocationWarning: true,
          type: et.type === "one_to_many" ? "Group" : "One-on-One",
          schedule: et.schedule
            ? summarizeWeeklyRules(
              scheduleList.find((s) => s.id === et.schedule?.id)?.rules ?? []
            ) || et.schedule.name
            : "—",
          showExtraIcons: true,
          color: "bg-calendlyPurple",
          bookingUrl: et.booking_url,
          isActive: et.is_active,
        }))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load event types");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  const closePanel = () => {
    router.push("/scheduling");
  };

  const handleCreate = async (form) => {
    const defaultSchedule = schedules[0];
    if (!defaultSchedule) throw new Error("No availability schedule found");
    await createEventType({
      title: form.title,
      slug: form.slug,
      duration_minutes: form.durationMinutes,
      schedule_id: form.scheduleId || defaultSchedule.id,
      buffer_before_min: form.bufferBefore ?? 0,
      buffer_after_min: form.bufferAfter ?? 0,
    });
    closePanel();
    await load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this event type?")) return;
    await deleteEventType(id);
    await load();
  };

  return (
    <>
      <PageHeader />
      <PageTabs />
      <SearchBar value={search} onChange={setSearch} />

      {error && (
        <p className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}
      {loading ? (
        <p className="mt-8 text-calendlyGrayText">Loading event types…</p>
      ) : (
        <EventCardList
          events={filtered}
          onDelete={handleDelete}
          emptyMessage={
            search ? "No event types match your search." : "No event types yet."
          }
        />
      )}

      {isPanelOpen && (
        <CreateEventPanel
          type={paneType || "One-on-One"}
          schedules={schedules}
          onClose={closePanel}
          onCreate={handleCreate}
        />
      )}
    </>
  );
}
