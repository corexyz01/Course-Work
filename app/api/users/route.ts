import { NextRequest } from "next/server";
import { Http } from "../../../lib/http";
import { AuthRequest } from "../../../lib/authRequest";
import { UserService } from "../../../services/UserService";

export async function GET(req: NextRequest) {
  try {
    const payload = AuthRequest.requirePayload(req);
    AuthRequest.requireRole(payload, "admin");

    const service = new UserService();
    const users = await service.listUsers();
    return Http.ok({ users: users.map((u) => u.toDTO()) });
  } catch (e) {
    return Http.fail(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = AuthRequest.requirePayload(req);
    AuthRequest.requireRole(payload, "admin");

    const body = (await req.json()) as {
      email: string;
      password: string;
      role: "admin" | "employee";
      fullName: string;
      position: string;
      department: string;
    };

    const service = new UserService();
    const user = await service.createUserAsAdmin(body);
    return Http.ok({ user: user.toDTO() }, { status: 201 });
  } catch (e) {
    return Http.fail(e);
  }
}
