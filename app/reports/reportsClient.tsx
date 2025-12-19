"use client";

import { useMemo, useState } from "react";
import { Panel, StatCard } from "../../components/cards";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "../../components/ui/table";

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: { code: string; message?: string } };

type ReportRow = {
  employeeId: string;
  fullName: string;
  department: string;
  position: string;
  workedSeconds: number;
  plannedMinutes: number;
  deltaMinutes: number;
  lateDays: number;
  missingDays: number;
};

type AdminReport = {
  from: string;
  to: string;
  totalWorkedSeconds: number;
  rows: ReportRow[];
};

function iso(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function ReportsClient() {
  const today = useMemo(() => new Date(), []);
  const defaultFrom = useMemo(() => iso(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)), [today]);
  const defaultTo = useMemo(() => iso(today), [today]);

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [report, setReport] = useState<AdminReport | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const url = `/api/reports/admin?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
      const res = await fetch(url);
      const json = (await res.json()) as ApiResponse<AdminReport>;
      if (json.ok) setReport(json.data);
    } finally {
      setLoading(false);
    }
  }

  const totalHours = ((report?.totalWorkedSeconds ?? 0) / 3600).toFixed(1);
  const avgHours = report && report.rows.length ? ((report.totalWorkedSeconds / report.rows.length) / 3600).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Разом відпрацьовано" value={`${totalHours} год`} hint="Обраний період" />
        <StatCard title="Працівників" value={`${report?.rows.length ?? 0}`} />
        <StatCard title="Середнє" value={`${avgHours} год`} />
      </div>

      <Panel
        title="Звіт"
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Input value={from} onChange={(e) => setFrom(e.target.value)} type="date" className="h-9 w-auto" />
            <Input value={to} onChange={(e) => setTo(e.target.value)} type="date" className="h-9 w-auto" />
            <Button disabled={loading} onClick={load} size="sm" type="button">
              Порахувати
            </Button>
            <Button disabled={loading} onClick={load} variant="lime" size="sm" type="button">
              Оновити
            </Button>
          </div>
        }
      >
        <Table>
          <THead>
            <TR>
              <TH>Працівник</TH>
              <TH>Відділ</TH>
              <TH className="text-right">Відпрац.</TH>
              <TH className="text-right">План</TH>
              <TH className="text-right">Різниця</TH>
              <TH className="text-right">Запізн.</TH>
              <TH className="text-right">Пропуски</TH>
            </TR>
          </THead>
          <TBody>
            {(report?.rows ?? []).map((r) => (
              <TR key={r.employeeId}>
                <TD>
                  <div className="font-medium text-zinc-900">{r.fullName}</div>
                  <div className="text-xs text-zinc-500">{r.position}</div>
                </TD>
                <TD className="text-zinc-600">{r.department}</TD>
                <TD className="text-right tabular-nums">{(r.workedSeconds / 3600).toFixed(1)} год</TD>
                <TD className="text-right tabular-nums">{(r.plannedMinutes / 60).toFixed(1)} год</TD>
                <TD className="text-right tabular-nums">{(r.deltaMinutes / 60).toFixed(1)} год</TD>
                <TD className="text-right tabular-nums">{r.lateDays}</TD>
                <TD className="text-right tabular-nums">{r.missingDays}</TD>
              </TR>
            ))}
            {(report?.rows ?? []).length === 0 ? (
              <TR>
                <TD className="py-6 text-sm text-zinc-500" colSpan={7}>
                  Дані не завантажено
                </TD>
              </TR>
            ) : null}
          </TBody>
        </Table>
      </Panel>
    </div>
  );
}
