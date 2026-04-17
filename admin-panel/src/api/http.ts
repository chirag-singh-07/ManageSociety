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
