import { AppShell } from "../../components/AppShell";
import { ServerAuth } from "../../lib/serverAuth";
import { TimesheetsClient } from "./timesheetsClient";

export default async function TimesheetsPage() {
  const user = await ServerAuth.currentUser();
  return (
    <AppShell user={user}>
      <TimesheetsClient />
    </AppShell>
  );
}
