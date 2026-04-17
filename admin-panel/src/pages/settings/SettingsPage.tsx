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
  Key
} from 'lucide-react'
import { cn } from '../../lib/utils'

export function SettingsPage() {
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
            { label: 'General Info', icon: Building2, active: true },
            { label: 'Account Security', icon: ShieldCheck, active: false },
            { label: 'Subscription & Billing', icon: CreditCard, active: false },
            { label: 'Notification Prefs', icon: Bell, active: false },
            { label: 'Integrations', icon: Globe, active: false },
          ].map((item) => (
            <button 
              key={item.label}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all group",
                item.active 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-4.5 h-4.5", item.active ? "text-white" : "group-hover:text-primary")} />
                {item.label}
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          ))}
        </aside>

        {/* Content Form */}
        <div className="lg:col-span-2 space-y-6">
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
                         defaultValue="Green View Residency"
                         className="w-full bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-muted-foreground uppercase px-1">Registration Number</label>
                       <input 
                         type="text" 
                         defaultValue="REG-12345678"
                         className="w-full bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all"
                       />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                       <label className="text-xs font-bold text-muted-foreground uppercase px-1">Full Address</label>
                       <textarea 
                         rows={3}
                         defaultValue="Plot 45, Sector 12, HSR Layout, Bangalore - 560102"
                         className="w-full bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all resize-none"
                       />
                    </div>
                 </div>

                 <div className="pt-4 flex justify-end gap-3">
                    <button className="px-6 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-secondary transition-all">
                       Cancel
                    </button>
                    <button className="flex items-center gap-2 bg-primary text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                       <Save className="w-4 h-4" />
                       Save Changes
                    </button>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-2xl border border-border p-8 shadow-sm flex items-center justify-between group cursor-pointer hover:border-primary/40 transition-all">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center group-hover:bg-destructive group-hover:text-white transition-all">
                    <Key className="w-6 h-6" />
                 </div>
                 <div>
                    <h4 className="font-bold text-foreground">Change Password</h4>
                    <p className="text-xs text-muted-foreground">Last updated 3 months ago</p>
                 </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-all" />
           </div>
        </div>
      </div>
    </div>
  )
}
