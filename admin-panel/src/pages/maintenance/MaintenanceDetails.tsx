import { useNavigate, useParams } from 'react-router-dom'
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText
} from 'lucide-react'
import { cn } from '../../lib/utils'

export function MaintenanceDetails() {
  const navigate = useNavigate()
  const { id } = useParams()

  const bill = {
    id: id || 'BILL-401',
    member: 'Rahul Sharma',
    flat: 'A-101',
    period: 'October 2023',
    generatedDate: 'Oct 01, 2023',
    dueDate: 'Oct 10, 2023',
    status: 'paid',
    items: [
      { label: 'General Maintenance', amount: '₹2,500' },
      { label: 'Water Charges', amount: '₹800' },
      { label: 'Security & CCTV', amount: '₹500' },
      { label: 'Sinking Fund', amount: '₹700' },
    ],
    total: '₹4,500',
    paidVia: 'UPI (PhonePe)',
    paidOn: 'Oct 08, 2023'
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
               <h1 className="text-3xl font-bold tracking-tight text-foreground">{bill.id}</h1>
               <span className={cn(
                 "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                 bill.status === 'paid' ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
               )}>
                  {bill.status}
               </span>
            </div>
            <p className="text-muted-foreground mt-1">Maintenance Bill for {bill.period}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button className="bg-secondary text-primary px-5 py-2.5 rounded-xl font-bold hover:bg-primary hover:text-white transition-all">
              <Printer className="w-4 h-4" />
           </button>
           <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] transition-all">
              <Download className="w-4 h-4" />
              Download Invoice
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
               <div className="p-8 border-b border-border bg-secondary/20 flex justify-between items-start">
                  <div>
                     <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Payer Details</p>
                     <h3 className="text-xl font-bold mt-1">{bill.member}</h3>
                     <p className="text-sm text-muted-foreground mt-0.5">Flat {bill.flat} • Green View Society</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Bill Summary</p>
                     <h2 className="text-3xl font-bold text-primary mt-1">{bill.total}</h2>
                  </div>
               </div>
               
               <div className="p-8">
                  <h4 className="font-bold text-sm text-muted-foreground uppercase mb-4 tracking-wider">Breakdown</h4>
                  <div className="space-y-4">
                     {bill.items.map((item, idx) => (
                       <div key={idx} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                          <span className="text-sm font-medium text-foreground">{item.label}</span>
                          <span className="text-sm font-bold text-foreground">{item.amount}</span>
                       </div>
                     ))}
                     <div className="flex justify-between items-center pt-6 text-lg">
                        <span className="font-bold text-foreground">Grand Total</span>
                        <span className="font-extra-bold text-primary">{bill.total}</span>
                     </div>
                  </div>
               </div>

               {bill.status === 'paid' && (
                 <div className="p-8 bg-success/5 border-t border-success/10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center">
                       <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-success">Payment Received</p>
                       <p className="text-xs text-muted-foreground mt-0.5">Received on {bill.paidOn} via {bill.paidVia}</p>
                    </div>
                 </div>
               )}
            </div>
         </div>

         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
               <h4 className="font-bold border-b border-border pb-3">Bill Information</h4>
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-xs text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4" /> Generated</span>
                     <span className="text-xs font-bold text-foreground">{bill.generatedDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-xs text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> Due Date</span>
                     <span className="text-xs font-bold text-foreground">{bill.dueDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-xs text-muted-foreground flex items-center gap-2"><FileText className="w-4 h-4" /> Bill Type</span>
                     <span className="text-xs font-bold text-foreground">Monthly Recurring</span>
                  </div>
               </div>
            </div>

            <div className="bg-primary/5 border border-primary/10 p-6 rounded-2xl space-y-4 shadow-sm">
               <div className="flex items-center gap-2 font-bold text-primary">
                  <CreditCard className="w-5 h-5" />
                  Auto-Debit Status
               </div>
               <p className="text-xs text-muted-foreground leading-relaxed">
                  The resident has enabled auto-debit via NACH for their quarterly maintenance. Payments are processed on the 5th of every month.
               </p>
            </div>
         </div>
      </div>
    </div>
  )
}
