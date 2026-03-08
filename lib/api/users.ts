import { apiFetch, type ApiResponse } from '@/lib/api';

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string | null;
};

export async function fetchUsers(role?: string) {
  const path = role
    ? `/api/v1/users/users?role=${encodeURIComponent(role)}`
    : '/api/v1/users/users';
  const res = await apiFetch<ApiResponse<{ users: PublicUser[] }>>(path);
  if (res.error) return { users: [], error: res.error };
  return {
    users: (res.data as ApiResponse<{ users: PublicUser[] }>)?.users ?? [],
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
