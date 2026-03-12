'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import {
  fetchPropertyById,
  assignTenantToUnit,
  assignManagerToProperty,
  createUnit,
  type CreateUnitInput,
} from '@/lib/api/properties';
import { fetchUsers } from '@/lib/api/users';
import type { Property, Unit } from '@/lib/api/properties';
import { toast } from 'sonner';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import Link from 'next/link';
import { Building2, ArrowLeft } from 'lucide-react';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningUnitId, setAssigningUnitId] = useState<string | null>(null);
  const [managers, setManagers] = useState<{ id: string; name: string }[]>([]);
  const [assignManagerId, setAssignManagerId] = useState('');
  const [assigningManager, setAssigningManager] = useState(false);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [addingUnit, setAddingUnit] = useState(false);
  const [unitForm, setUnitForm] = useState<CreateUnitInput>({
    unitNumber: '',
    floor: 0,
  });

  async function load() {
    if (!user || !id) return;
    if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      router.replace('/dashboard');
      return;
    }
    setLoading(true);
    const [propRes, tenantsRes, managersRes] = await Promise.all([
      fetchPropertyById(id),
      fetchUsers({ role: 'TENANT' }),
      user.role === 'ADMIN' ? fetchUsers({ role: 'MANAGER' }) : Promise.resolve({ users: [] }),
    ]);
    if (propRes.error) {
      router.replace('/dashboard/properties');
      return;
    }
    setProperty(propRes.property);
    setUnits(propRes.units ?? []);
    setTenants(
      (tenantsRes.users ?? []).map((u) => ({ id: u.id, name: u.name })),
    );
    setManagers(
      (managersRes.users ?? []).map((u) => ({ id: u.id, name: u.name })),
    );
    setLoading(false);
  }

  useEffect(() => {
    if (!user || !id) return;
    queueMicrotask(() => {
      void load().finally(() => setLoading(false));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load is stable, deps are user/id/router
  }, [user, id, router]);

  async function handleAssignTenant(
    unitId: string,
    tenantId: string | null,
  ) {
    if (!id) return;
    setAssigningUnitId(unitId);
    const res = await assignTenantToUnit(id, unitId, tenantId);
    setAssigningUnitId(null);
    if (!res.error) {
      toast.success(tenantId ? 'Tenant assigned' : 'Tenant unassigned');
      load();
    } else {
      toast.error(res.error?.error ?? 'Failed to update unit');
    }
  }

  async function handleAssignManager() {
    if (!id || !assignManagerId) return;
    setAssigningManager(true);
    const res = await assignManagerToProperty(id, assignManagerId);
    setAssigningManager(false);
    if (!res.error) {
      toast.success('Manager assigned');
      setAssignManagerId('');
      load();
    } else {
      toast.error(res.error?.error ?? 'Failed to assign manager');
    }
  }

  async function handleCreateUnit(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !unitForm.unitNumber.trim()) return;
    setAddingUnit(true);
    const res = await createUnit(id, {
      unitNumber: unitForm.unitNumber.trim(),
      floor: Number(unitForm.floor) || 0,
    });
    setAddingUnit(false);
    if (!res.error) {
      toast.success('Unit created');
      setShowAddUnit(false);
      setUnitForm({ unitNumber: '', floor: 0 });
      load();
    } else {
      toast.error(res.error?.error ?? 'Failed to create unit');
    }
  }

  if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
    return null;
  }

  return (
    <div className="flex min-h-screen gap-10 bg-brand-50 pl-10 pr-12">
      <DashboardSidebar />
      <main className="flex min-w-0 flex-1 flex-col gap-8 py-11">
        <DashboardHeader />
        <div className="rounded-[27px] bg-white p-6">
          <Link
            href="/dashboard/properties"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Properties
          </Link>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            </div>
          ) : !property ? (
            <p className="py-8 text-[#596269]">Property not found</p>
          ) : (
            <>
              <div className="mb-8 flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                  <Building2 className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-medium text-[#201f23]">
                    {property.name}
                  </h2>
                  <p className="text-[#596269]">{property.address}</p>
                </div>
              </div>

              {user.role === 'ADMIN' && managers.length > 0 && (
                <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <h3 className="mb-3 text-sm font-medium text-[#201f23]">
                    Assign Manager
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={assignManagerId}
                      onChange={(e) => setAssignManagerId(e.target.value)}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    >
                      <option value="">Select manager</option>
                      {managers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAssignManager}
                      disabled={!assignManagerId || assigningManager}
                      className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                    >
                      {assigningManager ? 'Assigning...' : 'Assign'}
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-lg font-medium text-[#201f23]">
                  Units ({units.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddUnit(true)}
                  className="inline-flex items-center gap-1 rounded-lg border border-brand-500 px-3 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-50"
                >
                  + Add Unit
                </button>
              </div>

              {showAddUnit && (
                <form
                  onSubmit={handleCreateUnit}
                  className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4"
                >
                  <h4 className="mb-3 text-sm font-medium">New Unit</h4>
                  <div className="flex flex-wrap items-end gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium">Unit #</label>
                      <input
                        type="text"
                        value={unitForm.unitNumber}
                        onChange={(e) =>
                          setUnitForm((f) => ({
                            ...f,
                            unitNumber: e.target.value,
                          }))
                        }
                        placeholder="e.g. 101"
                        required
                        className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium">Floor</label>
                      <input
                        type="number"
                        min={0}
                        value={unitForm.floor}
                        onChange={(e) =>
                          setUnitForm((f) => ({
                            ...f,
                            floor: parseInt(e.target.value, 10) || 0,
                          }))
                        }
                        className="w-20 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddUnit(false)}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addingUnit}
                      className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                    >
                      {addingUnit ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                </form>
              )}

              {units.length === 0 ? (
                <p className="py-4 text-[#596269]">No units</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left">
                        <th className="pb-3 font-medium text-[#201f23]">Unit</th>
                        <th className="pb-3 font-medium text-[#201f23]">
                          Floor
                        </th>
                        <th className="pb-3 font-medium text-[#201f23]">
                          Tenant
                        </th>
                        <th className="pb-3 font-medium text-[#201f23]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {units.map((u) => (
                        <tr
                          key={u.id}
                          className="border-b border-gray-100"
                        >
                          <td className="py-3 text-[#201f23]">
                            {u.unitNumber}
                          </td>
                          <td className="py-3 text-[#596269]">{u.floor}</td>
                          <td className="py-3 text-[#596269]">
                            {u.tenantId ? (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                Occupied
                              </span>
                            ) : (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                Vacant
                              </span>
                            )}
                          </td>
                          <td className="py-3">
                            {u.tenantId ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleAssignTenant(u.id, null)
                                }
                                disabled={
                                  assigningUnitId === u.id
                                }
                                className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                              >
                                {assigningUnitId === u.id
                                  ? 'Unassigning...'
                                  : 'Unassign'}
                              </button>
                            ) : (
                              <select
                                value=""
                                onChange={(e) => {
                                  const tid = e.target.value;
                                  if (tid)
                                    handleAssignTenant(u.id, tid);
                                }}
                                disabled={
                                  assigningUnitId === u.id ||
                                  tenants.length === 0
                                }
                                className="rounded-lg border border-gray-200 px-2 py-1 text-xs disabled:opacity-50"
                              >
                                <option value="">
                                  {assigningUnitId === u.id
                                    ? 'Assigning...'
                                    : tenants.length === 0
                                      ? 'No tenants'
                                      : 'Assign tenant'}
                                </option>
                                {tenants.map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {t.name}
                                  </option>
                                ))}
                              </select>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
