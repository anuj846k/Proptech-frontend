import { apiFetch, type ApiResponse } from '@/lib/api';

export type Property = {
  id: string;
  name: string;
  address: string;
  ownerId: string;
  managerId: string | null;
  createdAt: string | null;
};

export type Unit = {
  id: string;
  propertyId: string;
  unitNumber: string;
  floor: number;
  tenantId: string | null;
};

export async function fetchProperties() {
  const res = await apiFetch<ApiResponse<{ properties: Property[] }>>(
    '/api/v1/properties',
  );
  if (res.error) return { properties: [], error: res.error };
  return {
    properties: (res.data as ApiResponse<{ properties: Property[] }>)?.properties ?? [],
  };
}

export type OccupancyItem = {
  propertyId: string;
  propertyName: string;
  totalUnits: number;
  occupiedCount: number;
  vacantCount: number;
};

export async function fetchOccupancy() {
  const res = await apiFetch<ApiResponse<{ occupancy: OccupancyItem[] }>>(
    '/api/v1/properties/occupancy',
  );
  if (res.error) return { occupancy: [], error: res.error };
  return {
    occupancy:
      (res.data as ApiResponse<{ occupancy: OccupancyItem[] }>)?.occupancy ?? [],
  };
}

export async function assignTenantToUnit(
  propertyId: string,
  unitId: string,
  tenantId: string | null,
) {
  return apiFetch<ApiResponse<{ unit: Unit }>>(
    `/api/v1/properties/${propertyId}/units/${unitId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ tenantId }),
    },
  );
}

export async function fetchPropertyById(id: string) {
  const res = await apiFetch<
    ApiResponse<{ property: Property; units: Unit[] }>
  >(`/api/v1/properties/${id}`);
  if (res.error) return { property: null, units: [], error: res.error };
  const data = res.data as ApiResponse<{ property: Property; units: Unit[] }>;
  return {
    property: data?.property ?? null,
    units: data?.units ?? [],
  };
}
