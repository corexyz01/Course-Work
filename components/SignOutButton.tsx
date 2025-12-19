"use client";

import { Button } from "./ui/button";

export function SignOutButton() {
  async function signOut() {
    await fetch("/api/auth/login", { method: "DELETE" });
    window.location.href = "/login";
  }

  return (
    <Button onClick={signOut} variant="raspberry" type="button">
      Вийти
    </Button>
  );
}
