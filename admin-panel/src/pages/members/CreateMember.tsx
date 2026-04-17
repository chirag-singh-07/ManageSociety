import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  UserPlus, 
  ArrowLeft, 
  Save, 
  Mail, 
  Phone, 
  User, 
  MapPin, 
  ShieldCheck,
  Building,
  Info
} from 'lucide-react'
import { cn } from '../../lib/utils'

export function CreateMember() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    flat: '',
    type: 'owner',
    status: 'active'
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Add New Member</h1>
          <p className="text-muted-foreground mt-1">Register a new resident or property owner in the society.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="p-6 border-b border-border bg-secondary/30 flex items-center gap-2">
                 <UserPlus className="w-5 h-5 text-primary" />
                 <h3 className="font-bold">Member Information</h3>
              </div>
              <div className="p-8 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-muted-foreground uppercase px-1 flex items-center gap-2">
                          <User className="w-3.5 h-3.5" /> Full Name
                       </label>
                       <input 
                         type="text" 
                         placeholder="e.g. Rahul Sharma"
                         className="w-full bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all"
                         value={formData.name}
                         onChange={(e) => setFormData({...formData, name: e.target.value})}
                       />
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-muted-foreground uppercase px-1 flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5" /> Flat / Unit Number
                       </label>
                       <input 
                         type="text" 
                         placeholder="e.g. A-101"
                         className="w-full bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all"
                         value={formData.flat}
                         onChange={(e) => setFormData({...formData, flat: e.target.value})}
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold text-muted-foreground uppercase px-1 flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5" /> Email Address
                       </label>
                       <input 
                         type="email" 
                         placeholder="name@example.com"
                         className="w-full bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all"
                         value={formData.email}
                         onChange={(e) => setFormData({...formData, email: e.target.value})}
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold text-muted-foreground uppercase px-1 flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5" /> Phone Number
                       </label>
                       <input 
                         type="tel" 
                         placeholder="+91 98765 43210"
                         className="w-full bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all"
                         value={formData.phone}
                         onChange={(e) => setFormData({...formData, phone: e.target.value})}
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold text-muted-foreground uppercase px-1">Ownership Type</label>
                       <div className="flex bg-secondary p-1 rounded-xl">
                          <button 
                            onClick={() => setFormData({...formData, type: 'owner'})}
                            className={cn(
                              "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                              formData.type === 'owner' ? "bg-white text-primary shadow-sm" : "text-muted-foreground"
                            )}
                          >Owner</button>
                          <button 
                            onClick={() => setFormData({...formData, type: 'tenant'})}
                            className={cn(
                              "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                              formData.type === 'tenant' ? "bg-white text-primary shadow-sm" : "text-muted-foreground"
                            )}
                          >Tenant</button>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold text-muted-foreground uppercase px-1">Initial Status</label>
                       <select 
                         className="w-full bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all appearance-none"
                         value={formData.status}
                         onChange={(e) => setFormData({...formData, status: e.target.value})}
                       >
                          <option value="active">Active</option>
                          <option value="pending">Pending Approval</option>
                       </select>
                    </div>
                 </div>

                 <div className="pt-8 border-t border-border flex justify-end gap-3">
                    <button 
                      onClick={() => navigate('/members')}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-secondary transition-all"
                    >Cancel</button>
                    <button className="flex items-center gap-2 bg-primary text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                       <Save className="w-4 h-4" />
                       Create Member
                    </button>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
           <div className="bg-primary/5 border border-primary/10 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold">
                 <ShieldCheck className="w-5 h-5" />
                 Important Note
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                 An invitation email will be sent to the member once the account is created. They will be required to set their own password upon first login.
              </p>
           </div>
           
           <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 font-bold">
                 <Building className="w-5 h-5 text-primary" />
                 Flat Allocation
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                 You can only assign members to flats that are currently vacant or managed by the society.
              </p>
              <div className="p-3 bg-secondary/50 rounded-xl flex items-start gap-3">
                 <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                 <p className="text-[10px] leading-tight text-muted-foreground">
                    Multiple members can be assigned to the same flat as "Dependents" after the primary member is created.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
