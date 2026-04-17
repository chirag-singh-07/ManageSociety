import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Send, 
  Users, 
  Bell, 
  Smartphone, 
  Mail, 
  TextSelect,
  Image as ImageIcon
} from 'lucide-react'
import { cn } from '../../lib/utils'

export function CreateNotification() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('push') // push, sms, email

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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">New Broadcast</h1>
            <p className="text-muted-foreground mt-1">Compose and send messages across multiple channels.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Send className="w-4 h-4" />
          Send Now
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="p-6 border-b border-border bg-secondary/20 flex gap-2">
                 <button 
                   onClick={() => setActiveTab('push')}
                   className={cn(
                     "px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2 transition-all",
                     activeTab === 'push' ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:bg-white/50"
                   )}
                 >
                    <Smartphone className="w-4 h-4" /> App Push
                 </button>
                 <button 
                   onClick={() => setActiveTab('sms')}
                   className={cn(
                     "px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2 transition-all",
                     activeTab === 'sms' ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:bg-white/50"
                   )}
                 >
                    <TextSelect className="w-4 h-4" /> SMS text
                 </button>
                 <button 
                   onClick={() => setActiveTab('email')}
                   className={cn(
                     "px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2 transition-all",
                     activeTab === 'email' ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:bg-white/50"
                   )}
                 >
                    <Mail className="w-4 h-4" /> Email
                 </button>
              </div>

              <div className="p-8 space-y-6">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase px-1">Message Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Water Supply Interruption"
                      className="w-full bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase px-1">Message Content</label>
                    <textarea 
                      rows={5}
                      placeholder="Type your message here..."
                      className="w-full bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all resize-none"
                    />
                 </div>

                 {activeTab === 'push' && (
                    <div className="border border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center bg-secondary/30 text-center hover:bg-secondary/50 transition-colors cursor-pointer group">
                       <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm text-primary mb-3 group-hover:scale-110 transition-transform">
                          <ImageIcon className="w-6 h-6" />
                       </div>
                       <p className="font-bold text-sm">Add Featured Image</p>
                       <p className="text-xs text-muted-foreground mt-1">JPEG, PNG up to 2MB. Highly recommended for engagement.</p>
                    </div>
                 )}
              </div>
           </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-lg flex items-center gap-2 border-b border-border pb-4">
                 <Users className="w-5 h-5 text-primary" /> Target Audience
              </h3>

              <div className="space-y-3">
                 <label className="flex items-center justify-between p-3 rounded-xl border border-border cursor-pointer hover:border-primary/50 transition-all bg-secondary/30">
                    <div>
                       <p className="text-sm font-bold">All Residents</p>
                       <p className="text-[10px] text-muted-foreground">Broadcast to everyone</p>
                    </div>
                    <input type="radio" name="audience" defaultChecked className="text-primary focus:ring-primary w-4 h-4" />
                 </label>
                 <label className="flex items-center justify-between p-3 rounded-xl border border-border cursor-pointer hover:border-primary/50 transition-all">
                    <div>
                       <p className="text-sm font-bold">Specific Blocks</p>
                       <p className="text-[10px] text-muted-foreground">e.g. Block A, B only</p>
                    </div>
                    <input type="radio" name="audience" className="text-primary focus:ring-primary w-4 h-4" />
                 </label>
                 <label className="flex items-center justify-between p-3 rounded-xl border border-border cursor-pointer hover:border-primary/50 transition-all">
                    <div>
                       <p className="text-sm font-bold">Defaulters Only</p>
                       <p className="text-[10px] text-muted-foreground">Members with pending dues</p>
                    </div>
                    <input type="radio" name="audience" className="text-primary focus:ring-primary w-4 h-4" />
                 </label>
              </div>
           </div>

           <div className="bg-foreground rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <Bell className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10" />
              <h4 className="font-bold mb-4">Mobile Preview</h4>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                 <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded bg-primary/80" />
                    <span className="text-[10px] font-bold opacity-80">ManageSociety App • Now</span>
                 </div>
                 <p className="text-sm font-bold">Water Supply Interruption</p>
                 <p className="text-xs opacity-80 mt-1 line-clamp-2">Dear residents, please note there will be no water supply tomorrow from...</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
