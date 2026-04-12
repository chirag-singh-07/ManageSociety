import { fetchJSON } from './http'
import type { AuditLog, Society } from './types'

export function listSocieties() {
  return fetchJSON<{ ok: true; societies: Society[] }>('GET', '/api/superadmin/societies')
}

export function createSociety(input: {
  name: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  trialDays?: number
}) {
  return fetchJSON<{ ok: true; society: Society }>('POST', '/api/superadmin/societies', { body: input })
}

export function updateSociety(
  id: string,
  input: { status?: 'active' | 'suspended'; settings?: Record<string, unknown>; plan?: string },
) {
  return fetchJSON<{ ok: true; society: Society }>('PATCH', `/api/superadmin/societies/${id}`, { body: input })
}

export function listAuditLogs() {
  return fetchJSON<{ ok: true; logs: AuditLog[] }>('GET', '/api/superadmin/audit-logs')
}

