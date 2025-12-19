import { NextRequest } from "next/server";
import { AuthRequest } from "../../../lib/authRequest";
import { Http } from "../../../lib/http";
import { EmployeeRepository } from "../../../repositories/EmployeeRepository";
import { TimeEntryRepository } from "../../../repositories/TimeEntryRepository";

export async function GET(req: NextRequest) {
  try {
    const payload = AuthRequest.requirePayload(req);
    const url = new URL(req.url);
    const date = url.searchParams.get("date") ?? "";

    const empRepo = new EmployeeRepository();
    const emp = await empRepo.getByUserId(payload.userId);
    if (!emp) return Http.fail(new Error("Employee profile not found"));

    const timeRepo = new TimeEntryRepository();
    const entries = await timeRepo.listByDateRange({ employeeId: emp.id, from: date, to: date });

    const simplified = entries
      .slice()
      .sort((a, b) => a.startAt.localeCompare(b.startAt))
      .map((e) => ({
        id: e.id,
        startAt: e.startAt,
        endAt: e.endAt,
        durationSeconds: e.durationSeconds,
      }));

    return Http.ok({ entries: simplified });
  } catch (e) {
    return Http.fail(e);
  }
}
