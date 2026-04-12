import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authLogin, authLogout, authRefresh } from '../api/http'
import { clearTokens, decodeJwt, getRefreshToken, setTokens } from './session'

type AuthState =
  | { status: 'loading' }
  | { status: 'authenticated'; role: string }
  | { status: 'unauthenticated' }

type AuthContextValue = {
  state: AuthState
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' })

  const applyTokens = useCallback((accessToken: string, refreshToken: string) => {
    setTokens({ accessToken, refreshToken })
    const payload = decodeJwt(accessToken)
    const role = typeof payload?.role === 'string' ? payload.role : 'unknown'
    if (role !== 'superadmin') {
      clearTokens()
      setState({ status: 'unauthenticated' })
      return
    }
    setState({ status: 'authenticated', role })
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const tokens = await authLogin(email, password)
      applyTokens(tokens.accessToken, tokens.refreshToken)
    },
    [applyTokens],
  )

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try {
        await authLogout(refreshToken)
      } catch {
        // ignore
      }
    }
    clearTokens()
    setState({ status: 'unauthenticated' })
  }, [])

  useEffect(() => {
    const bootstrap = async () => {
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        setState({ status: 'unauthenticated' })
        return
      }
      try {
        const tokens = await authRefresh(refreshToken)
        applyTokens(tokens.accessToken, tokens.refreshToken)
      } catch {
        clearTokens()
        setState({ status: 'unauthenticated' })
      }
    }
    bootstrap()
  }, [applyTokens])

  const value = useMemo<AuthContextValue>(() => ({ state, login, logout }), [state, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

