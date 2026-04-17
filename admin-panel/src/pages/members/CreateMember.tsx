import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { 
  UserPlus, 
  ArrowLeft, 
  Save, 
  ShieldCheck,
  User,
  Copy,
  Check,
  Loader
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { createInviteCode, type InviteCode } from '../../api/http'

export function CreateMember() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'form' | 'invite'>('form')
  const [loading, setLoading] = useState(false)
  const [inviteCode, setInviteCode] = useState<InviteCode | null>(null)
  const [copied, setCopied] = useState(false)
  const [formData, setFormData] = useState({
    type: 'resident',
    expiresInDays: 30,
    maxUses: 1
  })

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.type) {
      toast.error('Please select invite type')
      return
    }

    try {
      setLoading(true)
      const response = await createInviteCode(
        formData.type as 'resident' | 'admin',
        formData.expiresInDays,
        formData.maxUses
      )
      
      if (response.ok && response.inviteCode) {
        setInviteCode(response.inviteCode)
        setStep('invite')
        toast.success('Invite code created successfully!')
      } else {
        toast.error('Failed to create invite code')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create invite code')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode.code)
      setCopied(true)
      toast.success('Code copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (step === 'invite' && inviteCode) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setStep('form')
              setInviteCode(null)
            }}
            className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Invite Code Ready</h1>
            <p className="text-muted-foreground mt-1">Share this code with the new member to join.</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="p-8 bg-gradient-to-br from-success/10 to-success/5 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
                <Check className="w-8 h-8 text-success" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">Invite Code Created!</h2>
                <p className="text-muted-foreground text-sm mt-1">Share this code with the member below</p>
              </div>
            </div>

            <div className="p-8 border-t border-border space-y-6">
              <div className="bg-primary/5 rounded-xl p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Invite Code</p>
                  <p className="text-3xl font-bold text-primary font-mono mt-2">{inviteCode.code}</p>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-bold hover:scale-[1.05] transition-transform"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Type</p>
                  <p className="text-sm font-bold text-foreground mt-1 capitalize">{inviteCode.type}</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Max Uses</p>
                  <p className="text-sm font-bold text-foreground mt-1">{inviteCode.maxUses}</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Expires</p>
                  <p className="text-sm font-bold text-foreground mt-1">{new Date(inviteCode.expiresAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <p className="text-xs font-bold text-blue-900">How to use:</p>
                <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Send the code above to the member</li>
                  <li>They visit the landing page and select "Join"</li>
                  <li>They enter the invite code and fill their details</li>
                  <li>Once registered, they will need your approval to access</li>
                </ol>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-border">
                <button 
                  onClick={() => navigate('/members')}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-secondary transition-all"
                >Close</button>
                <button 
                  onClick={() => {
                    setStep('form')
                    setInviteCode(null)
                  }}
                  className="flex items-center gap-2 bg-primary text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Create Another
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Invite</h1>
          <p className="text-muted-foreground mt-1">Generate an invite code for a new member to join your society.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="p-6 border-b border-border bg-secondary/30 flex items-center gap-2">
                 <UserPlus className="w-5 h-5 text-primary" />
                 <h3 className="font-bold">Invite Configuration</h3>
              </div>
              <form onSubmit={handleCreateInvite} className="p-8 space-y-6">
                 <div className="space-y-4">
                    <label className="text-xs font-bold text-muted-foreground uppercase px-1 flex items-center gap-2">
                       <ShieldCheck className="w-3.5 h-3.5" /> Invite Type
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                       <button 
                         type="button"
                         onClick={() => setFormData({...formData, type: 'resident'})}
                         className={cn(
                           "p-4 rounded-xl border-2 transition-all font-bold",
                           formData.type === 'resident' 
                             ? "border-primary bg-primary/5 text-primary" 
                             : "border-border bg-white text-muted-foreground"
                         )}
                       >
                         Resident
                       </button>
                       <button 
                         type="button"
                         onClick={() => setFormData({...formData, type: 'admin'})}
                         className={cn(
                           "p-4 rounded-xl border-2 transition-all font-bold",
                           formData.type === 'admin' 
                             ? "border-primary bg-primary/5 text-primary" 
                             : "border-border bg-white text-muted-foreground"
                         )}
                       >
                         Admin
                       </button>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase px-1">Expires In (Days)</label>
                    <input 
                      type="number" 
                      min="1"
                      max="365"
                      placeholder="e.g. 30"
                      className="w-full bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all"
                      value={formData.expiresInDays}
                      onChange={(e) => setFormData({...formData, expiresInDays: parseInt(e.target.value) || 30})}
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase px-1">Max Uses</label>
                    <input 
                      type="number" 
                      min="1"
                      max="1000"
                      placeholder="e.g. 1"
                      className="w-full bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all"
                      value={formData.maxUses}
                      onChange={(e) => setFormData({...formData, maxUses: parseInt(e.target.value) || 1})}
                    />
                 </div>

                 <div className="pt-8 border-t border-border flex justify-end gap-3">
                    <button 
                      type="button"
                      onClick={() => navigate('/members')}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-secondary transition-all"
                    >Cancel</button>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 bg-primary text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                       {loading ? (
                         <>
                           <Loader className="w-4 h-4 animate-spin" />
                           Creating...
                         </>
                       ) : (
                         <>
                           <Save className="w-4 h-4" />
                           Create Invite
                         </>
                       )}
                    </button>
                 </div>
              </form>
           </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
           <div className="bg-primary/5 border border-primary/10 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold">
                 <ShieldCheck className="w-5 h-5" />
                 How It Works
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                 Create an invite code to send to new members. They will use this code to register on the platform and join your society.
              </p>
           </div>
           
           <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 font-bold">
                 <User className="w-5 h-5 text-primary" />
                 Member Types
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <p className="text-xs font-bold text-foreground">Resident</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Regular society members who need admin approval</p>
                </div>
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <p className="text-xs font-bold text-foreground">Admin</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Society administrators with full access (auto-approved)</p>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
