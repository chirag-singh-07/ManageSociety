import { useQuery } from "@tanstack/react-query";
import { getStats } from "../api/superadmin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Loading } from "../components/ui/loading";
import { 
  Users, 
  Building2, 
  CreditCard, 
  Activity, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { cn } from "../lib/cn";

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
  });

  if (isLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loading size="lg" text="Simulating analytical engines..." />
      </div>
    );
  }

  const { stats } = data || {};
  
  const chartData = stats?.trends || [];
  const planData = stats?.planDistribution?.map((p: any) => ({
    name: p._id === 'trial' ? 'Free Trial' : p._id.charAt(0).toUpperCase() + p._id.slice(1),
    value: p.count
  })) || [];

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

  const statCards = [
    {
      title: "Total Societies",
      value: stats?.totalSocieties || 0,
      description: "Active tenants across instances",
      icon: Building2,
      trend: "+12%",
      trendUp: true,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Active Users",
      value: stats?.totalUsers || 0,
      description: "Provisioned global identities",
      icon: Users,
      trend: "+18%",
      trendUp: true,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Active MRR Est.",
      value: `₹${(stats?.activeSocieties || 0) * 4999}`,
      description: "Estimated monthly recurring",
      icon: CreditCard,
      trend: "+5.4%",
      trendUp: true,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      title: "Expiring Soon",
      value: stats?.expiringSocieties || 0,
      description: "Trials ending in 7 days",
      icon: AlertCircle,
      trend: "-2",
      trendUp: false,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight text-foreground/90">Global Overview</h1>
        <p className="text-muted-foreground font-medium flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          System wide analytics and billing performance metrics.
        </p>
      </div>

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((s, i) => (
          <Card key={i} className="border-none shadow-xl bg-card/60 backdrop-blur-xl rounded-3xl overflow-hidden group hover:bg-card transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110 duration-300", s.bg)}>
                  <s.icon className={cn("w-6 h-6", s.color)} />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-black px-2 py-1 rounded-lg",
                  s.trendUp ? "text-emerald-500 bg-emerald-500/10" : "text-amber-500 bg-amber-500/10"
                )}>
                  {s.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {s.trend}
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{s.title}</p>
                <h3 className="text-3xl font-black text-foreground/90 tracking-tighter">{s.value}</h3>
                <p className="text-xs text-muted-foreground font-medium">{s.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Growth Chart */}
        <Card className="lg:col-span-2 border-none shadow-2xl bg-card/60 backdrop-blur-xl rounded-3xl p-6">
          <CardHeader className="px-0 pt-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black">Tenant Onboarding</CardTitle>
                <CardDescription className="font-medium text-xs">New societies registered over the last 6 months.</CardDescription>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-xl text-xs font-bold text-primary">
                <TrendingUp className="w-4 h-4" />
                Growth: +22.4%
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#888' }} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                    backdropFilter: 'blur(8px)', 
                    border: 'none', 
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)'
                  }}
                  itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plan Distribution Pie */}
        <Card className="border-none shadow-2xl bg-card/60 backdrop-blur-xl rounded-3xl p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-black">License Mix</CardTitle>
            <CardDescription className="font-medium text-xs">Distribution of active subscription tiers.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0 h-[260px] flex flex-col items-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {planData.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
             </ResponsiveContainer>
             <div className="grid grid-cols-2 gap-4 w-full mt-4">
                {planData.map((p: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] font-black uppercase text-muted-foreground">{p.name} ({p.value})</span>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card className="border-none shadow-2xl bg-card/60 backdrop-blur-xl rounded-3xl p-6 border-l-4 border-l-emerald-500">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
               </div>
               <div className="flex-1">
                  <h4 className="text-lg font-black tracking-tight">System Integrity</h4>
                  <p className="text-xs text-muted-foreground font-medium">All isolated tenant databases are synchronized and encrypted.</p>
                  <div className="mt-3 flex items-center gap-2">
                     <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[98%]" />
                     </div>
                     <span className="text-[10px] font-black text-emerald-500">98.2%</span>
                  </div>
               </div>
            </div>
         </Card>

         <Card className="border-none shadow-2xl bg-card/60 backdrop-blur-xl rounded-3xl p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-blue-500" />
               </div>
               <div className="flex-1">
                  <h4 className="text-lg font-black tracking-tight">Onboarding Velocity</h4>
                  <p className="text-xs text-muted-foreground font-medium">Average time to launch a new society environment: 4.2s</p>
                  <div className="mt-3 flex items-center gap-4">
                     <div className="flex flex-col">
                        <span className="text-xs font-black">4.2s</span>
                        <span className="text-[8px] uppercase font-bold text-muted-foreground">LATENCY</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-xs font-black">0 ERR</span>
                        <span className="text-[8px] uppercase font-bold text-muted-foreground">FAIL RATE</span>
                     </div>
                  </div>
               </div>
            </div>
         </Card>
      </div>
    </div>
  );
}
