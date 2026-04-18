import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { 
  Megaphone, 
  ArrowLeft, 
  Send, 
  Eye,
  FileText,
  Clock,
  ShieldAlert,
  Loader,
  AlertCircle
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { createNotice } from '../../api/http'

export function CreateNotice() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    audience: 'all' as const,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    }

    if (!formData.body.trim()) {
      newErrors.body = 'Notice details are required'
    } else if (formData.body.length < 10) {
      newErrors.body = 'Notice details must be at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix all errors before submitting')
      return
    }

    try {
      setLoading(true)
      const response = await createNotice({
        title: formData.title,
        body: formData.body,
        audience: formData.audience,
      })

      if (response.ok) {
        toast.success('Notice posted successfully!')
        setTimeout(() => {
          navigate('/notices')
        }, 1000)
      } else {
        toast.error('Failed to create notice')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create notice')
    } finally {
      setLoading(false)
    }
  }

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
          <p className="text-muted-foreground mt-1">Share important announcements with society members.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="p-8 space-y-6">
                 {/* Title */}
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase px-1">Notice Title *</label>
                    <input 
                      type="text" 
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value })
                        if (errors.title) setErrors({ ...errors, title: '' })
                      }}
                      placeholder="e.g. Annual General Body Meeting - 2024"
                      className={cn(
                        "w-full bg-secondary/50 border-2 focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all resize-none",
                        errors.title ? "border-destructive/50 focus:border-destructive" : "border-transparent focus:border-primary/20"
                      )}
                    />
                    {errors.title && (
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">{errors.title}</span>
                      </div>
                    )}
                 </div>

                 {/* Body */}
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase px-1">Notice Details *</label>
                    <textarea 
                      rows={6}
                      value={formData.body}
                      onChange={(e) => {
                        setFormData({ ...formData, body: e.target.value })
                        if (errors.body) setErrors({ ...errors, body: '' })
                      }}
                      placeholder="Write your announcement here..."
                      className={cn(
                        "w-full bg-secondary/50 border-2 focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all resize-none",
                        errors.body ? "border-destructive/50 focus:border-destructive" : "border-transparent focus:border-primary/20"
                      )}
                    />
                    {errors.body && (
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">{errors.body}</span>
                      </div>
                    )}
                    <p className="text-[10px] text-muted-foreground">{formData.body.length} / 5000 characters</p>
                 </div>

                 {/* Audience */}
                 <div className="space-y-4">
                    <label className="text-xs font-bold text-muted-foreground uppercase px-1">Target Audience *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'all', label: 'All Residents' },
                        { value: 'owners', label: 'Owners Only' },
                        { value: 'tenants', label: 'Tenants Only' },
                        { value: 'custom', label: 'Custom Selection' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, audience: option.value as any })}
                          className={cn(
                            "px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all",
                            formData.audience === option.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/50"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                 </div>

                 <div className="pt-8 border-t border-border flex justify-end gap-3">
                    <button 
                      type="button"
                      onClick={() => navigate('/notices')}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-secondary transition-all"
                    >Cancel</button>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 bg-primary text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Post Notice
                        </>
                      )}
                    </button>
                 </div>
              </div>
           </form>
        </div>

        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
              <h4 className="font-bold border-b border-border pb-3 flex items-center gap-2 text-primary">
                 <Eye className="w-4.5 h-4.5" /> Preview (App)
              </h4>
              <div className="bg-secondary/30 rounded-2xl p-4 border border-border">
                 <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[10px] text-white font-bold">SA</div>
                    <div className="text-[10px]">
                       <p className="font-bold text-foreground">Society Admin</p>
                       <p className="text-muted-foreground">Now</p>
                    </div>
                 </div>
                 <h5 className="font-bold text-sm mb-1">{formData.title || 'Your Title Here'}</h5>
                 <p className="text-[10px] text-muted-foreground line-clamp-3">{formData.body || 'The notice description will appear here as you type...'}</p>
                 <div className="mt-4 pt-4 border-t border-border flex justify-between items-center px-1">
                    <span className="text-[8px] font-bold text-primary">Read More</span>
                    <Megaphone className="w-3 h-3 text-muted-foreground" />
                 </div>
              </div>
           </div>

           <div className="bg-warning/5 border border-warning/10 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-warning font-bold">
                 <ShieldAlert className="w-5 h-5" />
                 Tips
              </div>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li>• Be clear and concise with your message</li>
                <li>• Include important dates and deadlines</li>
                <li>• Use appropriate audience targeting</li>
                <li>• Post urgent notices in advance</li>
              </ul>
           </div>
        </div>
      </div>
    </div>
  )
}
