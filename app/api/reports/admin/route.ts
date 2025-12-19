import { NextRequest } from "next/server";
import { Http } from "../../../../lib/http";
import { AuthRequest } from "../../../../lib/authRequest";
import { ReportService } from "../../../../services/ReportService";

export async function GET(req: NextRequest) {
  try {
    const payload = AuthRequest.requirePayload(req);
    AuthRequest.requireRole(payload, "admin");

    const url = new URL(req.url);
    const from = url.searchParams.get("from") ?? "";
    const to = url.searchParams.get("to") ?? "";

    const service = new ReportService();
    const report = await service.adminReport(from, to);
    return Http.ok(report);
  } catch (e) {
    return Http.fail(e);
  }
}
