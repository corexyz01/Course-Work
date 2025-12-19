import { NextRequest } from "next/server";
import { AuthService } from "../../../../services/AuthService";
import { Http } from "../../../../lib/http";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      email: string;
      password: string;
      fullName: string;
      position: string;
      department: string;
    };

    const auth = new AuthService();
    const user = await auth.registerAdminIfEmpty(body);
    return Http.ok({ user: user.toDTO() }, { status: 201 });
  } catch (e) {
    return Http.fail(e);
  }
}
