"use client";

import { useCallback, useEffect, useState } from "react";
import TermsBanner from "@/components/banner/TermsBanner";
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
  const [panelType, setPanelType] = useState(null);
  const [search, setSearch] = useState("");

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

  const handleCreate = async (form) => {
    const defaultSchedule = schedules[0];
    if (!defaultSchedule) throw new Error("No availability schedule found");
    await createEventType({
      title: form.title,
      slug: form.slug,
      duration_minutes: form.durationMinutes,
      schedule_id: form.scheduleId || defaultSchedule.id,
      buffer_before_min: form.bufferBefore,
      buffer_after_min: form.bufferAfter,
    });
    setPanelType(null);
    await load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this event type?")) return;
    await deleteEventType(id);
    await load();
  };

  return (
    <>
      <TermsBanner />
      <PageHeader onOpenPanel={setPanelType} />
      <PageTabs />
      <SearchBar value={search} onChange={setSearch} />

      {error && (
        <p className="mt-4 text-sm text-red-600">
          {error}. Is the backend running on port 4000?
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

      {panelType && (
        <CreateEventPanel
          type={panelType}
          schedules={schedules}
          onClose={() => setPanelType(null)}
          onCreate={handleCreate}
        />
      )}
    </>
  );
}
