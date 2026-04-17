import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Save, 
  Settings, 
  Plus, 
  Trash2, 
  IndianRupee,
  Building,
  UtilityPole,
  ShieldCheck,
  Zap
} from 'lucide-react'
import { cn } from '../../lib/utils'

export function SetupMaintenance() {
  const navigate = useNavigate()

  const [charges, setCharges] = useState([
    { id: 1, type: 'General Maintenance', amount: '2500', unit: 'per Flat', icon: Building, color: 'text-primary bg-primary/10' },
    { id: 2, type: 'Security & CCTV', amount: '500', unit: 'per Flat', icon: ShieldCheck, color: 'text-success bg-success/10' },
    { id: 3, type: 'Utility (Water/Street Lights)', amount: '800', unit: 'per Flat', icon: Zap, color: 'text-warning bg-warning/10' },
  ])

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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Setup Maintenance</h1>
            <p className="text-muted-foreground mt-1">Define the monthly billing structure for the society.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Save className="w-4 h-4" />
          Save Structure
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
                 <h3 className="font-bold text-lg">Billing Components</h3>
                 <button className="flex items-center gap-2 text-xs font-bold text-primary hover:bg-white px-3 py-1.5 rounded-lg transition-all">
                    <Plus className="w-4 h-4" />
                    Add Category
                 </button>
              </div>
              
              <div className="p-6 space-y-4">
                 {charges.map((charge) => (
                   <div key={charge.id} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl border border-border hover:border-primary/30 transition-all group">
                      <div className="flex items-center gap-4">
                         <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", charge.color)}>
                            <charge.icon className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="font-bold text-foreground">{charge.type}</p>
                            <p className="text-[10px] text-muted-foreground">{charge.unit}</p>
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                         <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
                            <input 
                              type="number" 
                              defaultValue={charge.amount}
                              className="w-32 bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl pl-7 pr-4 py-2.5 text-sm font-bold transition-all text-right"
                            />
                         </div>
                         <button className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-5 h-5" />
                         </button>
                      </div>
                   </div>
                 ))}
                 
                 <div className="mt-8 pt-6 border-t border-border flex justify-between items-center px-4">
                    <span className="font-bold text-muted-foreground">Approximate Monthly Bill</span>
                    <span className="text-2xl font-bold text-primary">₹3,800 <span className="text-xs text-muted-foreground font-medium">/ Flat</span></span>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
              <h3 className="font-bold text-lg mb-6">Automation Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Bill Generation Date</label>
                    <select className="w-full bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all appearance-none cursor-pointer">
                       <option>1st of every month</option>
                       <option>5th of every month</option>
                       <option>Last day of month</option>
                    </select>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Due Date Grace Period</label>
                    <div className="flex items-center gap-3">
                       <input 
                         type="number" 
                         defaultValue="10"
                         className="flex-1 bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all text-center font-bold"
                       />
                       <span className="text-sm font-semibold text-muted-foreground">Days</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
           <div className="bg-primary p-8 rounded-3xl text-white shadow-xl shadow-primary/20 relative overflow-hidden">
              <IndianRupee className="absolute -right-6 -bottom-6 w-40 h-40 opacity-10 rotate-12" />
              <p className="text-sm font-semibold opacity-70 uppercase tracking-widest mb-2">Estimated Revenue</p>
              <h3 className="text-4xl font-bold mb-4">₹4.71 Lakhs</h3>
              <p className="text-xs opacity-80 leading-relaxed mb-6">
                Based on current society strength of 124 units. This revenue covers security, housekeeping, and common area expenses.
              </p>
              <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
                 <p className="text-[10px] font-bold uppercase mb-2">Sinking Fund Policy</p>
                 <p className="text-[11px] opacity-90 leading-relaxed">
                    20% is automatically diverted to the long-term repair fund as per bylaws.
                 </p>
              </div>
           </div>
           
           <div className="p-6 border border-border rounded-2xl bg-white shadow-sm">
              <h4 className="font-bold text-sm mb-4">Apply To:</h4>
              <div className="space-y-3">
                 {['All Blocks', 'Wing A only', 'Commercial Units'].map((option, idx) => (
                   <div key={idx} className="flex items-center gap-3 cursor-pointer group">
                      <div className={cn(
                        "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                        idx === 0 ? "border-primary bg-primary text-white" : "border-border group-hover:border-primary/50"
                      )}>
                         {idx === 0 && <Plus className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-sm font-medium text-foreground">{option}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
