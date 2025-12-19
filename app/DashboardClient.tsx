"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { StatCard, Panel } from "../components/cards";
import { Button } from "../components/ui/button";
import { apiGet, apiPost, type ApiResponse } from "../lib/clientApi";
import { formatTime } from "../lib/format";

type TimesheetSummary = {
  from: string;
  to: string;
  totalSeconds: number;
  rows: { date: string; startAt: string | null; endAt: string | null; durationSeconds: number; status: string }[];
};

export function DashboardClient(props: { initialFrom: string; initialTo: string }) {
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sheet, setSheet] = useState<TimesheetSummary | null>(null);

  const totalHours = useMemo(() => {
    const seconds = sheet?.totalSeconds ?? 0;
    return (seconds / 3600).toFixed(2);
  }, [sheet]);

  const reload = useCallback(async () => {
    const url = `/api/timesheets?from=${encodeURIComponent(props.initialFrom)}&to=${encodeURIComponent(props.initialTo)}`;
    const json = await apiGet<TimesheetSummary>(url);
    if (json.ok) {
      setSheet(json.data);
      setRunning(json.data.rows.some((r) => r.endAt === null && r.startAt));
    }
  }, [props.initialFrom, props.initialTo]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function start() {
    setLoading(true);
    try {
      const json = (await apiPost<unknown>("/api/time-entries/start")) as ApiResponse<unknown>;
      if (json.ok) {
        setRunning(true);
        await reload();
      }
    } finally {
      setLoading(false);
    }
  }

  async function stop() {
    setLoading(true);
    try {
      const json = (await apiPost<unknown>("/api/time-entries/stop")) as ApiResponse<unknown>;
      if (json.ok) {
        setRunning(false);
        await reload();
      }
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    setLoading(true);
    try {
      await reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Годин (період)" value={totalHours} hint={`${props.initialFrom} → ${props.initialTo}`} />
        <StatCard title="Запізнення" value="—" hint="Поки що не реалізовано" />
        <StatCard title="Активні заявки" value="—" hint="Поки що не реалізовано" />
      </div>

      <Panel
        title="Таймер роботи"
        right={
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-xs text-zinc-500">Стан: {running ? "Працює" : "Зупинено"}</div>
            <Button disabled={loading} onClick={refresh} variant="lime" size="sm" type="button">
              Оновити
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button disabled={loading || running} onClick={start} variant="lime" type="button">
            Почати
          </Button>
          <Button disabled={loading || !running} onClick={stop} variant="raspberry" type="button">
            Завершити
          </Button>
        </div>
      </Panel>

      <Panel
        title="Останні записи"
        right={
          <Button disabled={loading} onClick={refresh} variant="lime" size="sm" type="button">
            Оновити
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs text-zinc-500">
                <th className="border-b border-zinc-200 pb-2 whitespace-nowrap">Дата</th>
                <th className="border-b border-zinc-200 pb-2 whitespace-nowrap">Початок</th>
                <th className="border-b border-zinc-200 pb-2 whitespace-nowrap">Кінець</th>
                <th className="border-b border-zinc-200 pb-2 text-right whitespace-nowrap">Години</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {(sheet?.rows ?? [])
                .slice(-7)
                .reverse()
                .map((r) => (
                  <tr key={`${r.date}_${r.startAt ?? ""}`} className="text-zinc-900">
                    <td className="border-b border-zinc-100 py-3 pr-4 whitespace-nowrap">{r.date}</td>
                    <td className="border-b border-zinc-100 py-3 pr-4 whitespace-nowrap">{formatTime(r.startAt)}</td>
                    <td className="border-b border-zinc-100 py-3 pr-4 whitespace-nowrap">{formatTime(r.endAt)}</td>
                    <td className="border-b border-zinc-100 py-3 text-right tabular-nums whitespace-nowrap">
                      {(r.durationSeconds / 3600).toFixed(2)}
                    </td>
                  </tr>
                ))}
              {(sheet?.rows ?? []).length === 0 ? (
                <tr>
                  <td className="py-6 text-sm text-zinc-500" colSpan={4}>
                    Немає записів
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
