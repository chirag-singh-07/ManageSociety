import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { SocietiesPage } from './pages/SocietiesPage'
import { SocietyDetailPage } from './pages/SocietyDetailPage'
import { AuditLogsPage } from './pages/AuditLogsPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/societies" element={<SocietiesPage />} />
          <Route path="/societies/:id" element={<SocietyDetailPage />} />
          <Route path="/audit" element={<AuditLogsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
