import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './auth/AuthProvider'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { AppDialogProvider } from './components/dialog/AppDialogProvider'
import { LoginPage } from './pages/LoginPage'
import { AdminLayout } from './components/layout/AdminLayout'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { MembersList } from './pages/members/MembersList'
import { CreateMember } from './pages/members/CreateMember'
import { MemberDetails } from './pages/members/MemberDetails'
import { ComplaintsList } from './pages/complaints/ComplaintsList'
import { ComplaintDetails } from './pages/complaints/ComplaintDetails'
import { NoticesList } from './pages/notices/NoticesList'
import { CreateNotice } from './pages/notices/CreateNotice'
import { MaintenanceList } from './pages/maintenance/MaintenanceList'
import { MaintenanceDetails } from './pages/maintenance/MaintenanceDetails'
import { MaintenanceReminders } from './pages/maintenance/MaintenanceReminders'
import { SetupMaintenance } from './pages/maintenance/SetupMaintenance'
import { NotificationsList } from './pages/notifications/NotificationsList'
import { CreateNotification } from './pages/notifications/CreateNotification'
import { SettingsPage } from './pages/settings/SettingsPage'
import { ProfilePage } from './pages/profile/ProfilePage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppDialogProvider>
          <Toaster 
            position="top-right"
            theme="light"
            richColors
            closeButton
            expand={true}
          />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              
              <Route path="/members" element={<MembersList />} />
              <Route path="/members/create" element={<CreateMember />} />
              <Route path="/members/:id" element={<MemberDetails />} />
              
              <Route path="/complaints" element={<ComplaintsList />} />
              <Route path="/complaints/:id" element={<ComplaintDetails />} />
              
              <Route path="/notices" element={<NoticesList />} />
              <Route path="/notices/create" element={<CreateNotice />} />

              <Route path="/maintenance" element={<MaintenanceList />} />
              <Route path="/maintenance/:id" element={<MaintenanceDetails />} />
              <Route path="/maintenance/reminders" element={<MaintenanceReminders />} />
              <Route path="/maintenance/setup" element={<SetupMaintenance />} />
              
              <Route path="/notifications" element={<NotificationsList />} />
              <Route path="/notifications/create" element={<CreateNotification />} />
              
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppDialogProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
