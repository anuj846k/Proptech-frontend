'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { fetchNotifications, markNotificationRead } from '@/lib/api/notifications';
import type { Notification } from '@/lib/api/notifications';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import Link from 'next/link';
import { Bell, Check } from 'lucide-react';

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const res = await fetchNotifications();
      setNotifications(res.notifications ?? []);
      setLoading(false);
    }
    load();
  }, [user]);

  async function handleMarkRead(notification: Notification) {
    if (notification.isRead) return;
    const res = await markNotificationRead(notification.id);
    if (!res.error && res.data) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, isRead: true } : n,
        ),
      );
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex min-h-screen gap-10 bg-brand-50 pl-10 pr-12">
      <DashboardSidebar />
      <main className="flex min-w-0 flex-1 flex-col gap-8 py-11">
        <DashboardHeader />
        <div className="rounded-[27px] bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-medium text-[#201f23]">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-brand-500 px-2 py-0.5 text-sm text-white">
                  {unreadCount}
                </span>
              )}
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell className="mb-4 h-12 w-12 text-gray-300" />
              <p className="text-[#596269]">No notifications yet</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 border-b border-gray-100 py-4 last:border-0 ${
                    !notification.isRead ? 'bg-brand-50/50' : ''
                  }`}
                >
                  <div className="flex min-w-0 flex-1">
                    <Link
                      href={`/dashboard/maintenance/${notification.ticketId}`}
                      className="min-w-0 flex-1"
                    >
                      <p
                        className={`text-sm ${
                          notification.isRead
                            ? 'text-[#596269]'
                            : 'font-medium text-[#201f23]'
                        }`}
                      >
                        {notification.message}
                      </p>
                      <span className="mt-1 block text-xs text-[#8f8e96]">
                        {formatDate(notification.createdAt)}
                      </span>
                    </Link>
                  </div>
                  {!notification.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(notification)}
                      className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-100"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Mark read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
