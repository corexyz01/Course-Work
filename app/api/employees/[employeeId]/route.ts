import { NextRequest } from "next/server";
import { AuthRequest } from "../../../../lib/authRequest";
import { Http } from "../../../../lib/http";
import { AdminEmployeeService } from "../../../../services/AdminEmployeeService";

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ employeeId: string }> }) {
  try {
    const payload = AuthRequest.requirePayload(req);
    const { employeeId } = await ctx.params;

    const service = new AdminEmployeeService();
    await service.deleteEmployeeCascade({ actorRole: payload.role, employeeId });

    return Http.ok({ deleted: true });
  } catch (e) {
    return Http.fail(e);
  }
}
