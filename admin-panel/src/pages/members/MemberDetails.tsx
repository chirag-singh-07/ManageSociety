import { useNavigate, useParams } from 'react-router-dom'
import { 
  ArrowLeft, 
  Edit2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  CreditCard,
  Building2,
  Trash2,
  ShieldAlert,
  History,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { cn } from '../../lib/utils'

export function MemberDetails() {
  const navigate = useNavigate()
  const { id } = useParams()

  // Mock data for display
  const member = {
    id: id || '123',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    phone: '+91 98765 43210',
    flat: 'A-101',
    type: 'Owner',
    status: 'active',
    joinedDate: 'Oct 12, 2023',
    documentsVerified: true
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
               <h1 className="text-3xl font-bold tracking-tight text-foreground">{member.name}</h1>
               <span className="px-2.5 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider">
                  {member.status}
               </span>
            </div>
            <p className="text-muted-foreground mt-1">Member since {member.joinedDate} • ID: #{member.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-secondary text-primary px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-primary hover:text-white transition-all">
              <Edit2 className="w-4 h-4" />
              Edit Profile
           </button>
           <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-destructive/20 text-destructive px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-destructive hover:text-white transition-all">
              <Trash2 className="w-4 h-4" />
              Remove
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="p-8 flex flex-col items-center text-center">
                 <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary mb-4">
                    RS
                 </div>
                 <h3 className="font-bold text-xl">{member.name}</h3>
                 <p className="text-sm text-muted-foreground mt-1">{member.type} • Flat {member.flat}</p>
                 
                 <div className="grid grid-cols-2 gap-4 w-full mt-8 pt-8 border-t border-border">
                    <div className="text-left">
                       <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Status</p>
                       <p className="text-sm font-bold text-success flex items-center gap-1 mt-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                       </p>
                    </div>
                    <div className="text-left">
                       <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Verified</p>
                       <p className="text-sm font-bold text-primary flex items-center gap-1 mt-1">
                          <ShieldAlert className="w-3.5 h-3.5" /> Documents
                       </p>
                    </div>
                 </div>
              </div>
              <div className="bg-secondary/30 p-4 border-t border-border">
                 <button className="w-full py-2.5 bg-white border border-border rounded-xl text-xs font-bold text-muted-foreground hover:text-primary transition-all">
                    Reset Security Key
                 </button>
              </div>
           </div>

           <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
              <h4 className="font-bold border-b border-border pb-3 flex items-center gap-2">
                 <Phone className="w-4 h-4 text-primary" /> Contact Details
              </h4>
              <div className="space-y-4">
                 <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                       <Mail className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase">Email</p>
                       <p className="text-sm font-semibold">{member.email}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                       <Phone className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase">Phone</p>
                       <p className="text-sm font-semibold">{member.phone}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border flex items-center justify-between">
                 <h3 className="font-bold text-lg flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" /> Recent Activities
                 </h3>
                 <button className="text-xs font-bold text-primary underline">View Activity Log</button>
              </div>
              <div className="p-0">
                 {[
                   { action: 'Paid Maintenance Fee', target: 'Oct - Dec Qtr', date: '2 days ago', icon: CreditCard, color: 'success' },
                   { action: 'Raised Complaint', target: '#101 - Water Leak', date: '1 week ago', icon: AlertCircle, color: 'warning' },
                   { action: 'Profile Updated', target: 'Phone number changed', date: '2 weeks ago', icon: User, color: 'primary' },
                 ].map((item, idx) => (
                   <div key={idx} className="p-6 flex items-center gap-4 hover:bg-secondary/20 border-b last:border-0 border-border transition-colors">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        item.color === 'success' ? "bg-success/10 text-success" :
                        item.color === 'warning' ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"
                      )}>
                         <item.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                         <p className="text-sm font-bold">{item.action}</p>
                         <p className="text-xs text-muted-foreground">{item.target}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-bold text-muted-foreground uppercase">{item.date}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                 <div className="flex items-center gap-3 mb-4">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <h4 className="font-bold">Payment Setup</h4>
                 </div>
                 <p className="text-xs text-muted-foreground leading-relaxed mb-6">Auto-debit is currently disabled for this member. They must pay manually.</p>
                 <button className="w-full py-2.5 rounded-xl border border-primary text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all">
                    Configure Payments
                 </button>
              </div>
              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                 <div className="flex items-center gap-3 mb-4">
                    <Building2 className="w-5 h-5 text-primary" />
                    <h4 className="font-bold">Property Details</h4>
                 </div>
                 <p className="text-xs text-muted-foreground leading-relaxed mb-6">Primary residence: A-Block, Wing 1, Flat 101. Square footage: 1,200 sq.ft.</p>
                 <button className="w-full py-2.5 rounded-xl border border-primary text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all">
                    Unit Details
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
