export type Tokens = {
  accessToken: string
  refreshToken: string
}

export type ApiError = {
  code: string
  message: string
  requestId?: string
  details?: Record<string, unknown>
}

export type Society = {
  _id: string
  name: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  status: 'active' | 'suspended'
  settings?: Record<string, unknown>
  plan?: string
  trialEndsAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export type AuditLog = {
  _id: string
  scope: 'global' | 'society'
  societyId?: string | null
  actorId: string
  actorRole: 'user' | 'admin' | 'superadmin'
  action: string
  targetType?: string
  targetId?: string
  ip?: string
  userAgent?: string
  metadata?: Record<string, unknown>
  createdAt?: string
}

