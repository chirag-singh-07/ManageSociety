import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  MessageSquare, 
  ArrowLeft, 
  User, 
  Clock, 
  Tag, 
  Send,
  MoreVertical,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  ShieldAlert,
  Building
} from 'lucide-react'
import { cn } from '../../lib/utils'

export function ComplaintDetails() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [status, setStatus] = useState('in_progress')

  const complaint = {
    id: id || '101',
    title: 'Water Leakage in A-Block Wing 2',
    member: 'Rahul Sharma',
    flat: 'A-101',
    category: 'Plumbing',
    priority: 'high',
    date: '2 hours ago',
    description: 'There is a major water leakage coming from the main supply line in the ceiling of A-Block Wing 2 lobby. It is creating a slippery surface and and needs immediate attention before it affects the electrical room nearby.'
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
               <h1 className="text-3xl font-bold tracking-tight text-foreground">#{complaint.id} {complaint.title}</h1>
               <span className={cn(
                 "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                 complaint.priority === 'high' ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"
               )}>
                  {complaint.priority} Priority
               </span>
            </div>
            <p className="text-muted-foreground mt-1">Reported by {complaint.member} • {complaint.date}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <select 
             className="bg-secondary text-foreground text-xs font-bold px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-primary/20 appearance-none min-w-[140px]"
             value={status}
             onChange={(e) => setStatus(e.target.value)}
           >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
           </select>
           <button className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-all">
              <MoreVertical className="w-5 h-5" />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           {/* Detailed Description */}
           <div className="bg-white rounded-2xl border border-border p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-2 font-bold text-lg mb-2">
                 <MessageSquare className="w-5 h-5 text-primary" />
                 Complaint Description
              </div>
              <p className="text-sm text-foreground leading-relaxed bg-secondary/20 p-6 rounded-2xl border border-border/50">
                 {complaint.description}
              </p>
              
              <div className="flex items-center gap-3">
                 <div className="w-20 h-20 rounded-xl bg-secondary border border-border flex items-center justify-center">
                    <Paperclip className="w-6 h-6 text-muted-foreground" />
                 </div>
                 <div className="w-20 h-20 rounded-xl bg-secondary border border-border flex items-center justify-center">
                    <Paperclip className="w-6 h-6 text-muted-foreground" />
                 </div>
                 <div className="text-xs text-muted-foreground flex items-center gap-2 ml-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    2 Images Attached
                 </div>
              </div>
           </div>

           {/* Conversation / Timeline */}
           <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="p-6 border-b border-border bg-secondary/30">
                 <h3 className="font-bold">Internal Discussion & Timeline</h3>
              </div>
              <div className="p-8 space-y-8">
                 <div className="relative pl-8 border-l-2 border-border space-y-10">
                    <div className="relative">
                       <span className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-success border-4 border-white shadow-sm ring-4 ring-success/10"></span>
                       <div>
                          <p className="text-xs font-bold text-foreground">Complaint Assigned</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Assigned to: Plumbing Team (Main Branch)</p>
                          <p className="text-[10px] text-muted-foreground uppercase opacity-60 mt-2 font-bold">1.5 Hours Ago</p>
                       </div>
                    </div>
                    <div className="relative">
                       <span className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-sm ring-4 ring-primary/10"></span>
                       <div className="bg-secondary/30 p-4 rounded-2xl border border-border">
                          <p className="text-xs font-bold text-foreground">Admin Comment</p>
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed italic">"I have spoken to the head plumber, they will be arriving within the hour. Please ensure the lobby area is cordoned off for safety."</p>
                          <p className="text-[10px] text-muted-foreground uppercase opacity-60 mt-3 font-bold">45 Mins Ago</p>
                       </div>
                    </div>
                 </div>

                 <div className="pt-8 border-t border-border mt-4">
                    <div className="relative">
                       <textarea 
                         rows={2}
                         placeholder="Post an internal update or comment..."
                         className="w-full bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-2xl px-4 py-3 text-sm transition-all resize-none pr-14"
                       />
                       <button className="absolute right-3 bottom-3 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                          <Send className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
              <h4 className="font-bold border-b border-border pb-3">Metadata</h4>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                       <User className="w-4 h-4" /> Reported by
                    </div>
                    <span className="text-xs font-bold text-foreground underline">{complaint.member}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                       <Building className="w-4 h-4" /> Flat
                    </div>
                    <span className="text-xs font-bold text-foreground">{complaint.flat}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                       <Tag className="w-4 h-4" /> Category
                    </div>
                    <span className="text-xs font-bold text-primary">{complaint.category}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                       <Clock className="w-4 h-4" /> Response Time
                    </div>
                    <span className="text-xs font-bold text-success">32 Mins (Target: 2h)</span>
                 </div>
              </div>
           </div>

           <div className="bg-destructive/5 border border-destructive/10 p-6 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-destructive font-bold text-sm">
                 <ShieldAlert className="w-5 h-5" />
                 Escalate Ticket
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                 If the team cannot resolve this within 24 hours, click below to notify the Society Chairman.
              </p>
              <button className="w-full py-2 bg-white text-destructive border border-destructive/20 text-[10px] font-bold rounded-lg hover:bg-destructive hover:text-white transition-all uppercase tracking-widest">
                 Notify Board Members
              </button>
           </div>
        </div>
      </div>
    </div>
  )
}
