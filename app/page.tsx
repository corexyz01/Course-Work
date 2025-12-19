import { AppShell } from "../components/AppShell";
import { ServerAuth } from "../lib/serverAuth";
import { DashboardClient } from "./DashboardClient";

function iso(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function Home() {
  const user = await ServerAuth.currentUser();

  const today = new Date();
  const from = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);

  return (
    <AppShell user={user}>
      <DashboardClient initialFrom={iso(from)} initialTo={iso(today)} />
    </AppShell>
  );
}
