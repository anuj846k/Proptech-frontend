export type TicketStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'DONE';

const STATUS_BADGE_CLASSES: Record<TicketStatus, string> = {
  OPEN: 'bg-amber-100 text-amber-800',
  ASSIGNED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-orange-100 text-orange-800',
  DONE: 'bg-green-100 text-green-800',
};

export function getTicketStatusBadgeClass(status: string): string {
  return STATUS_BADGE_CLASSES[status as TicketStatus] ?? 'bg-gray-100 text-gray-700';
}

export const STATUS_COLORS: Record<string, string> = {
  OPEN: '#d97706',
  ASSIGNED: '#2563eb',
  IN_PROGRESS: '#ea580c',
  DONE: '#16a34a',
};

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';

const PRIORITY_BADGE_CLASSES: Record<TicketPriority, string> = {
  LOW: 'bg-gray-100 text-gray-700 border-gray-200',
  MEDIUM: 'bg-amber-50 text-amber-800 border-amber-200',
  HIGH: 'bg-red-50 text-red-800 border-red-200',
};

export function getPriorityBadgeClass(priority: string): string {
  return PRIORITY_BADGE_CLASSES[priority as TicketPriority] ?? 'bg-gray-100 text-gray-700 border-gray-200';
}
