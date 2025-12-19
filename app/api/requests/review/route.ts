import { NextRequest } from "next/server";
import { Http } from "../../../../lib/http";
import { AuthRequest } from "../../../../lib/authRequest";
import { RequestService } from "../../../../services/RequestService";

export async function POST(req: NextRequest) {
  try {
    const payload = AuthRequest.requirePayload(req);
    const body = (await req.json()) as {
      requestId: string;
      action: "approve" | "reject";
      reviewComment?: string;
    };

    const service = new RequestService();
    const updated = await service.review({
      reviewerUserId: payload.userId,
      reviewerRole: payload.role,
      requestId: body.requestId,
      action: body.action,
      reviewComment: body.reviewComment,
    });

    return Http.ok({ request: updated.toDTO() });
  } catch (e) {
    return Http.fail(e);
  }
}
