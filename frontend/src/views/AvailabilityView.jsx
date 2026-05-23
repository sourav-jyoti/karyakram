"use client";

import { useCallback, useEffect, useState } from "react";
import AvailabilityHeader from "@/components/availability/AvailabilityHeader";
import AvailabilityTabs from "@/components/availability/AvailabilityTabs";
import ScheduleHeader from "@/components/availability/ScheduleHeader";
import WeeklyHours from "@/components/availability/WeeklyHours";
import DateSpecificHours from "@/components/availability/DateSpecificHours";
import { getOverrides, getSchedules, updateSchedule } from "@/lib/api";

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

  useEffect(() => {
    if (!selected?.id) return;
    const now = new Date();
    const from = now.toISOString().slice(0, 10);
    const to = new Date(now.getFullYear(), now.getMonth() + 3, 1)
      .toISOString()
      .slice(0, 10);
    getOverrides(selected.id, from, to)
      .then(setOverrides)
      .catch(() => setOverrides([]));
  }, [selected?.id]);

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
            />
            <DateSpecificHours overrides={overrides} />
          </div>
        </>
      )}
    </div>
  );
}
