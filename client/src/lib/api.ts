const BASE = import.meta.env.VITE_API_URL;

export async function api<T>(endpoint: string, options?: { method?: string; body?: unknown }): Promise<T> {
  const res = await fetch(`${BASE}${endpoint}`, {
    method: options?.method,
    headers: options?.body ? { "Content-Type": "application/json" } : undefined,
    credentials: "include",
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Request failed");
  return res.json();
}

