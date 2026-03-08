'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import {
  fetchProperties,
  createProperty,
  type Property,
  type CreatePropertyInput,
} from '@/lib/api/properties';
import type { ApiError } from '@/lib/api';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import Link from 'next/link';
import { Building2, AlertCircle, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export default function PropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState<CreatePropertyInput>({
    name: '',
    address: '',
  });

  async function load() {
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) return;
    const res = await fetchProperties();
    setProperties(res.properties ?? []);
    setError(res.error ?? null);
  }

  useEffect(() => {
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) return;
    let cancelled = false;
    void (async () => {
      const res = await fetchProperties();
      if (cancelled) return;
      setProperties(res.properties ?? []);
      setError(res.error ?? null);
    })().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleCreateProperty(e: React.FormEvent) {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.address.trim()) return;
    setCreating(true);
    const res = await createProperty(createForm);
    setCreating(false);
    if (!res.error) {
      toast.success('Property created');
      setShowCreate(false);
      setCreateForm({ name: '', address: '' });
      load();
    } else {
      toast.error(res.error?.error ?? 'Failed to create property');
    }
  }

  const canView =
    user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const isAdmin = user?.role === 'ADMIN';

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
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-medium text-[#201f23]">
              Properties
            </h2>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                <Plus className="h-4 w-4" />
                Create Property
              </button>
            )}
          </div>

          {showCreate && (
            <form
              onSubmit={handleCreateProperty}
              className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-medium text-[#201f23]">New Property</h3>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="min-w-[200px] flex-1">
                  <label className="mb-1 block text-sm font-medium">Name</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="e.g. Sunset Apartments"
                    required
                    minLength={3}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <div className="min-w-[200px] flex-1">
                  <label className="mb-1 block text-sm font-medium">Address</label>
                  <input
                    type="text"
                    value={createForm.address}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, address: e.target.value }))
                    }
                    placeholder="e.g. 123 Main St, City"
                    required
                    minLength={5}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </div>
            </form>
          )}

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
