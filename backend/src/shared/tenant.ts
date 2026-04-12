import { ApiError } from './apiError';

export function tenantFilter(societyId: string) {
  return { societyId };
}

export function assertTenantMatch(docSocietyId: unknown, societyId: string) {
  if (!docSocietyId || String(docSocietyId) !== String(societyId)) {
    throw new ApiError(404, 'NOT_FOUND', 'Resource not found');
  }
}
