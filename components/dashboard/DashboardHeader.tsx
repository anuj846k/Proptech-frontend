'use client';

import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { Bell, MessageCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardHeader() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <header className="flex items-center justify-between gap-20 w-full">
      <div className="flex flex-col gap-2 text-[#201f23]">
        <h1 className="text-[32px] font-medium leading-none">
          Hello, {firstName}!
        </h1>
        <p className="text-xl tracking-[0.6px] text-[#201f23]/90">
          Explore information and activity about your property
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center justify-between bg-white rounded-[180px] w-[425px] pl-[22px] pr-2 py-2">
          <span className="text-base text-[#201f23] tracking-[0.48px]">
            Search Anything...
          </span>
          <Button
            type="button"
            size="icon"
            className="h-14 w-14 shrink-0 rounded-full bg-brand-500 text-white hover:bg-brand-600"
            aria-label="Search"
          >
            <Search className="h-6 w-6" />
          </Button>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="relative h-[70px] w-[70px] rounded-full bg-white shadow-sm hover:bg-gray-50"
          aria-label="Messages"
        >
          <MessageCircle className="h-9 w-9 text-[#201f23]" />
          <span
            className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-brand-500"
            aria-hidden
          />
        </Button>

        <Link
          href="/dashboard/notifications"
          className="flex h-[70px] w-[70px] items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-gray-50"
          aria-label="Notifications"
        >
          <Bell className="h-9 w-9 text-[#201f23]" />
        </Link>
      </div>
    </header>
  );
}
