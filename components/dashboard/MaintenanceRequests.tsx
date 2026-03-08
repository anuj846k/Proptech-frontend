'use client';

import Link from 'next/link';
import { Wrench } from 'lucide-react';
import type { TicketListItem } from '@/lib/api/tickets';

type Props = { tickets: TicketListItem[]; loading?: boolean };

export default function MaintenanceRequests({
  tickets,
  loading = false,
}: Props) {
  return (
    <div className="flex h-[309px] flex-col gap-6 rounded-[27px] bg-white p-6 flex-1 min-w-0 overflow-hidden">
      <div className="flex shrink-0 items-center justify-between">
        <h3 className="text-xl font-medium text-[#201f23]">
          Tickets
        </h3>
        <Link
          href="/dashboard/maintenance"
          className="text-base font-medium text-[#596269] opacity-80 hover:underline"
        >
          See All
        </Link>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`flex shrink-0 items-center gap-4 py-4 ${
                i < 2 ? 'border-b border-black/10' : ''
              }`}
            >
              <div className="h-11 w-11 shrink-0 animate-pulse rounded-lg bg-gray-200" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="h-4 w-44 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="h-6 w-16 shrink-0 animate-pulse rounded-full bg-gray-200" />
            </div>
          ))
        ) : tickets.length === 0 ? (
          <p className="py-4 text-sm text-[#596269]">No tickets yet</p>
        ) : (
          tickets.map(({ ticket, propertyName, unitNumber }, i) => (
            <Link
              key={ticket.id}
              href={`/dashboard/maintenance/${ticket.id}`}
              className={`flex shrink-0 items-center gap-4 py-4 hover:bg-gray-50/50 -mx-2 px-2 rounded transition-colors ${
                i < tickets.length - 1 ? 'border-b border-black/10' : ''
              }`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                <Wrench className="h-5 w-5" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-base font-medium text-[#201f23]">
                  {ticket.title}
                </span>
                <span className="text-xs font-medium text-[#8f8e96]">
                  {propertyName} · Unit {unitNumber} · {ticket.priority}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    ticket.technicianId
                      ? 'bg-green-100 text-green-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                  title={ticket.technicianId ? 'Assigned' : 'Unassigned'}
                >
                  {ticket.technicianId ? 'Assigned' : 'Unassigned'}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
