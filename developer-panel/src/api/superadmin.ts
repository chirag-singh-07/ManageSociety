import { fetchJSON } from './http'
import type { AuditLog, Society, User } from './types'

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
  input: { 
    status?: 'active' | 'suspended'; 
    settings?: Record<string, unknown>; 
    plan?: string;
    trialEndsAt?: string;
  },
) {
  return fetchJSON<{ ok: true; society: Society }>('PATCH', `/api/superadmin/societies/${id}`, { body: input })
}

export function listUsers() {
  return fetchJSON<{ ok: true; users: User[] }>('GET', '/api/superadmin/users')
}

export function createUser(input: {
  societyId: string
  role: 'user' | 'admin'
  userType?: 'resident' | 'owner' | 'tenant' | 'staff' | 'guard'
  name: string
  email: string
  phone?: string
  password?: string
}) {
  return fetchJSON<{ ok: true; user: User }>('POST', '/api/superadmin/users', { body: input })
}

export function updateUser(
  id: string,
  input: { name?: string; email?: string; role?: 'user' | 'admin'; status?: 'pending' | 'active' | 'blocked' },
) {
  return fetchJSON<{ ok: true; user: User }>('PATCH', `/api/superadmin/users/${id}`, { body: input })
}

export function subscribeSociety(id: string, input: { plan: string; months: number }) {
  return fetchJSON<{ ok: true; society: Society }>('POST', `/api/superadmin/societies/${id}/subscribe`, { body: input })
}

export function listAuditLogs() {
  return fetchJSON<{ ok: true; logs: AuditLog[] }>('GET', '/api/superadmin/audit-logs')
}

