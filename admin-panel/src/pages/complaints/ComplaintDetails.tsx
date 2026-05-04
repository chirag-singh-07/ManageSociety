import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  MessageSquare, 
  ArrowLeft, 
  User, 
  Clock, 
  Tag, 
  Send,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  ShieldAlert,
  Building,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '../../lib/utils'
import {
  getComplaint,
  updateComplaintStatus,
  addComplaintComment,
  type Complaint,
  type ComplaintComment,
} from '../../api/http'

export function ComplaintDetails() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [status, setStatus] = useState('open')
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [comments, setComments] = useState<ComplaintComment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (id) {
      fetchComplaint()
    }
  }, [id])

  const fetchComplaint = async () => {
    try {
      setLoading(true)
      const data = await getComplaint(id!)
      setComplaint(data.complaint)
      setComments(data.comments || [])
      setStatus(data.complaint.status)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load complaint")
      navigate(-1)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: Complaint['status']) => {
    if (!complaint || !id) return
    
    try {
      setStatus(newStatus)
      await updateComplaintStatus(id, newStatus)
      toast.success("Complaint status updated")
      setComplaint({ ...complaint, status: newStatus })
    } catch (err) {
      setStatus(complaint.status)
      toast.error(err instanceof Error ? err.message : "Failed to update status")
    }
  }

  const handleAddComment = async () => {
    if (!comment.trim() || !id) return

    try {
      setSubmitting(true)
      await addComplaintComment(id, comment)
      toast.success("Comment added")
      setComment('')
      await fetchComplaint()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add comment")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading complaint...</p>
        </div>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-warning mx-auto" />
          <p className="text-sm font-semibold text-foreground">Complaint not found</p>
        </div>
      </div>
    )
  }

  const reportedBy =
    typeof complaint.createdBy === 'object' && complaint.createdBy !== null
      ? complaint.createdBy.name || complaint.createdBy._id
      : complaint.memberId || complaint.createdBy
  const visibleAttachments = complaint.attachments ?? []

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
               <h1 className="text-3xl font-bold tracking-tight text-foreground">#{id} {complaint.title}</h1>
               <span className={cn(
                 "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                 complaint.priority === 'high' ? "bg-warning/10 text-warning" : complaint.priority === 'critical' ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
               )}>
                  {complaint.priority} Priority
               </span>
            </div>
            <p className="text-muted-foreground mt-1">Reported by {reportedBy} on {new Date(complaint.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <select 
             className="bg-secondary text-foreground text-xs font-bold px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-primary/20 appearance-none min-w-[140px]"
             value={status}
             onChange={(e) => handleStatusChange(e.target.value as Complaint['status'])}
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
              
              {visibleAttachments.length > 0 && (
                <div className="flex items-center gap-3">
                   {visibleAttachments.slice(0, 2).map((attachment, idx) => (
                     <a key={attachment.fileId || attachment.publicUrl || attachment.url || idx} href={attachment.publicUrl || attachment.url || '#'} target="_blank" rel="noopener noreferrer" className="w-20 h-20 rounded-xl bg-secondary border border-border flex items-center justify-center hover:bg-primary/10 transition-all">
                        <Paperclip className="w-6 h-6 text-muted-foreground" />
                     </a>
                   ))}
                   {visibleAttachments.length > 2 && (
                     <div className="text-xs text-muted-foreground flex items-center gap-2 ml-2">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        {visibleAttachments.length} Files Attached
                     </div>
                   )}
                </div>
              )}
           </div>

           {/* Conversation / Timeline */}
           <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="p-6 border-b border-border bg-secondary/30">
                 <h3 className="font-bold">Internal Discussion & Timeline</h3>
              </div>
              <div className="p-8 space-y-8">
                 <div className="relative pl-8 border-l-2 border-border space-y-10">
                    {comments.map((comment, idx) => (
                      <div key={idx} className="relative">
                        <span className={cn(
                          "absolute -left-[41px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm ring-4",
                          comment.type === 'system' ? 'bg-success ring-success/10' : 'bg-primary ring-primary/10'
                        )}></span>
                        <div {... (comment.type === 'admin' ? {className: "bg-secondary/30 p-4 rounded-2xl border border-border"} : {})}>
                          <p className="text-xs font-bold text-foreground">{comment.type === 'admin' ? 'Admin Comment' : 'System Update'}</p>
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed italic">{comment.message}</p>
                          <p className="text-[10px] text-muted-foreground uppercase opacity-60 mt-3 font-bold">{new Date(comment.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                 </div>

                 <div className="pt-8 border-t border-border mt-4">
                    <div className="relative">
                       <textarea 
                         rows={2}
                         value={comment}
                         onChange={(e) => setComment(e.target.value)}
                         placeholder="Post an internal update or comment..."
                         className="w-full bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-2xl px-4 py-3 text-sm transition-all resize-none pr-14"
                       />
                       <button 
                         onClick={handleAddComment}
                         disabled={submitting || !comment.trim()}
                         className="absolute right-3 bottom-3 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                       >
                          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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
                    <span className="text-xs font-bold text-foreground underline">{reportedBy}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                       <Building className="w-4 h-4" /> Flat
                    </div>
                    <span className="text-xs font-bold text-foreground">{complaint.flatNumber || 'N/A'}</span>
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
                    <span className="text-xs font-bold text-success">Pending</span>
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
