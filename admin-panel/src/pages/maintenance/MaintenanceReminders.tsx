import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Send, 
  Search, 
  Bell, 
  Mail, 
  MessageSquare, 
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react'
import { cn } from '../../lib/utils'

const defaulters = [
  { id: 1, name: 'Priya Patel', flat: 'B-202', amount: '₹3,800', months: 1, status: 'unpaid' },
  { id: 2, name: 'Amit Verma', flat: 'C-305', amount: '₹8,400', months: 2, status: 'overdue' },
  { id: 3, name: 'Karan Mehra', flat: 'A-201', amount: '₹12,600', months: 3, status: 'overdue' },
  { id: 4, name: 'Surbhi Jain', flat: 'D-105', amount: '₹3,500', months: 1, status: 'unpaid' },
]

export function MaintenanceReminders() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<number[]>([])

  const toggleSelect = (id: number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(i => i !== id))
    } else {
      setSelected([...selected, id])
    }
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Send Reminders</h1>
            <p className="text-muted-foreground mt-1">Notify members about their pending maintenance dues.</p>
          </div>
        </div>
        <button 
          disabled={selected.length === 0}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
        >
          <Send className="w-4 h-4" />
          Send to {selected.length} Members
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
           <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="p-6 border-b border-border flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSelected(selected.length === defaulters.length ? [] : defaulters.map(d => d.id))}
                      className="w-5 h-5 border-2 border-primary/20 rounded-md flex items-center justify-center transition-all bg-primary/5 hover:border-primary/50"
                    >
                       {selected.length === defaulters.length && <div className="w-2.5 h-2.5 bg-primary rounded-[2px]" />}
                    </button>
                    <span className="text-sm font-bold text-foreground">Select All ({defaulters.length})</span>
                 </div>
                 <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      placeholder="Search defaulters..." 
                      className="w-full bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl pl-10 pr-4 py-2 text-xs transition-all"
                    />
                 </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-secondary/30">
                      <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Select</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Member</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Dues</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {defaulters.map((d) => (
                      <tr key={d.id} className={cn("hover:bg-secondary/20 transition-colors", selected.includes(d.id) && "bg-primary/5")}>
                        <td className="px-6 py-4">
                           <button 
                             onClick={() => toggleSelect(d.id)}
                             className={cn(
                               "w-5 h-5 border-2 rounded-md flex items-center justify-center transition-all",
                               selected.includes(d.id) ? "border-primary bg-primary text-white" : "border-border bg-white"
                             )}
                           >
                              {selected.includes(d.id) && <CheckCircle2 className="w-3.5 h-3.5" />}
                           </button>
                        </td>
                        <td className="px-6 py-4">
                           <p className="font-bold text-sm text-foreground">{d.name}</p>
                           <p className="text-[10px] text-muted-foreground">Flat {d.flat}</p>
                        </td>
                        <td className="px-6 py-4">
                           <p className="font-bold text-sm text-foreground">{d.amount}</p>
                           <p className="text-[10px] text-destructive font-semibold">Pending for {d.months} Month(s)</p>
                        </td>
                        <td className="px-6 py-4">
                           <span className={cn(
                             "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                             d.status === 'overdue' ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
                           )}>
                              {d.status}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
              <h4 className="font-bold border-b border-border pb-3">Reminder Channels</h4>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-transparent hover:border-primary/20 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <Bell className="w-4 h-4" />
                       </div>
                       <span className="text-sm font-semibold">App Notification</span>
                    </div>
                    <div className="w-10 h-5 bg-primary rounded-full p-1 flex justify-end">
                       <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                    </div>
                 </div>
                 <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-transparent hover:border-primary/20 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center">
                          <MessageSquare className="w-4 h-4" />
                       </div>
                       <span className="text-sm font-semibold">WhatsApp / SMS</span>
                    </div>
                    <div className="w-10 h-5 bg-primary rounded-full p-1 flex justify-end">
                       <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                    </div>
                 </div>
                 <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-transparent hover:border-primary/20 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
                          <Mail className="w-4 h-4" />
                       </div>
                       <span className="text-sm font-semibold">Official Email</span>
                    </div>
                    <div className="w-10 h-5 bg-border rounded-full p-1 flex justify-start">
                       <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/10 space-y-3">
              <div className="flex items-center gap-2 font-bold text-destructive">
                 <AlertCircle className="w-5 h-5" />
                 Escalation Mode
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                "Enable automatic fine of 10% for members with more than 3 months of pending dues. This will be reflected in next month's bill."
              </p>
              <button className="w-full py-2.5 rounded-xl border border-destructive text-destructive text-xs font-bold hover:bg-destructive hover:text-white transition-all">
                 Apply Fines Now
              </button>
           </div>
        </div>
      </div>
    </div>
  )
}
