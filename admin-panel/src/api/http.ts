import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../auth/session'
import type { ApiResponse, Tokens } from './types'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
let refreshPromise: Promise<void> | null = null

async function refreshTokens() {
  if (refreshPromise) return refreshPromise
  const refreshToken = getRefreshToken()
  if (!refreshToken) return

  refreshPromise = (async () => {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) {
      clearTokens()
      throw new Error('Refresh failed')
    }
    const data = (await res.json()) as { ok: boolean; accessToken: string; refreshToken: string }
    if (data.ok) {
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken })
    } else {
      clearTokens()
      throw new Error('Refresh failed')
    }
  })().finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}

type FetchOptions = {
  body?: unknown
  headers?: Record<string, string>
  retryOn401?: boolean
}

export async function fetchJSON<T>(
  method: string,
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  const token = getAccessToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let res = await fetch(url, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (res.status === 401 && options.retryOn401 !== false) {
    try {
      await refreshTokens()
      const newToken = getAccessToken()
      if (newToken) headers.Authorization = `Bearer ${newToken}`
      res = await fetch(url, {
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      })
    } catch {
      clearTokens()
      throw new Error('Authentication failed')
    }
  }

  if (!res.ok) {
    const error = await res.json() as ApiResponse<never>
    throw new Error(error.error?.message || `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

export async function authLogin(email: string, password: string): Promise<Tokens> {
  const response = await fetchJSON<{ ok: boolean; accessToken: string; refreshToken: string }>(
    'POST',
    '/api/auth/login',
    {
      body: { email, password },
      retryOn401: false,
    },
  )
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  }
}

export async function authRefresh(refreshToken: string): Promise<Tokens> {
  const response = await fetchJSON<{ ok: boolean; accessToken: string; refreshToken: string }>(
    'POST',
    '/api/auth/refresh',
    {
      body: { refreshToken },
      retryOn401: false,
    },
  )
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  }
}

export async function authLogout(refreshToken: string): Promise<void> {
  await fetchJSON<{ ok: boolean }>('POST', '/api/auth/logout', {
    body: { refreshToken },
    retryOn401: false,
  })
}

export interface UserProfile {
  ok: boolean
  user: {
    id: string
    email: string
    name: string
    phone?: string
    societyId: string
    role: string
    status: string
  }
}

export async function getProfile(): Promise<UserProfile> {
  return fetchJSON<UserProfile>('GET', '/api/me')
}

export async function updateProfile(data: { name?: string; phone?: string }): Promise<UserProfile> {
  return fetchJSON<UserProfile>('PATCH', '/api/me', { body: data })
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<{ ok: boolean }> {
  return fetchJSON<{ ok: boolean }>('POST', '/api/auth/change-password', {
    body: { oldPassword, newPassword },
  })
}

export interface User {
  _id: string
  name: string
  email: string
  phone?: string
  userType?: string
  flatNumber?: string
  status: 'pending' | 'active' | 'blocked'
  flatId?: string
  createdAt: string
}

export interface UserListResponse {
  ok: boolean
  users: User[]
}

export interface UserStatusResponse {
  ok: boolean
  user: User
}

export async function getMembers(status?: string): Promise<UserListResponse> {
  const query = status ? `?status=${status}` : ''
  return fetchJSON<UserListResponse>('GET', `/api/admin/users${query}`)
}

export async function getMember(id: string): Promise<{ ok: boolean; user: User }> {
  return fetchJSON<{ ok: boolean; user: User }>('GET', `/api/admin/users/${id}`)
}

export async function updateMemberStatus(id: string, status: 'active' | 'blocked' | 'pending'): Promise<UserStatusResponse> {
  return fetchJSON<UserStatusResponse>('POST', `/api/admin/users/${id}/status`, {
    body: { status },
  })
}

export async function deleteMember(id: string): Promise<{ ok: boolean }> {
  return fetchJSON<{ ok: boolean }>('DELETE', `/api/admin/users/${id}`)
}

// ============= INVITE CODES =============
export interface InviteCode {
  _id: string
  type: 'resident' | 'admin'
  code: string
  maxUses: number
  usedCount: number
  expiresAt: string
  createdAt: string
}

export interface InviteCodeResponse {
  ok: boolean
  inviteCode?: InviteCode
  inviteCodes?: InviteCode[]
}

export async function createInviteCode(type: 'resident' | 'admin', expiresInDays: number, maxUses: number): Promise<InviteCodeResponse> {
  return fetchJSON<InviteCodeResponse>('POST', '/api/admin/invite-codes', {
    body: { type, expiresInDays, maxUses },
  })
}

export async function getInviteCodes(): Promise<InviteCodeResponse> {
  return fetchJSON<InviteCodeResponse>('GET', '/api/admin/invite-codes')
}

export async function disableInviteCode(id: string): Promise<{ ok: boolean }> {
  return fetchJSON<{ ok: boolean }>('POST', `/api/admin/invite-codes/${id}/disable`)
}

// ============= CREATE DIRECT MEMBER =============
export interface CreateMemberRequest {
  name: string
  email: string
  phone: string
  flatNumber: string
  password: string
}

export async function createMemberDirect(data: CreateMemberRequest): Promise<{ ok: boolean; user?: User }> {
  return fetchJSON<{ ok: boolean; user?: User }>('POST', '/api/admin/users', {
    body: data,
  })
}

// ============= DASHBOARD =============
export interface DashboardData {
  ok: boolean
  totalMembers: number
  activeMembers: number
  pendingMembers: number
  blockedMembers: number
  openComplaints: number
  resolvedComplaints: number
  pendingComplaints: number
  invCodesActive: number
  noticesCount: number
}

export async function getDashboard(): Promise<DashboardData> {
  return fetchJSON<DashboardData>('GET', '/api/admin/dashboard')
}

// ============= COMPLAINTS =============
export interface Complaint {
  _id: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'assigned' | 'in-progress' | 'in_progress' | 'resolved' | 'closed' | 'rejected'
  createdBy:
    | string
    | {
        _id: string
        name?: string
        email?: string
      }
  assignedTo?:
    | string
    | {
        _id: string
        name?: string
      }
  memberId?: string
  flatNumber?: string
  attachments?: Array<{
    fileId?: string
    publicUrl?: string
    url?: string
    fileName?: string
    name?: string
    type?: string
  }>
  createdAt: string
  updatedAt: string
}

export interface ComplaintComment {
  _id: string
  message: string
  author?: {
    name?: string
  }
  createdAt: string
  type?: 'admin' | 'system'
}

export interface ComplaintResponse {
  ok: boolean
  complaints?: Complaint[]
  complaint?: Complaint
}

export async function getComplaints(status?: string): Promise<ComplaintResponse> {
  const query = status ? `?status=${status}` : ''
  return fetchJSON<ComplaintResponse>('GET', `/api/admin/complaints${query}`)
}

export async function getComplaint(id: string): Promise<{ ok: boolean; complaint: Complaint; comments?: ComplaintComment[] }> {
  return fetchJSON<{ ok: boolean; complaint: Complaint; comments?: ComplaintComment[] }>('GET', `/api/complaints/${id}`)
}

export async function updateComplaintStatus(id: string, status: string, message?: string): Promise<ComplaintResponse> {
  return fetchJSON<ComplaintResponse>('POST', `/api/admin/complaints/${id}/status`, {
    body: { status, message },
  })
}

export async function assignComplaint(id: string, assignedTo: string): Promise<ComplaintResponse> {
  return fetchJSON<ComplaintResponse>('POST', `/api/admin/complaints/${id}/assign`, {
    body: { assignedTo },
  })
}

export async function addComplaintComment(id: string, message: string, attachments: Array<{ fileId: string; publicUrl: string }> = []): Promise<{ ok: boolean }> {
  return fetchJSON<{ ok: boolean }>('POST', `/api/complaints/${id}/comments`, {
    body: { message, attachments },
  })
}

// ============= NOTICES =============
export interface Notice {
  _id: string
  title: string
  body: string
  audience: 'all' | 'owners' | 'tenants' | 'custom'
  attachments?: Array<{
    fileId: string
    url: string
    type: string
    name: string
  }>
  createdBy?: {
    _id?: string
    name?: string
  }
  publishedAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface NoticeResponse {
  ok: boolean
  notices?: Notice[]
  notice?: Notice
}

export async function getNotices(): Promise<NoticeResponse> {
  return fetchJSON<NoticeResponse>('GET', '/api/admin/notices')
}

export async function getNotice(id: string): Promise<NoticeResponse> {
  return fetchJSON<NoticeResponse>('GET', `/api/admin/notices/${id}`)
}

export async function createNotice(data: {
  title: string
  body: string
  audience: 'all' | 'owners' | 'tenants' | 'custom'
  attachments?: Array<{ fileId: string; url: string; type: string; name: string }>
  publishedAt?: string
}): Promise<NoticeResponse> {
  return fetchJSON<NoticeResponse>('POST', '/api/admin/notices', { body: data })
}

export async function updateNotice(id: string, data: {
  title?: string
  body?: string
  audience?: 'all' | 'owners' | 'tenants' | 'custom'
  attachments?: Array<{ fileId: string; url: string; type: string; name: string }>
  publishedAt?: string
}): Promise<NoticeResponse> {
  return fetchJSON<NoticeResponse>('PATCH', `/api/admin/notices/${id}`, { body: data })
}

export async function deleteNotice(id: string): Promise<{ ok: boolean }> {
  return fetchJSON<{ ok: boolean }>('DELETE', `/api/admin/notices/${id}`)
}

// ============= MAINTENANCE =============
export interface MaintenanceCharge {
  _id: string
  name: string
  description?: string
  amount: number
  frequency: 'monthly' | 'quarterly' | 'annual'
  order: number
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface MaintenanceBill {
  _id: string
  flatNumber: string
  userId?: string
  period: string
  dueDate: string
  totalAmount: number
  charges: Array<{
    chargeId?: string
    name: string
    amount: number
  }>
  paidAmount: number
  status: 'unpaid' | 'partial' | 'paid' | 'overdue'
  paymentHistory?: Array<{
    amount: number
    date: string
    method: string
  }>
  remarks?: string
  createdAt?: string
  updatedAt?: string
}

export interface MaintenanceResponse<T = any> {
  ok: boolean
  data?: T
  charges?: MaintenanceCharge[]
  bills?: MaintenanceBill[]
  bill?: MaintenanceBill
  charge?: MaintenanceCharge
  count?: number
  summary?: Array<{
    _id: string
    count: number
    totalAmount: number
    collectedAmount: number
  }>
}

// Charges
export async function getMaintenanceCharges(): Promise<MaintenanceResponse<MaintenanceCharge[]>> {
  return fetchJSON<MaintenanceResponse<MaintenanceCharge[]>>('GET', '/api/admin/maintenance/charges')
}

export async function createMaintenanceCharge(data: {
  name: string
  description?: string
  amount: number
  frequency?: 'monthly' | 'quarterly' | 'annual'
}): Promise<MaintenanceResponse<MaintenanceCharge>> {
  return fetchJSON<MaintenanceResponse<MaintenanceCharge>>('POST', '/api/admin/maintenance/charges', { body: data })
}

export async function updateMaintenanceCharge(id: string, data: Partial<MaintenanceCharge>): Promise<MaintenanceResponse<MaintenanceCharge>> {
  return fetchJSON<MaintenanceResponse<MaintenanceCharge>>('PATCH', `/api/admin/maintenance/charges/${id}`, { body: data })
}

export async function deleteMaintenanceCharge(id: string): Promise<{ ok: boolean }> {
  return fetchJSON<{ ok: boolean }>('DELETE', `/api/admin/maintenance/charges/${id}`)
}

// Bills
export async function getMaintenanceBills(status?: string, period?: string): Promise<MaintenanceResponse<MaintenanceBill[]>> {
  const params = new URLSearchParams()
  if (status) params.append('status', status)
  if (period) params.append('period', period)
  const query = params.toString() ? `?${params.toString()}` : ''
  return fetchJSON<MaintenanceResponse<MaintenanceBill[]>>('GET', `/api/admin/maintenance/bills${query}`)
}

export async function getMaintenanceBillsSummary(): Promise<MaintenanceResponse> {
  return fetchJSON<MaintenanceResponse>('GET', '/api/admin/maintenance/bills/summary')
}

export async function generateMaintenanceBills(data: {
  period: string
  dueDate: string
}): Promise<MaintenanceResponse<MaintenanceBill[]>> {
  return fetchJSON<MaintenanceResponse<MaintenanceBill[]>>('POST', '/api/admin/maintenance/bills/generate', { body: data })
}

export async function getMaintenanceBill(id: string): Promise<MaintenanceResponse<MaintenanceBill>> {
  return fetchJSON<MaintenanceResponse<MaintenanceBill>>('GET', `/api/admin/maintenance/bills/${id}`)
}

export async function updateMaintenanceBillStatus(id: string, data: {
  status: 'unpaid' | 'partial' | 'paid' | 'overdue'
  remarks?: string
}): Promise<MaintenanceResponse<MaintenanceBill>> {
  return fetchJSON<MaintenanceResponse<MaintenanceBill>>('PATCH', `/api/admin/maintenance/bills/${id}/status`, { body: data })
}

export async function recordMaintenancePayment(id: string, data: {
  amount: number
  method?: string
  remarks?: string
}): Promise<MaintenanceResponse<MaintenanceBill>> {
  return fetchJSON<MaintenanceResponse<MaintenanceBill>>('POST', `/api/admin/maintenance/bills/${id}/payment`, { body: data })
}

export async function sendMaintenanceReminders(billIds: string[], message?: string): Promise<{ ok: boolean; message: string; count: number; bills?: MaintenanceBill[] }> {
  return fetchJSON<{ ok: boolean; message: string; count: number; bills?: MaintenanceBill[] }>('POST', '/api/admin/maintenance/bills/send-reminders', { body: { billIds, message } })
}

export async function deleteMaintenanceBill(id: string): Promise<{ ok: boolean }> {
  return fetchJSON<{ ok: boolean }>('DELETE', `/api/admin/maintenance/bills/${id}`)
}

// ============= NOTIFICATIONS =============
export interface Notification {
  _id: string
  title: string
  message: string
  type: 'notice' | 'maintenance' | 'complaint' | 'payment' | 'system'
  actionUrl?: string
  read: boolean
  createdAt: string
}

export interface NotificationResponse {
  ok: boolean
  notifications?: Notification[]
  unreadCount?: number
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export async function getNotifications(page?: number, unreadOnly?: boolean): Promise<NotificationResponse> {
  const params = new URLSearchParams()
  if (page) params.append('page', page.toString())
  if (unreadOnly) params.append('unreadOnly', 'true')
  const query = params.toString() ? `?${params.toString()}` : ''
  return fetchJSON<NotificationResponse>('GET', `/api/admin/notifications${query}`)
}

export async function getUnreadNotificationCount(): Promise<{ ok: boolean; unreadCount: number }> {
  return fetchJSON<{ ok: boolean; unreadCount: number }>('GET', '/api/admin/notifications/unread/count')
}

export async function markNotificationAsRead(id: string): Promise<NotificationResponse> {
  return fetchJSON<NotificationResponse>('PATCH', `/api/admin/notifications/${id}/read`)
}

export async function markAllNotificationsAsRead(type?: string): Promise<{ ok: boolean; message: string; modifiedCount: number }> {
  return fetchJSON<{ ok: boolean; message: string; modifiedCount: number }>('PATCH', '/api/admin/notifications/read/all', { body: { type } })
}

export async function deleteNotification(id: string): Promise<{ ok: boolean }> {
  return fetchJSON<{ ok: boolean }>('DELETE', `/api/admin/notifications/${id}`)
}

export async function clearAllNotifications(): Promise<{ ok: boolean; deletedCount: number }> {
  return fetchJSON<{ ok: boolean; deletedCount: number }>('DELETE', '/api/admin/notifications/clear/all')
}
export interface PresignResponse {
  ok: boolean
  fileId: string
  key: string
  uploadUrl: string
  publicUrl: string
}

export async function getPresignedUrl(fileName: string, mimeType: string, size: number): Promise<PresignResponse> {
  return fetchJSON<PresignResponse>('POST', '/api/files/presign', {
    body: { fileName, mimeType, size },
  })
}

export async function uploadFile(uploadUrl: string, file: File): Promise<void> {
  const token = getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': file.type,
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers,
    body: file,
  })

  if (!res.ok) {
    throw new Error('File upload failed')
  }
}

// ============= SOCIETY SETTINGS =============
export interface Society {
  _id: string
  name: string
  address?: string
  registrationNumber?: string
  location?: string
  settings?: Record<string, unknown>
}

export interface SocietyResponse {
  ok: boolean
  society?: Society
}

export async function getSociety(): Promise<SocietyResponse> {
  return fetchJSON<SocietyResponse>('GET', '/api/admin/society')
}

export async function updateSociety(data: Partial<Society>): Promise<SocietyResponse> {
  return fetchJSON<SocietyResponse>('PATCH', '/api/admin/society', { body: data })
}
