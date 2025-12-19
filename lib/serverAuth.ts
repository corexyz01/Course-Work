import { cookies } from "next/headers";
import { AuthService } from "../services/AuthService";

export class ServerAuth {
  public static async currentUser(): Promise<{ id: string; fullName: string; role: "admin" | "employee" } | null> {
    const token = (await cookies()).get("auth_token")?.value;
    if (!token) return null;

    try {
      const auth = new AuthService();
      const user = await auth.getCurrentUser(token);
      return { id: user.id, fullName: user.fullName, role: user.role };
    } catch {
      return null;
    }
  }
}
