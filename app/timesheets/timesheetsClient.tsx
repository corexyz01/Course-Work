"use client";

import { useMemo, useState } from "react";
import { Panel } from "../../components/cards";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "../../components/ui/table";
import { apiGet } from "../../lib/clientApi";
import { formatTime } from "../../lib/format";

type TimesheetSummary = {
  from: string;
  to: string;
  totalSeconds: number;
  rows: { date: string; startAt: string | null; endAt: string | null; durationSeconds: number; status: string }[];
};

function iso(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function TimesheetsClient() {
  const today = useMemo(() => new Date(), []);
  const defaultFrom = useMemo(() => iso(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)), [today]);
  const defaultTo = useMemo(() => iso(today), [today]);

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [sheet, setSheet] = useState<TimesheetSummary | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const url = `/api/timesheets?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
      const json = await apiGet<TimesheetSummary>(url);
      if (json.ok) setSheet(json.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Panel
          title="Фільтри"
          right={
            <div className="flex gap-2">
              <Button onClick={load} disabled={loading} size="sm" type="button">
                Завантажити
              </Button>
              <Button onClick={load} disabled={loading} variant="lime" size="sm" type="button">
                Оновити
              </Button>
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-3">
            <div>
              <div className="text-xs font-medium text-zinc-600">Від</div>
              <Input value={from} onChange={(e) => setFrom(e.target.value)} type="date" className="mt-2" />
            </div>
            <div>
              <div className="text-xs font-medium text-zinc-600">До</div>
              <Input value={to} onChange={(e) => setTo(e.target.value)} type="date" className="mt-2" />
            </div>
          </div>
        </Panel>

        <div className="md:col-span-2">
          <Panel
            title="Табель"
            right={
              <Button onClick={load} disabled={loading} variant="lime" size="sm" type="button">
                Оновити
              </Button>
            }
          >
            <div className="mb-4 text-sm text-zinc-600">
              Разом: <span className="font-semibold text-zinc-900">{((sheet?.totalSeconds ?? 0) / 3600).toFixed(2)} год</span>
            </div>
            <Table>
              <THead>
                <TR>
                  <TH>Дата</TH>
                  <TH>Початок</TH>
                  <TH>Кінець</TH>
                  <TH className="text-right">Годин</TH>
                  <TH>Статус</TH>
                </TR>
              </THead>
              <TBody>
                {(sheet?.rows ?? []).map((r) => (
                  <TR key={`${r.date}_${r.startAt ?? ""}`}>
                    <TD className="whitespace-nowrap">{r.date}</TD>
                    <TD className="whitespace-nowrap">{formatTime(r.startAt)}</TD>
                    <TD className="whitespace-nowrap">{formatTime(r.endAt)}</TD>
                    <TD className="text-right tabular-nums whitespace-nowrap">{(r.durationSeconds / 3600).toFixed(2)}</TD>
                    <TD className="text-xs text-zinc-500">{r.status}</TD>
                  </TR>
                ))}
                {(sheet?.rows ?? []).length === 0 ? (
                  <TR>
                    <TD className="py-6 text-sm text-zinc-500" colSpan={5}>
                      Дані не завантажено
                    </TD>
                  </TR>
                ) : null}
              </TBody>
            </Table>
          </Panel>
        </div>
      </div>
    </div>
  );
}
