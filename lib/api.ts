const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export type ApiError = {
  error?: string;
  message?: string;
};

async function refreshTokens(): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/v1/users/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) return false;
  return true;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<{ data?: T; error?: ApiError; status: number }> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  let res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 401) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      res = await fetch(url, { ...options, headers, credentials: 'include' });
    }
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      error: (body as ApiError)?.error
        ? { error: (body as ApiError).error }
        : { error: (body as ApiError)?.message || 'Request failed' },
      status: res.status,
    };
  }
  return { data: body as T, status: res.status };
}

export type ApiResponse<T> = {
  success?: boolean;
  message?: string;
} & T;
