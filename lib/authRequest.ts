import { NextRequest } from "next/server";
import { AuthService, type AuthTokenPayload } from "../services/AuthService";
import { UnauthorizedError, ForbiddenError } from "../models/errors";

export class AuthRequest {
  public static getToken(req: NextRequest): string | null {
    const header = req.headers.get("authorization");
    if (header && header.toLowerCase().startsWith("bearer ")) {
      return header.slice("bearer ".length).trim();
    }

    const cookie = req.cookies.get("auth_token")?.value;
    return cookie ?? null;
  }

  public static requirePayload(req: NextRequest, auth?: AuthService): AuthTokenPayload {
    const token = AuthRequest.getToken(req);
    if (!token) throw new UnauthorizedError("Missing token");
    return (auth ?? new AuthService()).verifyToken(token);
  }

  public static requireRole(payload: AuthTokenPayload, role: "admin" | "employee"): void {
    if (payload.role !== role) throw new ForbiddenError("Forbidden");
  }
}
