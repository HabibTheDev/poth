/**
 * Thin REST client, matching the API contract in the product spec
 * (/api/v1/...). Currently unused while USE_MOCK_API is true — see
 * src/services/index.ts. Once the backend from the other repo is
 * deployed, set EXPO_PUBLIC_API_BASE_URL and flip USE_MOCK_API to
 * false; every service in src/services/mock swaps for one hitting
 * these methods without any screen code changing, because screens
 * only ever import from src/services/index.ts.
 */

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.poth.app/api/v1';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      message = body?.message ?? message;
    } catch {
      // ignore body parse failure
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
