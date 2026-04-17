import { useState, useEffect } from 'react'
import { User, Key, ShieldCheck, Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '../components/ui/button'
import { getMyProfile, updatePassword } from '../api/me'

export function ProfilePage() {
  const [profile, setProfile] = useState<{ email: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      setLoading(true)
      const data = await getMyProfile()
      setProfile(data.admin)
    } catch (err: any) {
      setError(err.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    try {
      setUpdating(true)
      setError(null)
      setSuccess(null)
      await updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setSuccess('Password updated successfully')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      setError(err.message || 'Failed to update password')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
          Account Profile
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your developer account settings and security.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-2xl overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border-b border-border/40 relative">
               <div className="absolute -bottom-10 left-6">
                  <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20 border-4 border-card">
                    <User className="w-10 h-10" />
                  </div>
               </div>
            </div>
            <div className="pt-14 pb-8 px-6">
               <div className="space-y-1">
                  <h2 className="text-xl font-semibold">{profile?.email.split('@')[0]}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    Super Administrator
                  </p>
               </div>

               <div className="mt-8 space-y-4">
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {profile?.email}
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Account Status</div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                      Active
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 space-y-3">
             <div className="flex items-center gap-2 font-medium text-primary">
                <ShieldCheck className="w-5 h-5" />
                Security Tip
             </div>
             <p className="text-sm text-muted-foreground leading-relaxed">
                Use a strong, unique password for your superadmin account. Avoid using the same password across multiple platforms.
             </p>
          </div>
        </div>

        {/* Update Password Form */}
        <div className="lg:col-span-2">
          <div className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border/40 bg-muted/20 flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Update Password</h3>
            </div>
            <form onSubmit={handleUpdatePassword} className="p-8 space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3 animate-in shake-200">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 text-sm flex items-start gap-3 animate-in zoom-in-95">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="current" className="text-sm font-medium text-foreground px-1">Current Password</label>
                  <input
                    id="current"
                    type="password"
                    required
                    className="w-full bg-background border border-border/60 hover:border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-4 py-3 transition-all outline-none"
                    placeholder="Enter current password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="new" className="text-sm font-medium text-foreground px-1">New Password</label>
                  <input
                    id="new"
                    type="password"
                    required
                    className="w-full bg-background border border-border/60 hover:border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-4 py-3 transition-all outline-none"
                    placeholder="At least 6 characters"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirm" className="text-sm font-medium text-foreground px-1">Confirm New Password</label>
                  <input
                    id="confirm"
                    type="password"
                    required
                    className="w-full bg-background border border-border/60 hover:border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-4 py-3 transition-all outline-none"
                    placeholder="Repeat new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={updating} className="h-12 px-8 rounded-xl bg-primary hover:shadow-lg hover:shadow-primary/20 transition-all font-semibold">
                  {updating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
