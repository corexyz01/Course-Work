import { NextRequest } from "next/server";
import { Http } from "../../../../lib/http";
import { AuthRequest } from "../../../../lib/authRequest";
import { TimeTrackingService } from "../../../../services/TimeTrackingService";
import { EmployeeRepository } from "../../../../repositories/EmployeeRepository";

export async function POST(req: NextRequest) {
  try {
    const payload = AuthRequest.requirePayload(req);

    const empRepo = new EmployeeRepository();
    const emp = await empRepo.getByUserId(payload.userId);
    if (!emp) return Http.fail(new Error("Employee profile not found"));

    const service = new TimeTrackingService();
    const entry = await service.stopWork(emp.id);
    return Http.ok({ entry: entry.toDTO() });
  } catch (e) {
    return Http.fail(e);
  }
}
