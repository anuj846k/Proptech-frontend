import { LucideIcon } from 'lucide-react';
import { MoreHorizontal, TrendingDown, TrendingUp } from 'lucide-react';

type TrendType = 'up' | 'down';

interface StatCardProps {
  title: string;
  value: string;
  trend: { type: TrendType; value: string };
  lastMonth: string;
  icon: LucideIcon;
  loading?: boolean;
}

export default function StatCard({
  title,
  value,
  trend,
  lastMonth,
  icon: Icon,
  loading = false,
}: StatCardProps) {
  const isPositive = trend.type === 'up';
  const trendBg = isPositive ? 'bg-brand-100' : 'bg-[#98140b]/10';
  const trendColor = isPositive ? 'text-brand-600' : 'text-[#98140b]';

  return (
    <div className="flex h-[171px] min-w-0 flex-1 shrink-0 flex-col justify-between overflow-hidden rounded-[27px] bg-white p-7">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
            <Icon className="h-6 w-6" />
          </div>
          <span className="text-xl font-medium text-[#201f23]">{title}</span>
        </div>
        <button className="p-1 text-[#201f23]" aria-label="More options">
          <MoreHorizontal className="h-6 w-6" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {loading ? (
          <div className="h-10 w-20 animate-pulse rounded-lg bg-gray-200" />
        ) : (
          <span className="text-[40px] font-medium leading-none text-[#201f23]">
            {value}
          </span>
        )}
        <div className="flex items-center gap-2 text-sm">
          {loading ? (
            <div className="h-5 w-16 animate-pulse rounded-lg bg-gray-200" />
          ) : (
            <span
              className={`inline-flex items-center gap-0.5 rounded-lg px-1 py-0.5 text-sm font-medium ${trendBg} ${trendColor}`}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.value}
            </span>
          )}
          <span className="truncate font-medium text-dashboard-muted opacity-80">
            Last month total {lastMonth}
          </span>
        </div>
      </div>
    </div>
  );
}
