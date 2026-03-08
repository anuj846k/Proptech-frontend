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
