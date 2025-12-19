import { NextResponse } from "next/server";
import { DomainError } from "../models/errors";

export class Http {
  public static ok(data: unknown, init?: ResponseInit): NextResponse {
    return NextResponse.json({ ok: true, data }, init);
  }

  public static fail(error: unknown, init?: ResponseInit): NextResponse {
    if (error instanceof DomainError) {
      const status = Http.statusFromCode(error.code);
      return NextResponse.json({ ok: false, error: { code: error.code, message: error.message } }, { status, ...init });
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { ok: false, error: { code: "INTERNAL", message: error.message } },
        { status: 500, ...init },
      );
    }

    return NextResponse.json({ ok: false, error: { code: "INTERNAL", message: "Unknown error" } }, { status: 500, ...init });
  }

  private static statusFromCode(code: string): number {
    if (code === "VALIDATION_ERROR") return 400;
    if (code === "UNAUTHORIZED") return 401;
    if (code === "FORBIDDEN") return 403;
    if (code === "NOT_FOUND") return 404;
    return 500;
  }
}
