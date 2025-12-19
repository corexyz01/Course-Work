"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Panel } from "../../components/cards";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "../../components/ui/table";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: { code: string; message?: string } };

type UserDTO = {
  id: string;
  email: string;
  role: "admin" | "employee";
  fullName: string;
  position: string;
  department: string;
  status: "active" | "inactive";
};

type EmployeeRow = { employeeId: string; user: UserDTO };

type LookupItem = { id: string; name: string };

export function EmployeesClient() {
  const [rows, setRows] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [departments, setDepartments] = useState<LookupItem[]>([]);
  const [positions, setPositions] = useState<LookupItem[]>([]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");
  const [standardHoursPerDay, setStandardHoursPerDay] = useState("8");
  const [employmentType, setEmploymentType] = useState<"fullTime" | "partTime">("fullTime");

  const [newDepartment, setNewDepartment] = useState("");
  const [newPosition, setNewPosition] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<EmployeeRow | null>(null);

  const confirmText = useMemo(() => {
    if (!toDelete) return "";
    return `${toDelete.user.fullName} (${toDelete.user.email})`;
  }, [toDelete]);

  const loadEmployees = useCallback(async () => {
    const res = await fetch("/api/employees/list");
    const json = (await res.json()) as ApiResponse<{ rows: EmployeeRow[] }>;
    if (json.ok) setRows(json.data.rows);
  }, []);

  const loadLookups = useCallback(async () => {
    const res = await fetch("/api/lookups");
    const json = (await res.json()) as ApiResponse<{ departments: LookupItem[]; positions: LookupItem[] }>;
    if (json.ok) {
      setDepartments(json.data.departments);
      setPositions(json.data.positions);

      setDepartment((current) => (current ? current : json.data.departments[0]?.name ?? ""));
      setPosition((current) => (current ? current : json.data.positions[0]?.name ?? ""));
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadEmployees(), loadLookups()]);
    } finally {
      setLoading(false);
    }
  }, [loadEmployees, loadLookups]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  async function create() {
    setLoading(true);
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          fullName,
          position,
          department,
          standardHoursPerDay: Number(standardHoursPerDay),
          employmentType,
        }),
      });
      const json = (await res.json()) as ApiResponse<{ user: UserDTO; employee: { id: string } }>;
      if (json.ok) {
        setRows((prev) => [{ employeeId: json.data.employee.id, user: json.data.user }, ...prev]);
        setEmail("");
        setPassword("");
        setFullName("");
      }
    } finally {
      setLoading(false);
    }
  }

  async function addLookup(kind: "department" | "position", name: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/lookups", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, name }),
      });
      const json = (await res.json()) as ApiResponse<{ item: LookupItem }>;
      if (json.ok) {
        if (kind === "department") {
          setDepartments((prev) => [...prev, json.data.item].sort((a, b) => a.name.localeCompare(b.name)));
          setDepartment(json.data.item.name);
          setNewDepartment("");
        } else {
          setPositions((prev) => [...prev, json.data.item].sort((a, b) => a.name.localeCompare(b.name)));
          setPosition(json.data.item.name);
          setNewPosition("");
        }
      }
    } finally {
      setLoading(false);
    }
  }

  function openDelete(row: EmployeeRow) {
    setToDelete(row);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!toDelete) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/employees/${encodeURIComponent(toDelete.employeeId)}`, { method: "DELETE" });
      const json = (await res.json()) as ApiResponse<{ deleted: boolean }>;
      if (json.ok) {
        setRows((prev) => prev.filter((r) => r.employeeId !== toDelete.employeeId));
        setConfirmOpen(false);
        setToDelete(null);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) setToDelete(null);
        }}
        title="Видалити працівника"
        description={`Це видалить назавжди ${confirmText} та всі пов’язані записи часу і заявки.`}
        onConfirm={confirmDelete}
        loading={loading}
      />

      <Panel
        title="Додати працівника"
        right={
          <div className="flex gap-2">
            <Button disabled={loading} onClick={refreshAll} variant="lime" size="sm" type="button">
              Оновити
            </Button>
            <Button disabled={loading} onClick={create} type="button">
              Створити
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Ел. пошта">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </Field>
          <Field label="Пароль">
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
          </Field>
          <Field label="ПІБ">
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </Field>

          <Field label="Відділ">
            <Select value={department} onChange={(e) => setDepartment(e.target.value)}>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Посада">
            <Select value={position} onChange={(e) => setPosition(e.target.value)}>
              {positions.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Годин/день">
            <Input value={standardHoursPerDay} onChange={(e) => setStandardHoursPerDay(e.target.value)} type="number" />
          </Field>

          <Field label="Зайнятість">
            <Select value={employmentType} onChange={(e) => setEmploymentType(e.target.value as "fullTime" | "partTime")}>
              <option value="fullTime">Повна</option>
              <option value="partTime">Часткова</option>
            </Select>
          </Field>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="text-xs font-semibold text-zinc-700">Відділи</div>
            <div className="mt-3 flex gap-2">
              <Input value={newDepartment} onChange={(e) => setNewDepartment(e.target.value)} placeholder="Новий відділ" />
              <Button
                disabled={loading || newDepartment.trim().length < 2}
                onClick={() => void addLookup("department", newDepartment)}
                size="sm"
                type="button"
              >
                Додати
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="text-xs font-semibold text-zinc-700">Посади</div>
            <div className="mt-3 flex gap-2">
              <Input value={newPosition} onChange={(e) => setNewPosition(e.target.value)} placeholder="Нова посада" />
              <Button
                disabled={loading || newPosition.trim().length < 2}
                onClick={() => void addLookup("position", newPosition)}
                size="sm"
                type="button"
              >
                Додати
              </Button>
            </div>
          </div>
        </div>
      </Panel>

      <Panel
        title="Працівники"
        right={
          <Button disabled={loading} onClick={loadEmployees} variant="lime" size="sm" type="button">
            Оновити
          </Button>
        }
      >
        <Table>
          <THead>
            <TR>
              <TH>ПІБ</TH>
              <TH>Ел. пошта</TH>
              <TH>Відділ</TH>
              <TH>Посада</TH>
              <TH>Статус</TH>
              <TH className="text-right">Дії</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((r) => (
              <TR key={r.employeeId}>
                <TD>{r.user.fullName}</TD>
                <TD className="text-zinc-600">{r.user.email}</TD>
                <TD className="text-zinc-600">{r.user.department}</TD>
                <TD className="text-zinc-600">{r.user.position}</TD>
                <TD className="text-xs text-zinc-500">{r.user.status}</TD>
                <TD className="text-right pr-0">
                  <Button
                    disabled={loading || r.user.role === "admin"}
                    onClick={() => openDelete(r)}
                    variant="outline"
                    size="sm"
                    type="button"
                  >
                    Видалити
                  </Button>
                </TD>
              </TR>
            ))}
            {rows.length === 0 ? (
              <TR>
                <TD className="py-6 text-sm text-zinc-500" colSpan={6}>
                  Немає працівників
                </TD>
              </TR>
            ) : null}
          </TBody>
        </Table>
      </Panel>
    </div>
  );
}

function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium text-zinc-600">{props.label}</div>
      <div className="mt-2">{props.children}</div>
    </div>
  );
}
