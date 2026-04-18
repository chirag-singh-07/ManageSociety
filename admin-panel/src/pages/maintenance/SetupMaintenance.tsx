import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Loader,
  Building,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAppDialog } from '../../components/dialog/AppDialogProvider'
import { 
  getMaintenanceCharges, 
  createMaintenanceCharge, 
  deleteMaintenanceCharge,
  type MaintenanceCharge 
} from '../../api/http'

export function SetupMaintenance() {
  const navigate = useNavigate()
  const { confirm } = useAppDialog()
  const [charges, setCharges] = useState<MaintenanceCharge[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newCharge, setNewCharge] = useState({
    name: '',
    description: '',
    amount: '',
    frequency: 'monthly' as const,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchCharges()
  }, [])

  const fetchCharges = async () => {
    try {
      setLoading(true)
      const response = await getMaintenanceCharges()
      if (response.ok) {
        setCharges(response.charges || [])
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load charges')
    } finally {
      setLoading(false)
    }
  }

  const validateNewCharge = () => {
    const newErrors: Record<string, string> = {}
    if (!newCharge.name.trim()) newErrors.name = 'Name is required'
    if (!newCharge.amount || Number(newCharge.amount) <= 0) newErrors.amount = 'Amount must be greater than 0'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddCharge = async () => {
    if (!validateNewCharge()) return

    try {
      setSaving(true)
      const response = await createMaintenanceCharge({
        name: newCharge.name,
        description: newCharge.description,
        amount: Number(newCharge.amount),
        frequency: newCharge.frequency,
      })

      if (response.ok && response.charge) {
        setCharges([...charges, response.charge])
        setNewCharge({ name: '', description: '', amount: '', frequency: 'monthly' })
        setErrors({})
        toast.success('Charge added successfully!')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add charge')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCharge = async (id: string) => {
    const selectedCharge = charges.find((c) => c._id === id)
    const approved = await confirm({
      title: 'Delete Charge',
      description: `Are you sure you want to delete "${selectedCharge?.name ?? 'this charge'}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      destructive: true,
    })
    if (!approved) return

    try {
      const response = await deleteMaintenanceCharge(id)
      if (response.ok) {
        setCharges(charges.filter(c => c._id !== id))
        toast.success('Charge deleted successfully!')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete charge')
    }
  }

  const totalMonthly = charges.reduce((sum, c) => sum + c.amount, 0)
  const formatINR = (value: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading charges...</p>
        </div>
      </div>
    )
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Setup Maintenance</h1>
            <p className="text-muted-foreground mt-1">Define the maintenance charges for your society.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="p-6 border-b border-border bg-secondary/20">
                 <h3 className="font-bold text-lg">Billing Components</h3>
              </div>
              
              <div className="p-6 space-y-4">
                 {charges.length > 0 ? (
                   <>
                     {charges.map((charge) => (
                       <div key={charge._id} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl border border-border hover:border-primary/30 transition-all group">
                          <div className="flex items-center gap-4 flex-1">
                             <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Building className="w-6 h-6 text-primary" />
                             </div>
                             <div>
                                <p className="font-bold text-foreground">{charge.name}</p>
                                {charge.description && <p className="text-xs text-muted-foreground">{charge.description}</p>}
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                             <div className="text-right">
                                <p className="text-xs text-muted-foreground mb-1">Amount ({charge.frequency})</p>
                                <p className="text-lg font-bold text-primary">{formatINR(charge.amount)}</p>
                             </div>
                             <button 
                               onClick={() => handleDeleteCharge(charge._id)}
                               className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                             >
                                <Trash2 className="w-5 h-5" />
                             </button>
                          </div>
                       </div>
                     ))}
                     
                     <div className="mt-8 pt-6 border-t border-border flex justify-between items-center px-4">
                        <span className="font-bold text-muted-foreground">Total Monthly Charge</span>
                        <span className="text-2xl font-bold text-primary">{formatINR(totalMonthly)}</span>
                     </div>
                   </>
                 ) : (
                   <div className="text-center py-12">
                     <Building className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                     <p className="text-muted-foreground">No charges configured yet</p>
                   </div>
                 )}
              </div>
           </div>

           {/* Add New Charge */}
           <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
              <h3 className="font-bold text-lg mb-6">Add New Charge</h3>
              <div className="space-y-4">
                 <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase px-1 mb-2 block">Charge Name *</label>
                    <input 
                      type="text" 
                      value={newCharge.name}
                      onChange={(e) => {
                        setNewCharge({ ...newCharge, name: e.target.value })
                        if (errors.name) setErrors({ ...errors, name: '' })
                      }}
                      placeholder="e.g., General Maintenance"
                      className={cn(
                        "w-full bg-secondary/50 border-2 focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all",
                        errors.name ? "border-destructive/50 focus:border-destructive" : "border-transparent focus:border-primary/20"
                      )}
                    />
                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                 </div>

                 <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase px-1 mb-2 block">Description</label>
                    <textarea 
                      value={newCharge.description}
                      onChange={(e) => setNewCharge({ ...newCharge, description: e.target.value })}
                      placeholder="Optional description"
                      rows={2}
                      className="w-full bg-secondary/50 border-2 border-transparent focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all resize-none"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-xs font-bold text-muted-foreground uppercase px-1 mb-2 block">Amount (₹) *</label>
                       <input 
                         type="number" 
                         value={newCharge.amount}
                         onChange={(e) => {
                           setNewCharge({ ...newCharge, amount: e.target.value })
                           if (errors.amount) setErrors({ ...errors, amount: '' })
                         }}
                         placeholder="0"
                         className={cn(
                           "w-full bg-secondary/50 border-2 focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all",
                           errors.amount ? "border-destructive/50 focus:border-destructive" : "border-transparent focus:border-primary/20"
                         )}
                       />
                       {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount}</p>}
                    </div>

                    <div>
                       <label className="text-xs font-bold text-muted-foreground uppercase px-1 mb-2 block">Frequency</label>
                       <select 
                         value={newCharge.frequency}
                         onChange={(e) => setNewCharge({ ...newCharge, frequency: e.target.value as any })}
                         className="w-full bg-secondary/50 border-2 border-transparent focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all"
                       >
                         <option value="monthly">Monthly</option>
                         <option value="quarterly">Quarterly</option>
                         <option value="annual">Annual</option>
                       </select>
                    </div>
                 </div>

                 <button 
                   onClick={handleAddCharge}
                   disabled={saving}
                   className="w-full flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {saving ? (
                     <>
                       <Loader className="w-4 h-4 animate-spin" />
                       Adding...
                     </>
                   ) : (
                     <>
                       <Plus className="w-4 h-4" />
                       Add Charge
                     </>
                   )}
                 </button>
              </div>
           </div>
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <h4 className="font-bold text-primary">Summary</h4>
              </div>
              <div className="space-y-3">
                <div className="bg-white/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Total Charges</p>
                  <p className="text-2xl font-bold text-foreground">{charges.length}</p>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Monthly Amount</p>
                  <p className="text-2xl font-bold text-primary">{formatINR(totalMonthly)}</p>
                </div>
              </div>
           </div>

           <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-blue-900">Info</p>
                  <p className="text-xs text-blue-800 mt-1">Configure these charges to automatically generate bills for all members</p>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
