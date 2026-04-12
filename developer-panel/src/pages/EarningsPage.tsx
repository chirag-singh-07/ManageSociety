import { useQuery } from "@tanstack/react-query";
import { getEarnings } from "../api/superadmin";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Loading } from "../components/ui/loading";
import { Badge } from "../components/ui/badge";
import { 
  IndianRupee, 
  TrendingUp, 
  History, 
  PieChart as PieChartIcon, 
  Download,
  Building2,
  Calendar,
  CheckCircle2
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { formatDate } from "../utils/date";
import { cn } from "../lib/cn";
import { Button } from "../components/ui/button";

export function EarningsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["earnings"],
    queryFn: getEarnings,
  });

  if (isLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loading size="lg" text="Compiling financial intelligence..." />
      </div>
    );
  }

  const { transactions, summary } = data || { transactions: [], summary: { totalRevenue: 0, byPlan: [] } };
  
  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];
  const pieData = summary.byPlan.map((p: any) => ({
    name: p._id.toUpperCase(),
    value: p.revenue
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-foreground/90">Revenue Hub</h1>
          <p className="text-muted-foreground font-medium">Detailed breakdown of subscription lifecycle and payments.</p>
        </div>
        <Button variant="outline" className="h-12 px-6 rounded-2xl font-black gap-2 shadow-sm">
           <Download className="w-5 h-5" />
           Export Ledger (CSV)
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-2xl bg-primary text-primary-foreground rounded-3xl overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-500">
              <IndianRupee className="w-24 h-24" />
           </div>
           <CardContent className="p-8 space-y-4">
              <p className="text-xs font-black uppercase tracking-widest opacity-70">Gross Revenue (LTO)</p>
              <h2 className="text-5xl font-black tracking-tight italic">₹{summary.totalRevenue.toLocaleString()}</h2>
              <div className="flex items-center gap-2 text-sm font-bold bg-white/10 w-fit px-3 py-1 rounded-full">
                 <TrendingUp className="w-4 h-4" />
                 +12.5% increase
              </div>
           </CardContent>
        </Card>

        <Card className="border-none shadow-2xl bg-card/60 backdrop-blur-xl rounded-3xl p-6">
           <CardHeader className="px-0 pt-0">
              <CardTitle className="text-sm font-black uppercase text-muted-foreground flex items-center gap-2">
                 <PieChartIcon className="w-4 h-4" />
                 Revenue by Plan
              </CardTitle>
           </CardHeader>
           <CardContent className="p-0 h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={pieData}>
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                       {pieData.map((_entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </CardContent>
        </Card>

        <Card className="border-none shadow-2xl bg-card/60 backdrop-blur-xl rounded-3xl p-6">
           <CardHeader className="px-0 pt-0">
              <CardTitle className="text-sm font-black uppercase text-muted-foreground flex items-center gap-2">
                 <History className="w-4 h-4" />
                 Recent Volume
              </CardTitle>
           </CardHeader>
           <CardContent>
              <div className="space-y-1">
                 <div className="text-3xl font-black">{summary.totalTransactions}</div>
                 <p className="text-xs text-muted-foreground font-bold">Successfully processed renewals</p>
              </div>
           </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="lg:col-span-3 border-none shadow-2xl bg-card/60 backdrop-blur-xl rounded-3xl overflow-hidden">
           <CardHeader className="bg-muted/30 border-b p-6">
              <CardTitle className="text-lg font-black italic">Transaction Ledger</CardTitle>
           </CardHeader>
           <CardContent className="p-0">
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-muted/10 border-b border-border/40">
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entity</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Plan</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Amount</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right pr-8">Date</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                       {transactions.map((t: any) => (
                          <tr key={t._id} className="group hover:bg-primary/[0.03] transition-colors">
                             <td className="p-6">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                      <Building2 className="w-4 h-4 text-muted-foreground" />
                                   </div>
                                   <div className="font-bold text-sm">{(t.societyId as any)?.name || 'Deleted Society'}</div>
                                </div>
                             </td>
                             <td className="p-6 text-center">
                                <Badge variant="outline" className={cn(
                                   "px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter",
                                   t.plan === 'premium' ? 'border-emerald-500/50 text-emerald-600 bg-emerald-500/5' : ''
                                )}>
                                   {t.plan} ({t.months}M)
                                </Badge>
                             </td>
                             <td className="p-6 text-center">
                                <div className="flex items-center justify-center gap-1 font-black text-foreground">
                                   <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                   ₹{t.amount.toLocaleString()}
                                </div>
                             </td>
                             <td className="p-6 text-right pr-8">
                                <div className="flex flex-col items-end">
                                   <div className="text-xs font-bold text-foreground">{formatDate(t.createdAt)}</div>
                                   <div className="text-[9px] uppercase font-black text-muted-foreground">TXID: {t._id.slice(-6)}</div>
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </CardContent>
        </Card>

        <div className="space-y-6">
           <Card className="border-none shadow-2xl bg-card/60 backdrop-blur-xl rounded-3xl p-6">
              <CardTitle className="text-xs font-black uppercase text-muted-foreground mb-4">Pricing Meta</CardTitle>
              <div className="space-y-4">
                 {[
                   { label: 'Basic', price: '₹999/mo' },
                   { label: 'Premium', price: '₹2,499/mo' },
                   { label: 'Enterprise', price: '₹4,999/mo' }
                 ].map((p, i) => (
                   <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-background/50 border border-border/40">
                      <span className="text-xs font-bold">{p.label}</span>
                      <span className="text-xs font-black text-primary">{p.price}</span>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="border-none shadow-2xl bg-[#0f172a] text-slate-400 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2">Next Milestone</h4>
              <p className="text-white font-black text-lg leading-tight mb-4 tracking-tighter self-start italic">Target ₹1,00,000 Next Quarter</p>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 w-[45%]" />
              </div>
              <div className="flex justify-between mt-2 text-[8px] font-black uppercase">
                 <span>45% Progress</span>
                 <span>₹45,000 Reach</span>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
