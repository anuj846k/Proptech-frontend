const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export type ApiError = {
  error?: string;
  message?: string;
};

async function getAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('access_token');
}

async function setTokens(accessToken: string, refreshToken: string) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('access_token', accessToken);
  sessionStorage.setItem('refresh_token', refreshToken);
}

export async function clearTokens() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('refresh_token');
}

async function refreshTokens(): Promise<boolean> {
  const refreshToken =
    typeof window !== 'undefined'
      ? sessionStorage.getItem('refresh_token')
      : null;
  if (!refreshToken) return false;

  const res = await fetch(`${API_BASE}/api/v1/users/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    credentials: 'include',
  });

  if (!res.ok) return false;
  const data = (await res.json()) as {
    accessToken?: string;
    refreshToken?: string;
  };
  if (data.accessToken && data.refreshToken) {
    setTokens(data.accessToken, data.refreshToken);
    return true;
  }
  return false;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<{ data?: T; error?: ApiError; status: number }> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const accessToken = await getAccessToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] =
      `Bearer ${accessToken}`;
  }

  let res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 401) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      const newToken = await getAccessToken();
      if (newToken) {
        (headers as Record<string, string>)['Authorization'] =
          `Bearer ${newToken}`;
        res = await fetch(url, { ...options, headers, credentials: 'include' });
      }
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
