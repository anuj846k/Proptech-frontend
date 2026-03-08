'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { fetchProperties } from '@/lib/api/properties';
import type { Property } from '@/lib/api/properties';
import type { ApiError } from '@/lib/api';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import Link from 'next/link';
import { Building2, AlertCircle } from 'lucide-react';

export default function PropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    async function load() {
      if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) return;
      setError(null);
      const res = await fetchProperties();
      setProperties(res.properties ?? []);
      setError(res.error ?? null);
      setLoading(false);
    }
    load();
  }, [user]);

  const canView =
    user?.role === 'ADMIN' || user?.role === 'MANAGER';

  if (!canView) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-50">
        <p className="text-gray-600">You don&apos;t have access to properties.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen gap-10 bg-brand-50 pl-10 pr-12">
      <DashboardSidebar />
      <main className="flex min-w-0 flex-1 flex-col gap-8 py-11">
        <DashboardHeader />
        <div className="rounded-[27px] bg-white p-6">
          <h2 className="mb-6 text-xl font-medium text-[#201f23]">
            Properties
          </h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 py-4 px-4">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-amber-800">
                {error.error ?? error.message ?? 'Failed to load properties'}
                {error.error === 'Forbidden' &&
                  ' (Properties require ADMIN or MANAGER role)'}
              </p>
            </div>
          ) : properties.length === 0 ? (
            <p className="py-8 text-[#596269]">No properties yet</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((p) => (
                <Link
                  key={p.id}
                  href={`/dashboard/properties/${p.id}`}
                  className="flex items-start gap-4 rounded-xl border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-[#201f23]">{p.name}</h3>
                    <p className="text-sm text-[#596269]">{p.address}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
