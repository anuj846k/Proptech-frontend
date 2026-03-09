'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import {
  fetchTicketById,
  assignTicket,
  updateTicket,
  updateTicketProgress,
} from '@/lib/api/tickets';
import { fetchUsers } from '@/lib/api/users';
import type { Ticket } from '@/lib/api/tickets';
import { getTicketStatusBadgeClass, getPriorityBadgeClass } from '@/lib/status';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import Link from 'next/link';
import {
  ArrowLeft,
  Wrench,
  Calendar,
  AlertTriangle,
  User,
  Clock,
  ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { TicketImageLightbox } from '@/components/dashboard/TicketImageLightbox';

export type ActivityLog = {
  id: string;
  ticketId: string;
  actionType: string;
  performedBy: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string | null;
};

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

function formatActionType(type: string) {
  return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function MaintenanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [images, setImages] = useState<{ imageUrl: string }[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [technicians, setTechnicians] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [assignTechId, setAssignTechId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; alt: string } | null>(null);

  useEffect(() => {
    async function load() {
      if (!user || !id) return;
      const res = await fetchTicketById(id);
      if (res.error) {
        router.replace('/dashboard/maintenance');
        return;
      }
      setTicket(res.ticket);
      setImages(res.images ?? []);
      setActivity((res.activity ?? []) as ActivityLog[]);
      setAssignTechId(res.ticket?.technicianId ?? '');
      setLoading(false);

      if (user.role === 'ADMIN' || user.role === 'MANAGER') {
        const usersRes = await fetchUsers('TECHNICIAN');
        setTechnicians(
          (usersRes.users ?? []).map((u) => ({ id: u.id, name: u.name })),
        );
      }
    }
    load();
  }, [user, id, router]);

  async function handleAssign() {
    if (!assignTechId || !id) return;
    setAssigning(true);
    const res = await assignTicket(id, assignTechId);
    setAssigning(false);
    if (!res.error && res.data) {
      toast.success('Technician assigned successfully');
      const d = res.data as { ticket?: Ticket };
      if (d.ticket) {
        setTicket(d.ticket);
        setAssignTechId(d.ticket.technicianId ?? '');
        const refetch = await fetchTicketById(id);
        if (!refetch.error && refetch.activity) {
          setActivity((refetch.activity ?? []) as ActivityLog[]);
        }
      }
    }
  }

  async function handleStatusChange(status: Ticket['status']) {
    if (!id) return;
    const isTechnician = user?.role === 'TECHNICIAN';
    const res =
      isTechnician && (status === 'IN_PROGRESS' || status === 'DONE')
        ? await updateTicketProgress(id, status)
        : await updateTicket(id, { status });
    if (!res.error && res.data) {
      const d = res.data as { ticket?: Ticket };
      if (d.ticket) {
        setTicket(d.ticket);
        const refetch = await fetchTicketById(id);
        if (!refetch.error && refetch.activity) {
          setActivity((refetch.activity ?? []) as ActivityLog[]);
        }
      }
      if (isTechnician) {
        if (status === 'DONE') toast.success('Ticket marked as done');
        else if (status === 'IN_PROGRESS') toast.success('Work started');
      } else {
        toast.success('Status updated');
      }
    }
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen gap-10 bg-brand-50 pl-10 pr-12">
      <DashboardSidebar />
      <main className="flex min-w-0 flex-1 flex-col gap-8 py-11">
        <DashboardHeader />
        <div className="flex flex-col gap-6">
          <Link
            href="/dashboard/maintenance"
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-brand-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Maintenance Tickets
          </Link>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            </div>
          ) : !ticket ? (
            <div className="rounded-[27px] bg-white p-8">
              <p className="text-[#596269]">Maintenance ticket not found</p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main content */}
              <div className="flex flex-col gap-6 lg:col-span-2">
                <div className="rounded-[27px] bg-white p-6">
                  <div className="mb-6 flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                      <Wrench className="h-7 w-7" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#8f8e96]">
                        Maintenance Ticket #{ticket.id.slice(0, 8)}
                      </span>
                      <h2 className="text-2xl font-medium text-[#201f23]">
                        {ticket.title}
                      </h2>
                      <p className="mt-2 text-[#596269]">{ticket.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${getTicketStatusBadgeClass(ticket.status)}`}
                    >
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium ${getPriorityBadgeClass(ticket.priority)}`}
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {ticket.priority} priority
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm text-[#8f8e96]">
                      <Calendar className="h-4 w-4" />
                      Created {formatDate(ticket.createdAt)}
                    </span>
                    {ticket.updatedAt && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-[#8f8e96]">
                        <Clock className="h-4 w-4" />
                        Updated {formatDate(ticket.updatedAt)}
                      </span>
                    )}
                  </div>
                </div>

                {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
                  <>
                    <div className="rounded-[27px] border border-gray-200 bg-white p-6">
                      <h3 className="mb-4 text-base font-medium text-[#201f23]">
                        Update Status & Priority
                      </h3>
                      <div className="flex flex-wrap items-center gap-3">
                        <select
                          value={ticket.status}
                          onChange={(e) =>
                            handleStatusChange(
                              e.target.value as Ticket['status'],
                            )
                          }
                          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        >
                          <option value="OPEN">Open</option>
                          <option value="ASSIGNED">Assigned</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="DONE">Done</option>
                        </select>
                        <select
                          value={ticket.priority}
                          onChange={(e) => {
                            const priority = e.target
                              .value as Ticket['priority'];
                            updateTicket(id, { priority }).then(async (res) => {
                              if (!res.error && res.data) {
                                const d = res.data as { ticket?: Ticket };
                                if (d.ticket) setTicket(d.ticket);
                                const refetch = await fetchTicketById(id);
                                if (!refetch.error && refetch.activity) {
                                  setActivity(
                                    (refetch.activity ?? []) as ActivityLog[],
                                  );
                                }
                                toast.success('Priority updated');
                              }
                            });
                          }}
                          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                        </select>
                      </div>
                    </div>
                    <div className="rounded-[27px] border border-gray-200 bg-white p-6">
                      <h3 className="mb-4 flex items-center gap-2 text-base font-medium text-[#201f23]">
                        <User className="h-4 w-4" />
                        Assign Technician
                      </h3>
                    <div className="flex flex-wrap gap-2">
                      <select
                        value={assignTechId}
                        onChange={(e) => setAssignTechId(e.target.value)}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      >
                        <option value="">Select technician</option>
                        {technicians.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleAssign}
                        disabled={!assignTechId || assigning}
                        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                      >
                        {assigning ? 'Assigning...' : 'Assign'}
                      </button>
                    </div>
                  </div>
                  </>
                )}

                {user.role === 'TECHNICIAN' &&
                  ticket.technicianId === user.id &&
                  (ticket.status === 'ASSIGNED' ||
                    ticket.status === 'IN_PROGRESS') && (
                    <div className="rounded-[27px] border border-gray-200 bg-white p-6">
                      <h3 className="mb-4 text-base font-medium text-[#201f23]">
                        Update Progress
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusChange('IN_PROGRESS')}
                          disabled={ticket.status === 'IN_PROGRESS'}
                          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                        >
                          Start Work
                        </button>
                        <button
                          onClick={() => handleStatusChange('DONE')}
                          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                          Mark Done
                        </button>
                      </div>
                    </div>
                  )}

                {images.length > 0 && (
                  <div className="rounded-[27px] bg-white p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-base font-medium text-[#201f23]">
                      <ImageIcon className="h-4 w-4" />
                      Attachments ({images.length})
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      {images.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() =>
                            setLightboxImage({
                              url: img.imageUrl,
                              alt: `Attachment ${i + 1}`,
                            })
                          }
                          className="block overflow-hidden rounded-lg border border-gray-200 transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.imageUrl}
                            alt={`Attachment ${i + 1}`}
                            className="h-32 w-32 cursor-pointer object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {lightboxImage && (
                  <TicketImageLightbox
                    imageUrl={lightboxImage.url}
                    alt={lightboxImage.alt}
                    isOpen
                    onClose={() => setLightboxImage(null)}
                  />
                )}
              </div>

              {/* Sidebar - Activity timeline */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 rounded-[27px] bg-white p-6">
                  <h3 className="mb-4 text-base font-medium text-[#201f23]">
                    Activity Timeline
                  </h3>
                  {activity.length === 0 ? (
                    <p className="text-sm text-[#8f8e96]">No activity yet</p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {activity.map((log) => (
                        <div
                          key={log.id}
                          className="relative border-l-2 border-brand-200 pl-4 pb-4 last:pb-0"
                        >
                          <div className="absolute -left-[9px] top-1 h-3 w-3 rounded-full bg-brand-500" />
                          <span className="text-xs font-medium text-brand-600">
                            {formatActionType(log.actionType)}
                          </span>
                          {log.newValue && (
                            <p className="mt-1 text-sm text-[#596269]">
                              {log.newValue}
                            </p>
                          )}
                          <span className="mt-1 block text-xs text-[#8f8e96]">
                            {formatDate(log.createdAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
