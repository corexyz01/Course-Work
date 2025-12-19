import { NextRequest } from "next/server";
import { Http } from "../../../lib/http";
import { AuthRequest } from "../../../lib/authRequest";
import { TimeTrackingService } from "../../../services/TimeTrackingService";
import { EmployeeRepository } from "../../../repositories/EmployeeRepository";

export async function GET(req: NextRequest) {
  try {
    const payload = AuthRequest.requirePayload(req);
    const url = new URL(req.url);
    const from = url.searchParams.get("from") ?? "";
    const to = url.searchParams.get("to") ?? "";
    const employeeIdQuery = url.searchParams.get("employeeId");

    const empRepo = new EmployeeRepository();

    let employeeId: string;
    if (payload.role === "admin" && employeeIdQuery) {
      employeeId = employeeIdQuery;
    } else {
      const emp = await empRepo.getByUserId(payload.userId);
      if (!emp) return Http.fail(new Error("Employee profile not found"));
      employeeId = emp.id;
    }

    const service = new TimeTrackingService();
    const sheet = await service.getTimesheet({ employeeId, from, to });
    return Http.ok(sheet);
  } catch (e) {
    return Http.fail(e);
  }
}
