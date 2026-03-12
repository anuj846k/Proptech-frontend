'use client';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useAuth } from '@/contexts/auth-context';
import type { ApiError } from '@/lib/api';
import {
  fetchUsers,
  updateUser,
  type PublicUser,
  type UpdateUserInput,
} from '@/lib/api/users';
import { AlertCircle, Pencil } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

const ROLES = ['ADMIN', 'MANAGER', 'TECHNICIAN', 'TENANT'] as const;
const PAGE_SIZE = 10;

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UpdateUserInput>({});
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(
    async (page: number = currentPage) => {
      if (!user || user.role !== 'ADMIN') return;
      setError(null);
      const res = await fetchUsers({ page, limit: PAGE_SIZE });
      setUsers(res.users ?? []);
      setTotalPages(res.totalPages || 1);
      setError(res.error ?? null);
    },
    [user, currentPage],
  );

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;
    queueMicrotask(() => {
      void load(currentPage).finally(() => setLoading(false));
    });
  }, [user, currentPage, load]);

  function handlePageChange(page: number) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  async function handleStartEdit(u: PublicUser) {
    setEditingId(u.id);
    setEditForm({
      name: u.name,
      phone: u.phone ?? '',
      role: u.role,
    });
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    const payload: UpdateUserInput = {};
    if (editForm.name !== undefined) payload.name = editForm.name;
    if (editForm.phone !== undefined)
      payload.phone = editForm.phone || undefined;
    if (editForm.role !== undefined) payload.role = editForm.role;
    if (Object.keys(payload).length === 0) {
      setEditingId(null);
      return;
    }
    setSaving(true);
    const res = await updateUser(editingId, payload);
    setSaving(false);
    if (!res.error) {
      toast.success('User updated');
      setEditingId(null);
      load(currentPage);
    } else {
      toast.error(res.error?.error ?? 'Failed to update user');
    }
  }

  const canView = user?.role === 'ADMIN';

  if (!canView) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-50">
        <p className="text-gray-600">You don&apos;t have access to users.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen gap-10 bg-brand-50 pl-10 pr-12">
      <DashboardSidebar />
      <main className="flex min-w-0 flex-1 flex-col gap-8 py-11">
        <DashboardHeader />
        <div className="rounded-[27px] bg-white p-6">
          <h2 className="mb-6 text-xl font-medium text-[#201f23]">Users</h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-4">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-amber-800">
                {error.error ?? error.message ?? 'Failed to load users'}
              </p>
            </div>
          ) : users.length === 0 ? (
            <p className="py-8 text-[#596269]">No users yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-3 font-medium text-[#201f23]">Name</th>
                    <th className="pb-3 font-medium text-[#201f23]">Email</th>
                    <th className="pb-3 font-medium text-[#201f23]">Phone</th>
                    <th className="pb-3 font-medium text-[#201f23]">Role</th>
                    <th className="pb-3 font-medium text-[#201f23]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-gray-100">
                      {editingId === u.id ? (
                        <>
                          <td className="py-3">
                            <input
                              type="text"
                              value={editForm.name ?? ''}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  name: e.target.value,
                                }))
                              }
                              className="w-full max-w-[140px] rounded-lg border border-gray-200 px-2 py-1 text-sm"
                            />
                          </td>
                          <td className="py-3 text-[#596269]">{u.email}</td>
                          <td className="py-3">
                            <input
                              type="text"
                              value={editForm.phone ?? ''}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  phone: e.target.value
                                    .replace(/\D/g, '')
                                    .slice(0, 10),
                                }))
                              }
                              placeholder="10 digits"
                              maxLength={10}
                              className="w-24 rounded-lg border border-gray-200 px-2 py-1 text-sm"
                            />
                          </td>
                          <td className="py-3">
                            <select
                              value={editForm.role ?? u.role}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  role: e.target.value,
                                }))
                              }
                              className="rounded-lg border border-gray-200 px-2 py-1 text-sm"
                            >
                              {ROLES.map((r) => (
                                <option key={r} value={r}>
                                  {r.replace('_', ' ')}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={handleSaveEdit}
                                disabled={saving}
                                className="rounded-lg bg-brand-500 px-3 py-1 text-xs font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                              >
                                {saving ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="rounded-lg border border-gray-200 px-3 py-1 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 font-medium text-[#201f23]">
                            {u.name}
                          </td>
                          <td className="py-3 text-[#596269]">{u.email}</td>
                          <td className="py-3 text-[#596269]">
                            {u.phone || '—'}
                          </td>
                          <td className="py-3 text-[#596269]">
                            {u.role.replace('_', ' ')}
                          </td>
                          <td className="py-3">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(u)}
                              className="inline-flex items-center gap-1 text-brand-600 hover:underline"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage - 1);
                    }}
                    aria-disabled={currentPage <= 1}
                    className={
                      currentPage <= 1
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    if (totalPages <= 7) return true;
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .reduce<(number | 'ellipsis')[]>((acc, page, idx, arr) => {
                    if (idx > 0 && page - (arr[idx - 1] ?? 0) > 1) {
                      acc.push('ellipsis');
                    }
                    acc.push(page);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === 'ellipsis' ? (
                      <PaginationItem key={`ellipsis-${idx}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={item}>
                        <PaginationLink
                          href="#"
                          isActive={item === currentPage}
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(item);
                          }}
                          className="cursor-pointer"
                        >
                          {item}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage + 1);
                    }}
                    aria-disabled={currentPage >= totalPages}
                    className={
                      currentPage >= totalPages
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </main>
    </div>
  );
}
