'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import {
  fetchPropertyById,
  assignTenantToUnit,
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

  async function load() {
    if (!user || !id) return;
    if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      router.replace('/dashboard');
      return;
    }
    setLoading(true);
    const [propRes, tenantsRes] = await Promise.all([
      fetchPropertyById(id),
      fetchUsers('TENANT'),
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
    setLoading(false);
  }

  useEffect(() => {
    load();
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
              <h3 className="mb-4 text-lg font-medium text-[#201f23]">
                Units ({units.length})
              </h3>
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
