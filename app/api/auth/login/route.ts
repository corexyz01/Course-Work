import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "../../../../services/AuthService";
import { Http } from "../../../../lib/http";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email: string; password: string };
    const auth = new AuthService();
    const { token, user } = await auth.login(body.email, body.password);

    const res = Http.ok({ user: user.toDTO() });
    res.cookies.set("auth_token", token, { httpOnly: true, sameSite: "lax", path: "/" });
    return res;
  } catch (e) {
    return Http.fail(e);
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("auth_token", "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
