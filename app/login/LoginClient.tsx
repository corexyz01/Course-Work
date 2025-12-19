"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: { code: string; message?: string } };

export function LoginClient() {
  const router = useRouter();
  const search = useSearchParams();
  const next = useMemo(() => search.get("next") ?? "/", [search]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = (await res.json()) as ApiResponse<{ user: unknown }>;
      if (!json.ok) {
        setError("Невірний email або пароль");
        return;
      }

      router.replace(next);
    } catch {
      setError("Не вдалося виконати вхід");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-zinc-900">Вхід</h1>
          <p className="mt-2 text-sm text-zinc-500">Система обліку робочого часу</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-700">Ел. пошта</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="mt-2" required />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700">Пароль</label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="mt-2" required />
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <Button disabled={loading} className="w-full" type="submit">
            {loading ? "Вхід..." : "Увійти"}
          </Button>
        </form>
      </div>
    </div>
  );
}
