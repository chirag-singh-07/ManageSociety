import { useState, useEffect } from 'react'
import { 
  Settings, 
  Building2, 
  MapPin, 
  ShieldCheck, 
  CreditCard, 
  Bell, 
  Globe,
  Save,
  ChevronRight,
  User,
  Key,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '../../lib/utils'
import { getSociety, updateSociety } from '../../api/http'
import type { Society } from '../../api/types'

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [society, setSociety] = useState<Society | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    address: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSociety()
  }, [])

  const fetchSociety = async () => {
    try {
      setLoading(true)
      const data = await getSociety()
      setSociety(data.society)
      setFormData({
        name: data.society.name || '',
        registrationNumber: data.society.registrationNumber || '',
        address: data.society.address || ''
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load society settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.address.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setSaving(true)
      await updateSociety(formData)
      toast.success("Settings updated successfully")
      setSociety({ ...society!, ...formData } as Society)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your society profile, account preferences, and security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Tabs (Simulated) */}
        <aside className="space-y-2 lg:col-span-1">
          {[
            { label: 'General Info', id: 'general', icon: Building2 },
            { label: 'Account Security', id: 'security', icon: ShieldCheck },
            { label: 'Subscription & Billing', id: 'billing', icon: CreditCard },
            { label: 'Notification Prefs', id: 'notifications', icon: Bell },
            { label: 'Integrations', id: 'integrations', icon: Globe },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all group",
                activeTab === item.id
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-4.5 h-4.5", activeTab === item.id ? "text-white" : "group-hover:text-primary")} />
                {item.label}
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          ))}
        </aside>

        {/* Content Form */}
        <div className="lg:col-span-2 space-y-6">
           {activeTab === 'general' && (
             <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border bg-secondary/30">
                   <h3 className="font-bold text-lg">General Information</h3>
                   <p className="text-xs text-muted-foreground mt-0.5">Basic details about your residential society.</p>
                </div>
                <div className="p-8 space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-muted-foreground uppercase px-1">Society Name</label>
                         <input 
                           type="text" 
                           value={formData.name}
                           onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                           className="w-full bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-muted-foreground uppercase px-1">Registration Number</label>
                         <input 
                           type="text" 
                           value={formData.registrationNumber}
                           onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                           className="w-full bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all"
                         />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                         <label className="text-xs font-bold text-muted-foreground uppercase px-1">Full Address</label>
                         <textarea 
                           rows={3}
                           value={formData.address}
                           onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                           className="w-full bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all resize-none"
                         />
                      </div>
                   </div>

                   <div className="pt-4 flex justify-end gap-3">
                      <button 
                        onClick={() => fetchSociety()}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-secondary transition-all">
                        Cancel
                      </button>
                      <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-primary text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                      </button>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'security' && (
             <div className="space-y-6">
               <div className="bg-white rounded-2xl border border-border p-8 shadow-sm flex items-center justify-between group cursor-pointer hover:border-primary/40 transition-all">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center group-hover:bg-destructive group-hover:text-white transition-all">
                        <Key className="w-6 h-6" />
                     </div>
                     <div>
                        <h4 className="font-bold text-foreground">Change Password</h4>
                        <p className="text-xs text-muted-foreground">Update your account password regularly</p>
                     </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-all" />
               </div>
             </div>
           )}

           {activeTab === 'billing' && (
             <div className="bg-white rounded-2xl border border-border p-8 shadow-sm text-center space-y-4">
                <CreditCard className="w-12 h-12 text-primary/40 mx-auto" />
                <p className="font-semibold text-foreground">Billing & Subscription</p>
                <p className="text-sm text-muted-foreground">Subscription features coming soon</p>
             </div>
           )}

           {activeTab === 'notifications' && (
             <div className="bg-white rounded-2xl border border-border p-8 shadow-sm text-center space-y-4">
                <Bell className="w-12 h-12 text-primary/40 mx-auto" />
                <p className="font-semibold text-foreground">Notification Preferences</p>
                <p className="text-sm text-muted-foreground">Notification settings coming soon</p>
             </div>
           )}

           {activeTab === 'integrations' && (
             <div className="bg-white rounded-2xl border border-border p-8 shadow-sm text-center space-y-4">
                <Globe className="w-12 h-12 text-primary/40 mx-auto" />
                <p className="font-semibold text-foreground">Integrations</p>
                <p className="text-sm text-muted-foreground">Third-party integrations coming soon</p>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}
