import { AppShell } from "../../components/AppShell";
import { ServerAuth } from "../../lib/serverAuth";
import { RequestsClient } from "./requestsClient";

export default async function RequestsPage() {
  const user = await ServerAuth.currentUser();
  return (
    <AppShell user={user}>
      <RequestsClient role={user?.role ?? "employee"} />
    </AppShell>
  );
}
