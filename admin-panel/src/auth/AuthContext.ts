import { createContext, useContext } from 'react'

export type AuthState =
  | { status: 'loading' }
  | { status: 'authenticated'; role: string; userId: string; societyId?: string }
  | { status: 'unauthenticated' }

export type AuthContextValue = {
  state: AuthState
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
