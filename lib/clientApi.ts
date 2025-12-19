export type ApiOk<T> = { ok: true; data: T };
export type ApiFail = { ok: false; error: { code: string; message?: string } };
export type ApiResponse<T> = ApiOk<T> | ApiFail;

export async function apiGet<T>(url: string): Promise<ApiResponse<T>> {
  const res = await fetch(url);
  return (await res.json()) as ApiResponse<T>;
}

export async function apiPost<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return (await res.json()) as ApiResponse<T>;
}

export async function apiDelete<T>(url: string): Promise<ApiResponse<T>> {
  const res = await fetch(url, { method: "DELETE" });
  return (await res.json()) as ApiResponse<T>;
}
