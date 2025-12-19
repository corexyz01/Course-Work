import { AppShell } from "../../components/AppShell";
import { ServerAuth } from "../../lib/serverAuth";
import { EmployeesClient } from "./employeesClient";

export default async function EmployeesPage() {
  const user = await ServerAuth.currentUser();
  return (
    <AppShell user={user}>
      <EmployeesClient />
    </AppShell>
  );
}
