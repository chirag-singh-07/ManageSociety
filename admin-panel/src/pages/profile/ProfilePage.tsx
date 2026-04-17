import { useState } from 'react'
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
  Edit2
} from 'lucide-react'
import { cn } from '../../lib/utils'

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account details and society subscription plan.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Profile Information */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2rem] border border-border p-8 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-24 bg-primary/10" />
               <div className="relative pt-6 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full border-4 border-white bg-primary text-white flex items-center justify-center text-3xl font-bold shadow-xl shadow-primary/20">
                     JD
                  </div>
                  <h2 className="text-xl font-bold mt-4">John Doe</h2>
                  <p className="text-xs font-semibold text-primary mt-1 px-3 py-1 bg-primary/10 rounded-full">Society Chairman</p>
               </div>

               <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                     <Mail className="w-4 h-4 text-muted-foreground" />
                     <span className="font-medium text-foreground">john.doe@greensociety.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                     <Phone className="w-4 h-4 text-muted-foreground" />
                     <span className="font-medium text-foreground">+91 98765 43210</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                     <Building2 className="w-4 h-4 text-muted-foreground" />
                     <span className="font-medium text-foreground">Flat A-101 (Owner)</span>
                  </div>
               </div>

               <div className="mt-8 border-t border-border pt-6">
                  <button className="w-full flex items-center gap-2 justify-center py-2.5 rounded-xl border border-border text-sm font-bold text-foreground hover:bg-secondary hover:text-primary transition-all">
                     <Edit2 className="w-4 h-4" /> Edit Profile
                  </button>
               </div>
            </div>

            <div className="bg-destructive/5 rounded-[2rem] border border-destructive/10 p-6">
               <button className="w-full flex items-center gap-2 justify-center py-3 rounded-xl bg-destructive text-white text-sm font-bold shadow-lg shadow-destructive/20 hover:scale-[1.02] transition-all">
                  <LogOut className="w-4 h-4" /> Sign Out from all devices
               </button>
            </div>
         </div>

         {/* Subscription & Plan details */}
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-primary rounded-[2rem] p-8 text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
               <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-700" />
               <Crown className="absolute right-8 top-8 w-16 h-16 opacity-10 rotate-12" />
               
               <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary-foreground/80 mb-2">
                  <ShieldCheck className="w-4 h-4" /> Current Plan
               </div>
               <div className="flex items-end gap-3 mb-6">
                  <h3 className="text-4xl font-extra-bold">Premium</h3>
                  <span className="text-sm font-semibold opacity-80 mb-1">/ Annual</span>
               </div>
               
               <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-6 border-t border-white/20">
                  <div>
                     <p className="text-[10px] uppercase font-bold opacity-70 mb-1">Billing Cycle</p>
                     <p className="text-sm font-semibold">Renews on Jan 14, 2025</p>
                  </div>
                  <div>
                     <p className="text-[10px] uppercase font-bold opacity-70 mb-1">Max Units</p>
                     <p className="text-sm font-semibold">Unlimited Properties</p>
                  </div>
                  <button className="ml-auto bg-white text-primary px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:bg-white/90 transition-all">
                     Manage Billing
                  </button>
               </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-border overflow-hidden shadow-sm">
               <div className="p-8 border-b border-border bg-secondary/30 flex justify-between items-center">
                  <div>
                     <h3 className="font-bold text-lg">Plan Features</h3>
                     <p className="text-xs text-muted-foreground mt-1">What's included in your Premium Tier.</p>
                  </div>
                  <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                     <Zap className="w-4 h-4" /> Upgrade to Enterprise
                  </button>
               </div>
               <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                     {[
                       { title: 'Unlimited Members', desc: 'No limits on total residents', icon: Users },
                       { title: 'Automated Billing', desc: 'Auto recurring maintenance generation', icon: CreditCard },
                       { title: 'Bulk SMS & WhatsApp', desc: '5000 free credits / month', icon: MessageSquare },
                       { title: 'Priority Support', desc: '24/7 Phone and Ticket assistance', icon: ShieldCheck },
                     ].map((feat, idx) => (
                       <div key={idx} className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
                             <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="font-bold text-foreground text-sm">{feat.title}</p>
                             <p className="text-[10px] text-muted-foreground mt-0.5">{feat.desc}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-border p-8 shadow-sm">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg">Recent Invoices</h3>
                  <button className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">Download All</button>
               </div>
               <div className="space-y-4">
                  {[
                    { id: 'INV-2024-001', date: 'Jan 14, 2024', amount: '₹14,999', status: 'Paid' },
                    { id: 'INV-2023-012', date: 'Jan 14, 2023', amount: '₹12,499', status: 'Paid' },
                  ].map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between p-4 rounded-2xl border border-secondary hover:border-primary/20 transition-all cursor-pointer group">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                             <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                             <p className="font-bold text-sm text-foreground">{inv.id}</p>
                             <p className="text-[10px] text-muted-foreground">{inv.date}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <p className="font-bold text-sm text-foreground">{inv.amount}</p>
                          <span className="px-2.5 py-1 rounded-md bg-success/10 text-success text-[10px] font-bold">{inv.status}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
