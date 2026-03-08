import { apiFetch, type ApiResponse, type ApiError } from '@/lib/api';

export type Ticket = {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  tenantId: string;
  technicianId: string | null;
  unitId: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type TicketListItem = {
  ticket: Ticket;
  unitNumber: string;
  propertyId: string;
  propertyName: string;
};

export type TicketListParams = {
  status?: Ticket['status'];
  priority?: Ticket['priority'];
  propertyId?: string;
};

export async function fetchTickets(params?: TicketListParams) {
  const search = new URLSearchParams();
  if (params?.status) search.set('status', params.status);
  if (params?.priority) search.set('priority', params.priority);
  if (params?.propertyId) search.set('propertyId', params.propertyId);
  const qs = search.toString();
  const path = `/api/v1/tickets${qs ? `?${qs}` : ''}`;
  const res = await apiFetch<ApiResponse<{ tickets: TicketListItem[] }>>(path);
  if (res.error) return { tickets: [], error: res.error };
  return {
    tickets: (res.data as ApiResponse<{ tickets: TicketListItem[] }>)?.tickets ?? [],
  };
}

export async function fetchAssignedTickets() {
  const res = await apiFetch<ApiResponse<{ tickets: Ticket[] }>>(
    '/api/v1/tickets/assigned',
  );
  if (res.error) return { tickets: [], error: res.error };
  return {
    tickets: (res.data as ApiResponse<{ tickets: Ticket[] }>)?.tickets ?? [],
  };
}

export type CreateTicketInput = {
  title: string;
  description: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  propertyId: string;
  unit: string;
  images?: File[];
};

export async function createTicket(
  data: CreateTicketInput,
): Promise<{ data?: ApiResponse<{ ticket: Ticket }>; error?: ApiError; status: number }> {
  const hasFiles = data.images && data.images.length > 0;

  if (hasFiles) {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('propertyId', data.propertyId);
    formData.append('unit', data.unit);
    if (data.priority) formData.append('priority', data.priority);
    data.images!.forEach((file) => formData.append('images', file));

    const API_BASE =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token =
      typeof window !== 'undefined' ? sessionStorage.getItem('access_token') : null;
    const headers: HeadersInit = {};
    if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/api/v1/tickets`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        error: { error: (body as ApiError)?.error ?? (body as ApiError)?.message ?? 'Request failed' },
        status: res.status,
      };
    }
    return { data: body as ApiResponse<{ ticket: Ticket }>, status: res.status };
  }

  return apiFetch<ApiResponse<{ ticket: Ticket }>>('/api/v1/tickets', {
    method: 'POST',
    body: JSON.stringify({
      title: data.title,
      description: data.description,
      priority: data.priority,
      propertyId: data.propertyId,
      unit: data.unit,
    }),
  });
}

export async function fetchMyTickets() {
  const res = await apiFetch<ApiResponse<{ tickets: Ticket[] }>>(
    '/api/v1/tickets/my',
  );
  if (res.error) return { tickets: [], error: res.error };
  return {
    tickets: (res.data as ApiResponse<{ tickets: Ticket[] }>)?.tickets ?? [],
  };
}

export async function fetchTicketById(id: string) {
  const res = await apiFetch<
    ApiResponse<{ ticket: Ticket; images: { imageUrl: string }[]; activity: unknown[] }>
  >(`/api/v1/tickets/${id}`);
  if (res.error) return { ticket: null, images: [], activity: [], error: res.error };
  const data = res.data as ApiResponse<{
    ticket: Ticket;
    images: { imageUrl: string }[];
    activity: unknown[];
  }>;
  return {
    ticket: data?.ticket ?? null,
    images: data?.images ?? [],
    activity: data?.activity ?? [],
  };
}

export async function assignTicket(id: string, technicianId: string) {
  return apiFetch<ApiResponse<{ ticket: Ticket }>>(
    `/api/v1/tickets/${id}/assign`,
    {
      method: 'PATCH',
      body: JSON.stringify({ technicianId }),
    },
  );
}

export async function updateTicket(
  id: string,
  data: { status?: Ticket['status']; priority?: Ticket['priority'] },
) {
  return apiFetch<ApiResponse<{ ticket: Ticket }>>(
    `/api/v1/tickets/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
  );
}

export async function updateTicketProgress(
  id: string,
  status: 'IN_PROGRESS' | 'DONE',
) {
  return apiFetch<ApiResponse<{ ticket: Ticket }>>(
    `/api/v1/tickets/${id}/progress`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
  );
}
