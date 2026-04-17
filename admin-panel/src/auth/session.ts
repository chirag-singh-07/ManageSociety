let accessToken: string | null = null
const REFRESH_KEY = 'ms_admin_refresh'

export function getAccessToken() {
  return accessToken
}

export function setTokens(tokens: { accessToken: string; refreshToken: string }) {
  accessToken = tokens.accessToken
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken)
}

export function clearTokens() {
  accessToken = null
  localStorage.removeItem(REFRESH_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}

export function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}
