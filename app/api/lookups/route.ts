import { NextRequest } from "next/server";
import { AuthRequest } from "../../../lib/authRequest";
import { Http } from "../../../lib/http";
import { LookupService } from "../../../services/LookupService";

export async function GET(req: NextRequest) {
  try {
    const payload = AuthRequest.requirePayload(req);
    AuthRequest.requireRole(payload, "admin");

    const service = new LookupService();
    const data = await service.list();
    return Http.ok({
      departments: data.departments.map((d) => d.toDTO()),
      positions: data.positions.map((p) => p.toDTO()),
    });
  } catch (e) {
    return Http.fail(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = AuthRequest.requirePayload(req);
    AuthRequest.requireRole(payload, "admin");

    const body = (await req.json()) as { kind: "department" | "position"; name: string };
    const service = new LookupService();

    if (body.kind === "department") {
      const item = await service.addDepartment(body.name);
      return Http.ok({ item: item.toDTO() }, { status: 201 });
    }

    const item = await service.addPosition(body.name);
    return Http.ok({ item: item.toDTO() }, { status: 201 });
  } catch (e) {
    return Http.fail(e);
  }
}
