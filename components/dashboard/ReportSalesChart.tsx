'use client';

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import type { TicketListItem } from '@/lib/api/tickets';
import { STATUS_COLORS } from '@/lib/status';

const STATUS_ORDER = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'DONE'] as const;

type Props = { tickets: TicketListItem[]; loading?: boolean };

export default function ReportSalesChart({ tickets, loading = false }: Props) {
  const data = STATUS_ORDER.map((status) => ({
    name: status.replace('_', ' '),
    value: tickets.filter((t) => t.ticket.status === status).length,
    fill: STATUS_COLORS[status] ?? '#9ca3af',
  }));

  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="relative flex h-[322px] min-w-0 flex-1 flex-col overflow-hidden rounded-[27px] bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-medium text-[#201f23]">
          Tickets by Status
        </h3>
      </div>

      <div className="relative flex-1 pt-4 min-h-[180px]">
        {loading ? (
          <div className="flex h-full items-end justify-around gap-4 px-2">
            {[40, 65, 45, 80].map((h, i) => (
              <div
                key={i}
                className="w-full max-w-[54px] animate-pulse rounded-t-lg bg-gray-200"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        ) : (
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={180}
        >
          <BarChart
            data={data}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <YAxis
              hide
              domain={[0, maxVal]}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#201f23', opacity: 0.6, fontSize: 14 }}
              dy={10}
            />
            <Bar
              dataKey="value"
              radius={[8, 8, 0, 0]}
              maxBarSize={54}
              label={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
