'use client';

import Link from 'next/link';
import { FileText } from 'lucide-react';
import type { TicketListItem } from '@/lib/api/tickets';
import { getTicketStatusBadgeClass } from '@/lib/status';

type Props = { tickets: TicketListItem[]; loading?: boolean };

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function LastTransactions({ tickets, loading = false }: Props) {
  return (
    <div className="flex flex-col gap-6 rounded-[27px] bg-white p-6 h-[309px] flex-1 min-w-0 overflow-hidden">
      <div className="flex shrink-0 items-center justify-between">
        <h3 className="text-xl font-medium text-[#201f23]">Recent Tickets</h3>
        <Link
          href="/dashboard/maintenance"
          className="text-base font-medium text-[#596269] opacity-80 hover:underline"
        >
          See All
        </Link>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overflow-x-hidden">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex shrink-0 items-center gap-5 border-b border-black/10 pb-5 last:border-0"
            >
              <div className="h-[58px] w-[58px] shrink-0 animate-pulse rounded-lg bg-gray-200" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-36 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="h-5 w-16 shrink-0 animate-pulse rounded bg-gray-200" />
            </div>
          ))
        ) : tickets.length === 0 ? (
          <p className="py-4 text-sm text-[#596269]">No tickets yet</p>
        ) : (
          tickets.map(({ ticket, propertyName, unitNumber }) => (
            <Link
              key={ticket.id}
              href={`/dashboard/maintenance/${ticket.id}`}
              className="flex min-w-0 shrink-0 items-center gap-5 border-b border-black/10 pb-5 last:border-0 hover:bg-gray-50/50 -mx-2 px-2 rounded transition-colors"
            >
              <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                <div className="flex min-w-0 flex-1 flex-col gap-2 overflow-hidden">
                  <span className="truncate text-base font-medium text-[#201f23]">
                    {ticket.title}
                  </span>
                  <span className="truncate text-xs font-medium text-[#8f8e96]">
                    {propertyName} · Unit {unitNumber} ·{' '}
                    {formatDate(ticket.createdAt)}
                  </span>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${getTicketStatusBadgeClass(ticket.status)}`}
                >
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
