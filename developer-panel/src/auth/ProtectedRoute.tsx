import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { Loading } from '../components/ui/loading'

export function ProtectedRoute() {
  const { state } = useAuth()
  if (state.status === 'loading') {
    return <Loading variant="fullscreen" size="lg" text="Authenticating user session..." />
  }
  if (state.status === 'unauthenticated') return <Navigate to="/login" replace />
  return <Outlet />
}

