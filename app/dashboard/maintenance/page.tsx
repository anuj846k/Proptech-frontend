'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import {
  fetchTickets,
  fetchAssignedTickets,
  fetchMyTickets,
  createTicket,
  type TicketListItem,
  type Ticket,
} from '@/lib/api/tickets';
import { fetchProperties } from '@/lib/api/properties';
import { fetchMyUnits } from '@/lib/api/units';
import type { MyUnit } from '@/lib/api/units';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import Link from 'next/link';
import { getTicketStatusBadgeClass } from '@/lib/status';
import { toast } from 'sonner';
import { ImagePlus, Plus, X } from 'lucide-react';

const STATUSES = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'DONE'] as const;
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;

export default function MaintenancePage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [myUnits, setMyUnits] = useState<MyUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState({
    unitKey: '',
    title: '',
    description: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    images: [] as File[],
  });
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [propertyFilter, setPropertyFilter] = useState<string>('');
  const [properties, setProperties] = useState<{ id: string; name: string }[]>(
    [],
  );

  async function load() {
    if (!user) return;
    setLoading(true);
    if (user.role === 'ADMIN' || user.role === 'MANAGER') {
      const [ticketsRes, propsRes] = await Promise.all([
        fetchTickets({
          status: statusFilter ? (statusFilter as Ticket['status']) : undefined,
          priority: priorityFilter
            ? (priorityFilter as Ticket['priority'])
            : undefined,
          propertyId: propertyFilter || undefined,
        }),
        fetchProperties(),
      ]);
      setTickets(ticketsRes.tickets ?? []);
      setProperties(
        (propsRes.properties ?? []).map((p) => ({ id: p.id, name: p.name })),
      );
    } else if (user.role === 'TECHNICIAN') {
      const r = await fetchAssignedTickets();
      setTickets(
        (r.tickets ?? []).map((t) => ({
          ticket: t,
          unitNumber: '—',
          propertyId: '',
          propertyName: '—',
        })),
      );
    } else {
      const [ticketsRes, unitsRes] = await Promise.all([
        fetchMyTickets(),
        fetchMyUnits(),
      ]);
      setTickets(
        (ticketsRes.tickets ?? []).map((t) => ({
          ticket: t,
          unitNumber: '—',
          propertyId: '',
          propertyName: '—',
        })),
      );
      setMyUnits(unitsRes.units ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!user) return;
    queueMicrotask(() => {
      void load();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load refetches on filter change
  }, [user, statusFilter, priorityFilter, propertyFilter]);

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    const selected = myUnits.find(
      (u) => `${u.propertyId}:${u.unitNumber}` === createForm.unitKey,
    );
    if (!selected || !createForm.title.trim() || !createForm.description.trim()) {
      toast.error('Please fill in all required fields and select your unit');
      return;
    }
    setSubmitting(true);
    const res = await createTicket({
      title: createForm.title.trim(),
      description: createForm.description.trim(),
      priority: createForm.priority,
      propertyId: selected.propertyId,
      unit: selected.unitNumber,
      images: createForm.images.length > 0 ? createForm.images : undefined,
    });
    setSubmitting(false);
    if (!res.error) {
      toast.success('Ticket created successfully');
      setShowCreateForm(false);
      setCreateForm({
        unitKey: '',
        title: '',
        description: '',
        priority: 'MEDIUM',
        images: [],
      });
      load();
    } else {
      toast.error(res.error?.error ?? 'Failed to create ticket');
    }
  }

  return (
    <div className="flex min-h-screen gap-10 bg-brand-50 pl-10 pr-12">
      <DashboardSidebar />
      <main className="flex min-w-0 flex-1 flex-col gap-8 py-11">
        <DashboardHeader />
        <div className="rounded-[27px] bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-medium text-[#201f23]">
              Maintenance Tickets
            </h2>
            {user?.role === 'TENANT' && (
              <button
                type="button"
                onClick={() => setShowCreateForm((v) => !v)}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                <Plus className="h-4 w-4" />
                {showCreateForm ? 'Cancel' : 'Report Issue'}
              </button>
            )}
          </div>

          {user?.role === 'TENANT' && showCreateForm && (
            <form
              onSubmit={handleCreateTicket}
              className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-6"
            >
              <h3 className="mb-4 text-base font-medium text-[#201f23]">
                Report a maintenance issue
              </h3>
              {myUnits.length === 0 ? (
                <p className="py-4 text-sm text-[#596269]">
                  You don&apos;t have a unit assigned. Contact your property
                  manager to get assigned to a unit first.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  <div>
                    <label
                      htmlFor="unit"
                      className="mb-1 block text-sm font-medium text-[#201f23]"
                    >
                      Your unit *
                    </label>
                    <select
                      id="unit"
                      value={createForm.unitKey}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, unitKey: e.target.value }))
                      }
                      required
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    >
                      <option value="">Select your unit</option>
                      {myUnits.map((u) => (
                        <option
                          key={u.unitId}
                          value={`${u.propertyId}:${u.unitNumber}`}
                        >
                          {u.propertyName} – Unit {u.unitNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="title"
                      className="mb-1 block text-sm font-medium text-[#201f23]"
                    >
                      Title *
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={createForm.title}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, title: e.target.value }))
                      }
                      placeholder="e.g. Leaking faucet in kitchen"
                      required
                      minLength={3}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="description"
                      className="mb-1 block text-sm font-medium text-[#201f23]"
                    >
                      Description *
                    </label>
                    <textarea
                      id="description"
                      value={createForm.description}
                      onChange={(e) =>
                        setCreateForm((f) => ({
                          ...f,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Describe the issue in detail..."
                      required
                      minLength={5}
                      rows={3}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="priority"
                      className="mb-1 block text-sm font-medium text-[#201f23]"
                    >
                      Priority
                    </label>
                    <select
                      id="priority"
                      value={createForm.priority}
                      onChange={(e) =>
                        setCreateForm((f) => ({
                          ...f,
                          priority: e.target
                            .value as 'LOW' | 'MEDIUM' | 'HIGH',
                        }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#201f23]">
                      Photos (optional, up to 5)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files ?? []);
                        const total = createForm.images.length + files.length;
                        if (total > 5) {
                          toast.error('Maximum 5 images allowed');
                          return;
                        }
                        setCreateForm((f) => ({
                          ...f,
                          images: [...f.images, ...files].slice(0, 5),
                        }));
                      }}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-200"
                    />
                    {createForm.images.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {createForm.images.map((file, i) => (
                          <div
                            key={`${file.name}-${i}`}
                            className="flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-1 text-xs"
                          >
                            <ImagePlus className="h-3.5 w-3.5" />
                            <span className="truncate max-w-[120px]">
                              {file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setCreateForm((f) => ({
                                  ...f,
                                  images: f.images.filter((_, idx) => idx !== i),
                                }))
                              }
                              className="text-[#596269] hover:text-red-600"
                              aria-label="Remove"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-fit rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              )}
            </form>
          )}

          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
            <div className="mb-6 flex flex-wrap gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="">All statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="">All priorities</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <select
                value={propertyFilter}
                onChange={(e) => setPropertyFilter(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="">All properties</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            </div>
          ) : tickets.length === 0 ? (
            <p className="py-8 text-[#596269]">No tickets</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-3 font-medium text-[#201f23]">Title</th>
                    <th className="pb-3 font-medium text-[#201f23]">Property</th>
                    <th className="pb-3 font-medium text-[#201f23]">Status</th>
                    <th className="pb-3 font-medium text-[#201f23]">Priority</th>
                    <th className="pb-3 font-medium text-[#201f23]">Assigned</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(({ ticket, propertyName, unitNumber }) => (
                    <tr key={ticket.id} className="border-b border-gray-100">
                      <td className="py-3">
                        <Link
                          href={`/dashboard/maintenance/${ticket.id}`}
                          className="font-medium text-brand-600 hover:underline"
                        >
                          {ticket.title}
                        </Link>
                      </td>
                      <td className="py-3 text-[#596269]">
                        {propertyName} Unit {unitNumber}
                      </td>
                      <td className="py-3">
                        <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${getTicketStatusBadgeClass(ticket.status)}`}
                          >
                            {ticket.status.replace('_', ' ')}
                          </span>
                      </td>
                      <td className="py-3 text-[#596269]">{ticket.priority}</td>
                      <td className="py-3 text-[#596269]">
                        {ticket.technicianId ? 'Yes' : 'No'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
