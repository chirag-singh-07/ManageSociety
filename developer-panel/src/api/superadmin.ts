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
  plan?: string
  months?: number
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

export function deleteSociety(id: string) {
  return fetchJSON<{ ok: true }>('DELETE', `/api/superadmin/societies/${id}`)
}

export function listUsers(params?: { page?: number; limit?: number; search?: string }) {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', params.page.toString())
  if (params?.limit) query.set('limit', params.limit.toString())
  if (params?.search) query.set('search', params.search)
  
  return fetchJSON<{ ok: true; users: User[]; pagination: any }>('GET', `/api/superadmin/users?${query}`)
}

export function deleteUser(id: string) {
  return fetchJSON<{ ok: true }>('DELETE', `/api/superadmin/users/${id}`)
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

export function getStats() {
  return fetchJSON<{ ok: true; stats: any }>('GET', '/api/superadmin/stats')
}

export function getEarnings() {
  return fetchJSON<{ ok: true; transactions: any[]; summary: any }>('GET', '/api/superadmin/earnings')
}

