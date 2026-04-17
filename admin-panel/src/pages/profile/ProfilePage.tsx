import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { 
  Building2, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  Crown, 
  Zap,
  Users,
  MessageSquare,
  LogOut,
  Mail,
  Phone,
  Edit2,
  Lock,
  Eye,
  EyeOff,
  X,
  Loader
} from 'lucide-react'
import { useAuth } from '../../auth/AuthProvider'
import { getProfile, updateProfile, changePassword } from '../../api/http'
import { cn } from '../../lib/utils'

interface Profile {
  id: string
  email: string
  name: string
  phone?: string
  societyId: string
  role: string
  status: string
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await getProfile()
      if (response.ok) {
        setProfile(response.user)
        setEditName(response.user.name)
        setEditPhone(response.user.phone || '')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true)
      
      const response = await updateProfile({
        name: editName,
        phone: editPhone,
      })
      
      if (response.ok) {
        setProfile(response.user)
        setIsEditingName(false)
        toast.success('Profile updated successfully')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    
    try {
      setChangingPassword(true)
      await changePassword(oldPassword, newPassword)
      setShowPasswordModal(false)
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Password changed successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleSignOutAllDevices = async () => {
    try {
      await logout()
      toast.success('Signed out from all devices')
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout failed:', error)
      navigate('/login', { replace: true })
    }
  }

  const initials = profile?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load profile</p>
        <button
          onClick={fetchProfile}
          className="mt-4 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account details and security settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2rem] border border-border p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-primary/10" />
            <div className="relative pt-6 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-primary text-white flex items-center justify-center text-3xl font-bold shadow-xl shadow-primary/20">
                {initials}
              </div>
              <h2 className="text-xl font-bold mt-4">{profile.name}</h2>
              <p className="text-xs font-semibold text-primary mt-1 px-3 py-1 bg-primary/10 rounded-full capitalize">
                {profile.role === 'admin' ? 'Society Admin' : profile.role}
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-foreground break-all">{profile.email}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{profile.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-foreground">Society Admin</span>
              </div>
            </div>

            <div className="mt-8 border-t border-border pt-6 space-y-3">
              <button 
                onClick={() => setIsEditingName(!isEditingName)}
                className="w-full flex items-center gap-2 justify-center py-2.5 rounded-xl border border-border text-sm font-bold text-foreground hover:bg-secondary hover:text-primary transition-all"
              >
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center gap-2 justify-center py-2.5 rounded-xl border border-border text-sm font-bold text-foreground hover:bg-secondary hover:text-primary transition-all"
              >
                <Lock className="w-4 h-4" /> Change Password
              </button>
            </div>
          </div>

          <div className="bg-destructive/5 rounded-[2rem] border border-destructive/10 p-6">
            <button 
              onClick={handleSignOutAllDevices}
              className="w-full flex items-center gap-2 justify-center py-3 rounded-xl bg-destructive text-white text-sm font-bold shadow-lg shadow-destructive/20 hover:scale-[1.02] transition-all"
            >
              <LogOut className="w-4 h-4" /> Sign Out from all devices
            </button>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          {isEditingName && (
            <div className="bg-white rounded-[2rem] border border-border p-8 shadow-sm">
              <h3 className="text-lg font-bold mb-6">Edit Profile Information</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="flex-1 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {savingProfile && <Loader className="w-4 h-4 animate-spin" />}
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="flex-1 py-3 rounded-lg border border-border text-foreground font-semibold hover:bg-secondary transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Subscription & Plan details */}
          <div className="bg-primary rounded-[2rem] p-8 text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-700" />
            <Crown className="absolute right-8 top-8 w-16 h-16 opacity-10 rotate-12" />
            
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary-foreground/80 mb-2">
              <ShieldCheck className="w-4 h-4" /> Account Status
            </div>
            <div className="flex items-end gap-3 mb-6">
              <h3 className="text-4xl font-extra-bold capitalize">{profile.status}</h3>
              <span className="text-sm font-semibold opacity-80 mb-1">Active</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-6 border-t border-white/20">
              <div>
                <p className="text-[10px] uppercase font-bold opacity-70 mb-1">Role</p>
                <p className="text-sm font-semibold capitalize">{profile.role}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold opacity-70 mb-1">Email</p>
                <p className="text-sm font-semibold break-all">{profile.email}</p>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-[2rem] border border-border overflow-hidden shadow-sm">
            <div className="p-8 border-b border-border bg-secondary/30 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-bold text-lg">Security Settings</h3>
                <p className="text-xs text-muted-foreground mt-1">Manage your password and security preferences.</p>
              </div>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Password</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Last changed a long time ago</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all"
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-in fade-in zoom-in">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold">Change Password</h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-5">
              {/* Old Password */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter your current password"
                    disabled={changingPassword}
                    className="w-full pr-10 px-4 py-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    disabled={changingPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:cursor-not-allowed"
                  >
                    {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 8 chars)"
                    disabled={changingPassword}
                    className="w-full pr-10 px-4 py-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={changingPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:cursor-not-allowed"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  disabled={changingPassword}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={changingPassword || !oldPassword || !newPassword || !confirmPassword}
                className="w-full py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {changingPassword && <Loader className="w-4 h-4 animate-spin" />}
                {changingPassword ? 'Changing...' : 'Change Password'}
              </button>

              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="w-full py-3 rounded-lg border border-border text-foreground font-semibold hover:bg-secondary transition-all"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
