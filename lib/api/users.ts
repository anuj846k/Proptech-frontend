import { apiFetch, type ApiResponse } from '@/lib/api';

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string | null;
};

export type PaginatedUsersResponse = {
  users: PublicUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function fetchUsers(
  opts: { role?: string; page?: number; limit?: number } = {},
) {
  const params = new URLSearchParams();
  if (opts.role) params.set('role', opts.role);
  if (opts.page) params.set('page', String(opts.page));
  if (opts.limit) params.set('limit', String(opts.limit));
  const qs = params.toString();
  const path = `/api/v1/users/users${qs ? `?${qs}` : ''}`;
  const res = await apiFetch<ApiResponse<PaginatedUsersResponse>>(path);
  if (res.error)
    return {
      users: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      error: res.error,
    };
  const data = res.data as ApiResponse<PaginatedUsersResponse>;
  return {
    users: data?.users ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    limit: data?.limit ?? 10,
    totalPages: data?.totalPages ?? 0,
  };
}

export async function fetchUserById(id: string) {
  const res = await apiFetch<ApiResponse<{ user: PublicUser }>>(
    `/api/v1/users/users/${id}`,
  );
  if (res.error) return { user: null, error: res.error };
  return {
    user: (res.data as ApiResponse<{ user: PublicUser }>)?.user ?? null,
  };
}

export type UpdateUserInput = {
  name?: string;
  phone?: string;
  role?: string;
};

export async function updateUser(id: string, data: UpdateUserInput) {
  return apiFetch<ApiResponse<{ user: PublicUser }>>(
    `/api/v1/users/users/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
  );
}
