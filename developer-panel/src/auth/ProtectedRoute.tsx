import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export function ProtectedRoute() {
  const { state } = useAuth()
  if (state.status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading session...
      </div>
    )
  }
  if (state.status === 'unauthenticated') return <Navigate to="/login" replace />
  return <Outlet />
}

