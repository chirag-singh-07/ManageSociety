import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Bell, 
  Send, 
  Search, 
  Filter, 
  Settings, 
  CheckCircle2, 
  Clock, 
  Mail,
  MessageSquare,
  Users
} from 'lucide-react'
import { cn } from '../../lib/utils'

const notificationsLog = [
  { id: 1, title: 'Maintenance Payment Reminder', type: 'Payment', channel: 'SMS + App', audience: 'Defaulters', date: 'Today, 10:30 AM', status: 'delivered', reads: '12/15' },
  { id: 2, title: 'Upcoming General Meeting', type: 'Event', channel: 'Email + App', audience: 'All Members', date: 'Yesterday, 4:00 PM', status: 'delivered', reads: '142/150' },
  { id: 3, title: 'Water Supply Restored', type: 'Alert', channel: 'App Notification', audience: 'Block A & B', date: 'Oct 22, 2023', status: 'delivered', reads: '45/45' },
  { id: 4, title: 'Security Advisory', type: 'Alert', channel: 'Email', audience: 'All Members', date: 'Oct 20, 2023', status: 'failed', reads: '0/150' },
]

export function NotificationsList() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">Manage and track communications sent to society members.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => navigate('/notifications/settings')}
            className="flex items-center gap-2 bg-white border border-border text-foreground px-5 py-2.5 rounded-xl font-bold hover:bg-secondary transition-all shadow-sm"
          >
            <Settings className="w-4 h-4" />
            Config
          </button>
          <button 
            onClick={() => navigate('/notifications/create')}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Send className="w-4 h-4" />
            Send Broadcast
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-primary p-6 rounded-2xl text-white shadow-xl shadow-primary/20 relative overflow-hidden md:col-span-2">
           <Bell className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
           <p className="text-sm font-semibold opacity-80 uppercase tracking-widest mb-1">Monthly Usage</p>
           <h3 className="text-3xl font-bold">1,245 <span className="text-lg opacity-80 font-normal">/ 5,000</span></h3>
           <p className="text-xs opacity-70 mt-2">SMS & Email Credits Remaining</p>
           <div className="w-full bg-black/20 h-2 rounded-full mt-4 overflow-hidden">
              <div className="bg-white h-full w-[25%] rounded-full" />
           </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-center">
           <p className="text-xs font-bold text-muted-foreground uppercase opacity-60">Avg. Open Rate</p>
           <h3 className="text-3xl font-bold text-success mt-2">68%</h3>
           <p className="text-[10px] text-muted-foreground mt-1 text-success font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Excellent Engagement
           </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-center">
           <p className="text-xs font-bold text-muted-foreground uppercase opacity-60">Failed Delivery</p>
           <h3 className="text-3xl font-bold text-destructive mt-2">12</h3>
           <button className="text-[10px] text-destructive mt-1 font-semibold text-left underline">View Failed Logs</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search past notifications..." 
              className="w-full bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
             <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-secondary transition-all">
                <Filter className="w-4 h-4" />
                Filter Types
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/30">
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Broadcast Intel</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Target Audience</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Channel & Delivery</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {notificationsLog.map((log) => (
                <tr 
                  key={log.id} 
                  className="hover:bg-secondary/20 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className={cn(
                         "w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110",
                         log.type === 'Alert' ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"
                       )}>
                          <Bell className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="font-bold text-sm text-foreground">{log.title}</p>
                          <p className="text-[10px] text-muted-foreground">{log.type} • {log.date}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
                       <Users className="w-3.5 h-3.5 text-muted-foreground" />
                       {log.audience}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-semibold mt-0.5 ml-5">Reads: {log.reads}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       {log.channel.includes('Email') && <Mail className="w-3.5 h-3.5 text-muted-foreground" />}
                       {log.channel.includes('SMS') && <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />}
                       {log.channel.includes('App') && <Bell className="w-3.5 h-3.5 text-muted-foreground" />}
                       <span className="text-xs font-bold text-muted-foreground">{log.channel}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {log.status === 'delivered' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-success/10 text-success">
                        <CheckCircle2 className="w-3 h-3" /> Delivered
                      </span>
                    )}
                    {log.status === 'failed' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive">
                        <Clock className="w-3 h-3" /> Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
