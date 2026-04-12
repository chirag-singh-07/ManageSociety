import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../auth/session'
import type { ApiError, Tokens } from './types'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
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
    const data = (await res.json()) as { accessToken: string; refreshToken: string }
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken })
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

export async function fetchJSON<T>(method: string, path: string, options: FetchOptions = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  const token = getAccessToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(url, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (res.status === 401 && options.retryOn401 !== false && getRefreshToken()) {
    await refreshTokens()
    return fetchJSON<T>(method, path, { ...options, retryOn401: false })
  }

  if (!res.ok) {
    let error: ApiError = { code: 'UNKNOWN', message: 'Request failed' }
    try {
      const data = await res.json()
      if (data?.error?.code) {
        error = {
          code: data.error.code,
          message: data.error.message || 'Request failed',
          requestId: data.requestId,
          details: data.error.details,
        }
      }
    } catch {
      // ignore parse errors
    }
    throw error
  }

  return (await res.json()) as T
}

export async function authLogin(email: string, password: string): Promise<Tokens> {
  return fetchJSON<Tokens>('POST', '/api/auth/login', { body: { email, password }, retryOn401: false })
}

export async function authRefresh(refreshToken: string): Promise<Tokens> {
  return fetchJSON<Tokens>('POST', '/api/auth/refresh', { body: { refreshToken }, retryOn401: false })
}

export async function authLogout(refreshToken: string): Promise<void> {
  await fetchJSON('POST', '/api/auth/logout', { body: { refreshToken }, retryOn401: false })
}

