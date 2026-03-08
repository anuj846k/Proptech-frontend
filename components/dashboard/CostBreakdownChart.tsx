'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import type { TicketListItem } from '@/lib/api/tickets';
import { STATUS_COLORS } from '@/lib/status';

type Props = { tickets: TicketListItem[]; loading?: boolean };

export default function CostBreakdownChart({ tickets, loading = false }: Props) {
  const statusCounts: Record<string, number> = {};
  for (const t of tickets) {
    statusCounts[t.ticket.status] = (statusCounts[t.ticket.status] ?? 0) + 1;
  }
  const data = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value,
    color: STATUS_COLORS[name] ?? '#9ca3af',
  }));

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex h-[322px] min-w-0 flex-1 flex-col overflow-hidden rounded-[27px] bg-white p-6 min-[1200px]:w-[408px]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-medium text-[#201f23]">
          Ticket Status Breakdown
        </h3>
      </div>

      <div className="flex min-h-0 flex-1 items-center gap-4">
        {loading ? (
          <>
            <div className="h-[220px] w-[220px] min-w-[220px] shrink-0 animate-pulse rounded-full bg-gray-200" />
            <div className="flex flex-col gap-[29px]">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              ))}
            </div>
          </>
        ) : (
        <>
        <div className="relative h-[220px] w-[220px] min-w-[220px] shrink-0">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={220}
            minHeight={220}
          >
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-semibold text-[#201f23] opacity-80">
              {total}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-[29px] justify-center">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="h-3.5 w-3.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs font-medium text-[#45515c] opacity-80">
                {item.name} ({item.value})
              </span>
            </div>
          ))}
        </div>
        </>
        )}
      </div>
    </div>
  );
}
