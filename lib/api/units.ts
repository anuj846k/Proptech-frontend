import { apiFetch, type ApiResponse } from '@/lib/api';

export type MyUnit = {
  unitId: string;
  unitNumber: string;
  propertyId: string;
  propertyName: string;
};

export async function fetchMyUnits() {
  const res = await apiFetch<ApiResponse<{ units: MyUnit[] }>>(
    '/api/v1/units/my',
  );
  if (res.error) return { units: [], error: res.error };
  return {
    units: (res.data as ApiResponse<{ units: MyUnit[] }>)?.units ?? [],
  };
}
