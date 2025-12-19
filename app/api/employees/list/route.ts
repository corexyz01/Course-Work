import { NextRequest } from "next/server";
import { AuthRequest } from "../../../../lib/authRequest";
import { Http } from "../../../../lib/http";
import { EmployeeRepository } from "../../../../repositories/EmployeeRepository";
import { UserRepository } from "../../../../repositories/UserRepository";

export async function GET(req: NextRequest) {
  try {
    const payload = AuthRequest.requirePayload(req);
    AuthRequest.requireRole(payload, "admin");

    const [employees, users] = await Promise.all([new EmployeeRepository().list(), new UserRepository().list()]);
    const userById = new Map(users.map((u) => [u.id, u]));

    const rows = employees
      .map((e) => {
        const u = userById.get(e.userId);
        if (!u) return null;
        return {
          employeeId: e.id,
          user: {
            id: u.id,
            email: u.email,
            role: u.role,
            fullName: u.fullName,
            position: u.position,
            department: u.department,
            status: u.status,
          },
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    return Http.ok({ rows });
  } catch (e) {
    return Http.fail(e);
  }
}
