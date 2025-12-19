"use client";

import { useEffect, useMemo, useState } from "react";
import { Panel } from "../../components/cards";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "../../components/ui/table";
import { apiGet, apiPost, type ApiResponse } from "../../lib/clientApi";
import { formatTime } from "../../lib/format";

type RequestDTO = {
  id: string;
  employeeId: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
  status: string;
  reviewerId: string | null;
  reviewComment: string | null;
  reviewedAt: string | null;
};

type TimeEntryOption = {
  id: string;
  startAt: string;
  endAt: string | null;
  durationSeconds: number;
};

export function RequestsClient(props: { role: "admin" | "employee" }) {
  const [items, setItems] = useState<RequestDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const [type, setType] = useState("timeCorrection");
  const [date, setDate] = useState("");
  const [timeEntryId, setTimeEntryId] = useState("");
  const [entries, setEntries] = useState<TimeEntryOption[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const selectedEntry = useMemo(() => entries.find((e) => e.id === timeEntryId) ?? null, [entries, timeEntryId]);

  async function load() {
    setLoading(true);
    try {
      const json = await apiGet<{ requests: RequestDTO[] }>("/api/requests");
      if (json.ok) setItems(json.data.requests);
    } finally {
      setLoading(false);
    }
  }

  async function loadEntriesForDate(d: string) {
    if (!d) {
      setEntries([]);
      setTimeEntryId("");
      return;
    }

    const json = await apiGet<{ entries: TimeEntryOption[] }>(`/api/time-entries?date=${encodeURIComponent(d)}`);
    if (json.ok) {
      setEntries(json.data.entries);
      setTimeEntryId(json.data.entries[0]?.id ?? "");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (type === "timeCorrection") {
      void loadEntriesForDate(date);
    }
  }, [type, date]);

  async function create() {
    setLoading(true);
    try {
      const payload: Record<string, unknown> = { date };
      if (type === "timeCorrection") {
        payload.timeEntryId = timeEntryId || undefined;
        payload.startTime = startTime;
        payload.endTime = endTime;
      }

      const json = (await apiPost<{ request: RequestDTO }>("/api/requests", { type, payload })) as ApiResponse<{ request: RequestDTO }>;
      if (json.ok) {
        setItems((prev) => [json.data.request, ...prev]);
        setDate("");
        setTimeEntryId("");
        setEntries([]);
        setStartTime("");
        setEndTime("");
      }
    } finally {
      setLoading(false);
    }
  }

  async function review(requestId: string, action: "approve" | "reject") {
    setLoading(true);
    try {
      const json = (await apiPost<{ request: RequestDTO }>("/api/requests/review", { requestId, action })) as ApiResponse<{
        request: RequestDTO;
      }>;

      if (json.ok) {
        setItems((prev) => prev.map((x) => (x.id === requestId ? json.data.request : x)));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {props.role === "employee" ? (
        <Panel
          title="Нова заявка"
          right={
            <div className="flex gap-2">
              <Button disabled={loading} onClick={load} variant="lime" size="sm" type="button">
                Оновити
              </Button>
              <Button disabled={loading} onClick={create} size="sm" type="button">
                Створити
              </Button>
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <div className="text-xs font-medium text-zinc-600">Тип</div>
              <Select value={type} onChange={(e) => setType(e.target.value)} className="mt-2">
                <option value="timeCorrection">Коригування часу</option>
                <option value="vacation">Відпустка</option>
                <option value="sickLeave">Лікарняний</option>
                <option value="dayOff">Вихідний</option>
                <option value="businessTrip">Відрядження</option>
              </Select>
            </div>

            <div>
              <div className="text-xs font-medium text-zinc-600">Дата</div>
              <Input value={date} onChange={(e) => setDate(e.target.value)} type="date" className="mt-2" />
            </div>

            {type === "timeCorrection" ? (
              <>
                <div className="md:col-span-2">
                  <div className="text-xs font-medium text-zinc-600">Сеанс</div>
                  <Select value={timeEntryId} onChange={(e) => setTimeEntryId(e.target.value)} className="mt-2" disabled={!date}>
                    {entries.map((e) => (
                      <option key={e.id} value={e.id}>
                        {formatTime(e.startAt)} → {formatTime(e.endAt)} ({(e.durationSeconds / 3600).toFixed(2)} год)
                      </option>
                    ))}
                    {entries.length === 0 ? <option value="">Немає сеансів на дату</option> : null}
                  </Select>
                  {selectedEntry ? (
                    <div className="mt-2 text-xs text-zinc-500">
                      Поточний час: {formatTime(selectedEntry.startAt)} → {formatTime(selectedEntry.endAt)}
                    </div>
                  ) : null}
                </div>

                <div>
                  <div className="text-xs font-medium text-zinc-600">Новий початок</div>
                  <Input value={startTime} onChange={(e) => setStartTime(e.target.value)} type="time" className="mt-2" />
                </div>
                <div>
                  <div className="text-xs font-medium text-zinc-600">Новий кінець</div>
                  <Input value={endTime} onChange={(e) => setEndTime(e.target.value)} type="time" className="mt-2" />
                </div>
              </>
            ) : null}
          </div>
        </Panel>
      ) : null}

      <Panel
        title={props.role === "admin" ? "Заявки (очікують)" : "Мої заявки"}
        right={
          <Button disabled={loading} onClick={load} variant="lime" size="sm" type="button">
            Оновити
          </Button>
        }
      >
        <Table>
          <THead>
            <TR>
              <TH>Створено</TH>
              <TH>Тип</TH>
              <TH>Дата</TH>
              <TH>Статус</TH>
              {props.role === "admin" ? <TH>Дії</TH> : null}
            </TR>
          </THead>
          <TBody>
            {items.map((r) => (
              <TR key={r.id}>
                <TD className="text-xs text-zinc-500 whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</TD>
                <TD>{r.type}</TD>
                <TD className="text-zinc-700 whitespace-nowrap">{String(r.payload.date ?? "")}</TD>
                <TD className="text-xs text-zinc-500 whitespace-nowrap">{r.status}</TD>
                {props.role === "admin" ? (
                  <TD>
                    <div className="flex flex-wrap gap-2">
                      <Button disabled={loading || r.status !== "pending"} onClick={() => review(r.id, "approve")} size="sm" type="button">
                        Підтвердити
                      </Button>
                      <Button
                        disabled={loading || r.status !== "pending"}
                        onClick={() => review(r.id, "reject")}
                        variant="outline"
                        size="sm"
                        type="button"
                      >
                        Відхилити
                      </Button>
                    </div>
                  </TD>
                ) : null}
              </TR>
            ))}
            {items.length === 0 ? (
              <TR>
                <TD className="py-6 text-sm text-zinc-500" colSpan={props.role === "admin" ? 5 : 4}>
                  Немає заявок
                </TD>
              </TR>
            ) : null}
          </TBody>
        </Table>
      </Panel>
    </div>
  );
}
