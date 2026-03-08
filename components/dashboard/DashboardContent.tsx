'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import {
  fetchProperties,
  fetchOccupancy,
  type OccupancyItem,
} from '@/lib/api/properties';
import {
  fetchTickets,
  fetchAssignedTickets,
  fetchMyTickets,
  type TicketListItem,
} from '@/lib/api/tickets';
import type { Property } from '@/lib/api/properties';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import CostBreakdownChart from './CostBreakdownChart';
import LastTransactions from './LastTransactions';
import OccupancyCard from './OccupancyCard';
import ReportSalesChart from './ReportSalesChart';
import StatCard from './StatCard';
import { Building2, AlertCircle, ListTodo } from 'lucide-react';

export default function DashboardContent() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [occupancy, setOccupancy] = useState<OccupancyItem[]>([]);
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      setLoading(true);
      setPropertiesError(null);
      const role = user.role;

      const [propsRes, occupancyRes, ticketsRes] = await Promise.all([
        role === 'ADMIN' || role === 'MANAGER' ? fetchProperties() : { properties: [] },
        role === 'ADMIN' || role === 'MANAGER' ? fetchOccupancy() : { occupancy: [] },
        role === 'MANAGER' || role === 'ADMIN'
          ? fetchTickets()
          : role === 'TECHNICIAN'
            ? fetchAssignedTickets().then((r) => ({
                tickets: (r.tickets ?? []).map((t) => ({
                  ticket: t,
                  unitNumber: '—',
                  propertyId: '',
                  propertyName: 'Assigned',
                })),
              }))
            : fetchMyTickets().then((r) => ({
                tickets: (r.tickets ?? []).map((t) => ({
                  ticket: t,
                  unitNumber: '—',
                  propertyId: '',
                  propertyName: 'My Unit',
                })),
              })),
      ]);

      setProperties(propsRes.properties ?? []);
      setOccupancy(occupancyRes.occupancy ?? []);
      const err = 'error' in propsRes ? propsRes.error : undefined;
      setPropertiesError(
        err
          ? (err as { error?: string; message?: string }).error ??
            (err as { error?: string; message?: string }).message ??
            'Failed to load properties'
          : null
      );
      setTickets(ticketsRes.tickets ?? []);
      setLoading(false);
    }
    load();
  }, [user]);

  const openCount = tickets.filter(
    (t) => t.ticket.status === 'OPEN' || t.ticket.status === 'ASSIGNED',
  ).length;
  const totalTickets = tickets.length;

  const recentTickets = [...tickets]
    .sort(
      (a, b) =>
        new Date(b.ticket.createdAt ?? 0).getTime() -
        new Date(a.ticket.createdAt ?? 0).getTime(),
    )
    .slice(0, 3);

  return (
    <div className="flex min-h-[125vh] gap-10 pl-10 pr-12">
      <DashboardSidebar />

      <main className="flex min-w-0 flex-1 flex-col gap-8 py-11">
        <DashboardHeader />

        {propertiesError && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 py-2 px-4">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">Properties: {propertiesError}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
              <StatCard
                title="Total Properties"
                value={properties.length.toString()}
                trend={{ type: 'up', value: '-' }}
                lastMonth="-"
                icon={Building2}
                loading={loading}
              />
            )}
            <StatCard
              title="Open Tickets"
              value={openCount.toString()}
              trend={{ type: 'up', value: '-' }}
              lastMonth="-"
              icon={AlertCircle}
              loading={loading}
            />
            <StatCard
              title="Total Tickets"
              value={totalTickets.toString()}
              trend={{ type: 'up', value: '-' }}
              lastMonth="-"
              icon={ListTodo}
              loading={loading}
            />
          </div>

          <div className="flex gap-3">
            <ReportSalesChart tickets={tickets} loading={loading} />
            <CostBreakdownChart tickets={tickets} loading={loading} />
          </div>

          <div className="flex gap-3">
            <LastTransactions tickets={recentTickets} loading={loading} />
            {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
              <OccupancyCard occupancy={occupancy} loading={loading} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
