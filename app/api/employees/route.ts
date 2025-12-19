import { NextRequest } from "next/server";
import { AuthRequest } from "../../../lib/authRequest";
import { Http } from "../../../lib/http";
import { AuthService } from "../../../services/AuthService";

export async function POST(req: NextRequest) {
  try {
    const payload = AuthRequest.requirePayload(req);
    AuthRequest.requireRole(payload, "admin");

    const body = (await req.json()) as {
      email: string;
      password: string;
      fullName: string;
      position: string;
      department: string;
      standardHoursPerDay: number;
      employmentType: "fullTime" | "partTime";
    };

    const auth = new AuthService();
    const created = await auth.createEmployeeUser(body);

    return Http.ok({ user: created.user.toDTO(), employee: created.employee.toDTO() }, { status: 201 });
  } catch (e) {
    return Http.fail(e);
  }
}
