"use client";

import { useCallback, useEffect, useState } from "react";
import AvailabilityHeader from "@/components/availability/AvailabilityHeader";
import AvailabilityTabs from "@/components/availability/AvailabilityTabs";
import ScheduleHeader from "@/components/availability/ScheduleHeader";
import WeeklyHours from "@/components/availability/WeeklyHours";
import DateSpecificHours from "@/components/availability/DateSpecificHours";
import {
  createOverride,
  deleteOverride as deleteOverrideApi,
  getOverrides,
  getSchedules,
  updateSchedule,
} from "@/lib/api";

export default function AvailabilityView() {
  const [schedules, setSchedules] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const selected = schedules.find((s) => s.id === selectedId) ?? schedules[0];

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await getSchedules();
      setSchedules(list);
      if (!selectedId && list[0]) setSelectedId(list[0].id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load schedules");
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    load();
  }, [load]);

  // Load overrides when selected schedule changes
  const loadOverrides = useCallback(async () => {
    if (!selected?.id) return;
    const now = new Date();
    const from = now.toISOString().slice(0, 10);
    const to = new Date(now.getFullYear(), now.getMonth() + 3, 1)
      .toISOString()
      .slice(0, 10);
    try {
      const list = await getOverrides(selected.id, from, to);
      setOverrides(list);
    } catch {
      setOverrides([]);
    }
  }, [selected?.id]);

  useEffect(() => {
    loadOverrides();
  }, [loadOverrides]);

  const handleSaveRules = async (rules) => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await updateSchedule(selected.id, { rules });
      setSchedules((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
    } finally {
      setSaving(false);
    }
  };

  const handleTimezoneChange = async (timezone) => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await updateSchedule(selected.id, { timezone });
      setSchedules((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCreateOverrides = async (dates, config) => {
    if (!selected?.id) return;
    for (const date of dates) {
      try {
        await createOverride(selected.id, {
          override_date: date,
          is_unavailable: config.is_unavailable,
          start_time: config.start_time,
          end_time: config.end_time,
        });
      } catch (e) {
        console.warn(`Override for ${date} may already exist:`, e);
      }
    }
    await loadOverrides();
  };

  const handleDeleteOverride = async (overrideId) => {
    if (!selected?.id) return;
    try {
      await deleteOverrideApi(selected.id, overrideId);
      setOverrides((prev) => prev.filter((o) => o.id !== overrideId));
    } catch (e) {
      console.error("Failed to delete override:", e);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mt-2">
      <AvailabilityHeader />
      <AvailabilityTabs />
      {error && (
        <p className="px-8 py-2 text-sm text-red-600">{error}</p>
      )}
      {loading ? (
        <p className="px-8 py-8 text-calendlyGrayText">Loading schedules…</p>
      ) : (
        <>
          <ScheduleHeader
            schedules={schedules}
            selected={selected}
            onSelect={setSelectedId}
          />
          <div className="flex px-8">
            <WeeklyHours
              schedule={selected}
              saving={saving}
              onSaveRules={handleSaveRules}
              onTimezoneChange={handleTimezoneChange}
            />
            <DateSpecificHours
              overrides={overrides}
              scheduleId={selected?.id}
              onCreateOverrides={handleCreateOverrides}
              onDeleteOverride={handleDeleteOverride}
            />
          </div>
        </>
      )}
    </div>
  );
}
