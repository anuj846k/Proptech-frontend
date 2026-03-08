import { apiFetch, type ApiResponse } from '@/lib/api';

export type Notification = {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  ticketId: string;
  createdAt: string | null;
};

export async function fetchNotifications() {
  const res = await apiFetch<ApiResponse<{ notifications: Notification[] }>>(
    '/api/v1/notifications',
  );
  if (res.error) return { notifications: [], error: res.error };
  return {
    notifications:
      (res.data as ApiResponse<{ notifications: Notification[] }>)
        ?.notifications ?? [],
  };
}

export async function markNotificationRead(id: string) {
  return apiFetch<ApiResponse<{ notification: Notification }>>(
    `/api/v1/notifications/${id}/read`,
    { method: 'PATCH' },
  );
}
