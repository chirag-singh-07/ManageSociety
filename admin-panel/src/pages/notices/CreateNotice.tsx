import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Megaphone, 
  ArrowLeft, 
  Send, 
  Eye,
  Calendar,
  Users,
  Image as ImageIcon,
  FileText,
  Clock,
  ShieldAlert
} from 'lucide-react'
import { cn } from '../../lib/utils'

export function CreateNotice() {
  const navigate = useNavigate()
  const [activeChannel, setActiveChannel] = useState('both')

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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Create New Notice</h1>
          <p className="text-muted-foreground mt-1">Blast an announcement to society members via App & SMS.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="p-8 space-y-6">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase px-1">Notice Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Annual General Body Meeting - 2024"
                      className="w-full bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase px-1">Announcement Details</label>
                    <textarea 
                      rows={6}
                      placeholder="Write your announcement here..."
                      className="w-full bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all resize-none"
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <label className="text-xs font-bold text-muted-foreground uppercase px-1">Target Audience</label>
                       <div className="flex bg-secondary p-1 rounded-xl">
                          <button className="flex-1 py-2 text-xs font-bold rounded-lg bg-white text-primary shadow-sm">All Residents</button>
                          <button className="flex-1 py-2 text-xs font-bold text-muted-foreground rounded-lg hover:text-foreground">Specific Blocks</button>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-xs font-bold text-muted-foreground uppercase px-1">Post To</label>
                       <div className="flex bg-secondary p-1 rounded-xl">
                          <button 
                            onClick={() => setActiveChannel('app')}
                            className={cn(
                              "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                              activeChannel === 'app' ? "bg-white text-primary shadow-sm" : "text-muted-foreground"
                            )}
                          >App Only</button>
                          <button 
                            onClick={() => setActiveChannel('both')}
                            className={cn(
                              "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                              activeChannel === 'both' ? "bg-white text-primary shadow-sm" : "text-muted-foreground"
                            )}
                          >App + SMS</button>
                       </div>
                    </div>
                 </div>

                 <div className="pt-6 flex flex-wrap gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-muted-foreground text-xs font-bold hover:text-primary transition-all">
                       <ImageIcon className="w-4 h-4" />
                       Add Image
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-muted-foreground text-xs font-bold hover:text-primary transition-all">
                       <FileText className="w-4 h-4" />
                       Attach PDF
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-muted-foreground text-xs font-bold hover:text-primary transition-all">
                       <Clock className="w-4 h-4" />
                       Schedule later
                    </button>
                 </div>

                 <div className="pt-8 border-t border-border flex justify-end gap-3">
                    <button 
                      onClick={() => navigate('/notices')}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-secondary transition-all"
                    >Cancel</button>
                    <button className="flex items-center gap-2 bg-primary text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                       <Send className="w-4 h-4" />
                       Post Notice
                    </button>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
              <h4 className="font-bold border-b border-border pb-3 flex items-center gap-2 text-primary">
                 <Eye className="w-4.5 h-4.5" /> Preview (App)
              </h4>
              <div className="bg-secondary/30 rounded-2xl p-4 border border-border">
                 <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[10px] text-white font-bold">MS</div>
                    <div className="text-[10px]">
                       <p className="font-bold text-foreground">Green View Society</p>
                       <p className="text-muted-foreground">Just now</p>
                    </div>
                 </div>
                 <div className="w-full aspect-video bg-border rounded-xl mb-3 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-black/10" />
                 </div>
                 <h5 className="font-bold text-sm mb-1">Your Title Here</h5>
                 <p className="text-[10px] text-muted-foreground line-clamp-2">The notice description will appear here as you type...</p>
                 <div className="mt-4 pt-4 border-t border-border flex justify-between items-center px-1">
                    <span className="text-[8px] font-bold text-primary">Read More</span>
                    <Users className="w-3 h-3 text-muted-foreground" />
                 </div>
              </div>
           </div>

           <div className="bg-warning/5 border border-warning/10 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-warning font-bold">
                 <ShieldAlert className="w-5 h-5" />
                 Compliance Tip
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                 Ensure critical notices like maintenance and AGM are posted at least 48 hours in advance for maximum resident reach.
              </p>
           </div>
        </div>
      </div>
    </div>
  )
}
