import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
      <Routes>
        <Route element={<AdminLayout />}>
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
    </BrowserRouter>
  )
}

export default App
