const BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("eventsphere_token");
}

export function setToken(token: string) {
  localStorage.setItem("eventsphere_token", token);
}

export function clearToken() {
  localStorage.removeItem("eventsphere_token");
}

async function request<T>(method: string, endpoint: string, body?: unknown): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data as T;
}

export const api = {
  get: <T>(endpoint: string) => request<T>("GET", endpoint),
  post: <T>(endpoint: string, body?: unknown) => request<T>("POST", endpoint, body),
  put: <T>(endpoint: string, body?: unknown) => request<T>("PUT", endpoint, body),
  delete: <T>(endpoint: string) => request<T>("DELETE", endpoint),
};
