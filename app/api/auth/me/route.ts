import { NextRequest } from "next/server";
import { AuthService } from "../../../../services/AuthService";
import { AuthRequest } from "../../../../lib/authRequest";
import { Http } from "../../../../lib/http";

export async function GET(req: NextRequest) {
  try {
    const token = AuthRequest.getToken(req);
    if (!token) return Http.ok({ user: null });

    const auth = new AuthService();
    const user = await auth.getCurrentUser(token);
    return Http.ok({ user: user.toDTO() });
  } catch (e) {
    return Http.fail(e);
  }
}
