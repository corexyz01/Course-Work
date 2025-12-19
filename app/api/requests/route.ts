import { NextRequest } from "next/server";
import { Http } from "../../../lib/http";
import { AuthRequest } from "../../../lib/authRequest";
import { RequestService } from "../../../services/RequestService";
import { EmployeeRepository } from "../../../repositories/EmployeeRepository";

export async function GET(req: NextRequest) {
  try {
    const payload = AuthRequest.requirePayload(req);
    const service = new RequestService();

    if (payload.role === "admin") {
      const pending = await service.listPending();
      return Http.ok({ requests: pending.map((r) => r.toDTO()) });
    }

    const empRepo = new EmployeeRepository();
    const emp = await empRepo.getByUserId(payload.userId);
    if (!emp) return Http.fail(new Error("Employee profile not found"));

    const items = await service.listForEmployee(emp.id);
    return Http.ok({ requests: items.map((r) => r.toDTO()) });
  } catch (e) {
    return Http.fail(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = AuthRequest.requirePayload(req);

    const empRepo = new EmployeeRepository();
    const emp = await empRepo.getByUserId(payload.userId);
    if (!emp) return Http.fail(new Error("Employee profile not found"));

    const body = (await req.json()) as {
      type: "timeCorrection" | "vacation" | "sickLeave" | "dayOff" | "businessTrip";
      payload: {
        date?: string;
        timeEntryId?: string;
        startTime?: string;
        endTime?: string;
        description?: string;
        days?: number;
      };
    };

    const service = new RequestService();
    const created = await service.createRequest({ employeeId: emp.id, type: body.type, payload: body.payload });
    return Http.ok({ request: created.toDTO() }, { status: 201 });
  } catch (e) {
    return Http.fail(e);
  }
}
