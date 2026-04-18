import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { 
  ArrowLeft, 
  Send, 
  Search, 
  Bell, 
  Mail, 
  MessageSquare, 
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader,
  Building,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import {
  getMaintenanceBills,
  sendMaintenanceReminders,
  type MaintenanceBill,
} from '../../api/http'

export function MaintenanceReminders() {
  const navigate = useNavigate()
  const [bills, setBills] = useState<MaintenanceBill[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [enableChannels, setEnableChannels] = useState({
    inApp: true,
    sms: true,
    email: false,
  })

  useEffect(() => {
    fetchPendingBills()
  }, [])

  const fetchPendingBills = async () => {
    try {
      setLoading(true)
      // Get only unpaid and overdue bills
      const unpaidRes = await getMaintenanceBills('unpaid')
      const overdueRes = await getMaintenanceBills('overdue')
      const partialRes = await getMaintenanceBills('partial')

      const allBills = [
        ...(unpaidRes.bills || []),
        ...(overdueRes.bills || []),
        ...(partialRes.bills || []),
      ]

      // Remove duplicates
      const uniqueBills = Array.from(
        new Map(allBills.map((bill) => [bill._id, bill])).values()
      )

      setBills(uniqueBills)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load bills')
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((i) => i !== id))
    } else {
      setSelected([...selected, id])
    }
  }

  const toggleSelectAll = () => {
    if (selected.length === filteredBills.length) {
      setSelected([])
    } else {
      setSelected(filteredBills.map((b) => b._id))
    }
  }

  const handleSendReminders = async () => {
    if (selected.length === 0) {
      toast.error('Please select at least one member')
      return
    }

    try {
      setSending(true)
      const response = await sendMaintenanceReminders(selected)

      if (response.ok) {
        toast.success(`Reminders sent to ${response.count} member(s)!`)
        setSelected([])
        fetchPendingBills()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send reminders')
    } finally {
      setSending(false)
    }
  }

  const filteredBills = bills.filter((bill) =>
    searchTerm
      ? bill.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.period.includes(searchTerm)
      : true
  )

  const totalDues = selected.reduce((sum, billId) => {
    const bill = bills.find((b) => b._id === billId)
    return sum + (bill ? bill.totalAmount - bill.paidAmount : 0)
  }, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading pending bills...</p>
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Send Reminders</h1>
            <p className="text-muted-foreground mt-1">Notify members about their pending maintenance dues.</p>
          </div>
        </div>
        <button 
          onClick={handleSendReminders}
          disabled={selected.length === 0 || sending}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {sending ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send to {selected.length} Member{selected.length !== 1 ? 's' : ''}
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleSelectAll}
                  className="w-5 h-5 border-2 border-primary/20 rounded-md flex items-center justify-center transition-all bg-primary/5 hover:border-primary/50"
                >
                  {selected.length === filteredBills.length && filteredBills.length > 0 && (
                    <div className="w-2.5 h-2.5 bg-primary rounded-[2px]" />
                  )}
                </button>
                <span className="text-sm font-bold text-foreground">
                  Select All ({filteredBills.length})
                </span>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search by flat or period..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl pl-10 pr-4 py-2 text-xs transition-all"
                />
              </div>
            </div>
            
            {filteredBills.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-secondary/30">
                      <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Select</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Flat & Period</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Due</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredBills.map((bill) => {
                      const dueAmount = bill.totalAmount - bill.paidAmount
                      const statusColor = 
                        bill.status === 'overdue' 
                          ? { bg: 'bg-destructive/10', text: 'text-destructive' }
                          : bill.status === 'partial'
                          ? { bg: 'bg-blue-100', text: 'text-blue-600' }
                          : { bg: 'bg-warning/10', text: 'text-warning' }

                      return (
                        <tr key={bill._id} className={cn("hover:bg-secondary/20 transition-colors", selected.includes(bill._id) && "bg-primary/5")}>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => toggleSelect(bill._id)}
                              className={cn(
                                "w-5 h-5 border-2 rounded-md flex items-center justify-center transition-all",
                                selected.includes(bill._id) 
                                  ? "border-primary bg-primary text-white" 
                                  : "border-border bg-white"
                              )}
                            >
                              {selected.includes(bill._id) && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-primary">
                                <Building className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-bold text-sm text-foreground">Flat {bill.flatNumber}</p>
                                <p className="text-[10px] text-muted-foreground">{bill.period}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-sm text-destructive">₹{dueAmount}</p>
                            <p className="text-[10px] text-muted-foreground">Pending</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1",
                              statusColor.bg,
                              statusColor.text
                            )}>
                              {bill.status === 'overdue' && <AlertCircle className="w-3 h-3" />}
                              {bill.status === 'partial' && <Clock className="w-3 h-3" />}
                              {bill.status === 'unpaid' && <Clock className="w-3 h-3" />}
                              {bill.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <CheckCircle2 className="w-12 h-12 text-success/30 mb-3" />
                <p className="text-muted-foreground">No pending bills</p>
                <p className="text-xs text-muted-foreground mt-1">All members are up to date!</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
            <h4 className="font-bold border-b border-border pb-3">Notification Channels</h4>
            <div className="space-y-4">
              <div 
                onClick={() => setEnableChannels({ ...enableChannels, inApp: !enableChannels.inApp })}
                className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-transparent hover:border-primary/20 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold">In-App Alert</span>
                </div>
                <div className={cn("w-10 h-5 rounded-full p-1 flex transition-all", enableChannels.inApp ? "bg-primary justify-end" : "bg-border justify-start")}>
                  <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                </div>
              </div>

              <div 
                onClick={() => setEnableChannels({ ...enableChannels, sms: !enableChannels.sms })}
                className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-transparent hover:border-primary/20 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold">SMS / WhatsApp</span>
                </div>
                <div className={cn("w-10 h-5 rounded-full p-1 flex transition-all", enableChannels.sms ? "bg-primary justify-end" : "bg-border justify-start")}>
                  <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                </div>
              </div>

              <div 
                onClick={() => setEnableChannels({ ...enableChannels, email: !enableChannels.email })}
                className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-transparent hover:border-primary/20 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold">Email</span>
                </div>
                <div className={cn("w-10 h-5 rounded-full p-1 flex transition-all", enableChannels.email ? "bg-primary justify-end" : "bg-border justify-start")}>
                  <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </div>
          </div>

          {selected.length > 0 && (
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase">Summary</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Members</span>
                    <span className="font-bold text-lg text-foreground">{selected.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Due</span>
                    <span className="font-bold text-lg text-primary">₹{totalDues}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-blue-900">Info</p>
                <p className="text-xs text-blue-800 mt-1">
                  Reminders will be sent via all enabled channels to alert members about their pending dues.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
