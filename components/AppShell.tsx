"use client";

import Link from "next/link";
import { useState } from "react";
import { SignOutButton } from "./SignOutButton";
import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";

export function AppShell(props: {
  user?: { fullName: string; role: "admin" | "employee" } | null;
  children: React.ReactNode;
}) {
  const user = props.user;
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (
    <nav className="space-y-1 text-sm">
      <NavItem href="/" label="Головна" onNavigate={() => setMobileOpen(false)} />
      <NavItem href="/timesheets" label="Табель" onNavigate={() => setMobileOpen(false)} />
      <NavItem href="/requests" label="Заявки" onNavigate={() => setMobileOpen(false)} />
      {user?.role === "admin" ? (
        <>
          <NavItem href="/employees" label="Працівники" onNavigate={() => setMobileOpen(false)} />
          <NavItem href="/reports" label="Звіти" onNavigate={() => setMobileOpen(false)} />
        </>
      ) : null}
    </nav>
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto flex max-w-6xl">
        <aside className="hidden min-h-screen w-64 flex-col border-r border-zinc-200 bg-white px-4 py-6 md:flex">
          <div className="mb-8">
            <div className="text-sm font-semibold tracking-wide text-zinc-900">Облік часу</div>
            <div className="mt-1 text-xs text-zinc-500">Курсова робота</div>
          </div>

          {nav}

          <div className="mt-auto pt-6">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <div className="text-xs font-medium text-zinc-700">Користувач</div>
              <div className="mt-1 text-sm text-zinc-900">{user?.fullName ?? ""}</div>
              <div className="mt-1 text-xs text-zinc-500">{user?.role === "admin" ? "Адміністратор" : "Працівник"}</div>
            </div>
          </div>
        </aside>

        <div className="min-h-screen flex-1">
          <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 md:px-6">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  className="md:hidden"
                  onClick={() => setMobileOpen(true)}
                >
                  Меню
                </Button>

                <div>
                  <div className="text-sm text-zinc-500">Вітаємо</div>
                  <div className="text-lg font-semibold">{user?.fullName ?? ""}</div>
                </div>
              </div>

              <SignOutButton />
            </div>
          </header>

          <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
            <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
              <div className="text-sm font-semibold">Меню</div>
              <Button variant="outline" size="sm" type="button" onClick={() => setMobileOpen(false)}>
                Закрити
              </Button>
            </div>
            <div className="p-5">
              {nav}
              <div className="mt-6">
                <SignOutButton />
              </div>
            </div>
          </Dialog>

          <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">{props.children}</main>
        </div>
      </div>
    </div>
  );
}

function NavItem(props: { href: string; label: string; onNavigate?: () => void }) {
  return (
    <Link
      href={props.href}
      onClick={() => props.onNavigate?.()}
      className="block rounded-xl px-3 py-2 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
    >
      {props.label}
    </Link>
  );
}
