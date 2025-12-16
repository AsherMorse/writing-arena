const BASE = import.meta.env.VITE_API_URL;

type ApiResponse<T> = { success: true; data: T } | { success: false; error: { code: string; message: string } };

export async function api<T>(endpoint: string, options?: { method?: string; body?: unknown }): Promise<T> {
  const res = await fetch(`${BASE}${endpoint}`, {
    method: options?.method,
    headers: options?.body ? { "Content-Type": "application/json" } : undefined,
    credentials: "include",
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error.message);
  return json.data;
}

