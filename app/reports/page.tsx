import { AppShell } from "../../components/AppShell";
import { ServerAuth } from "../../lib/serverAuth";
import { ReportsClient } from "./reportsClient";

export default async function ReportsPage() {
  const user = await ServerAuth.currentUser();
  return (
    <AppShell user={user}>
      <ReportsClient />
    </AppShell>
  );
}
