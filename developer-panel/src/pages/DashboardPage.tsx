import { useQuery } from '@tanstack/react-query'
import { listAuditLogs, listSocieties } from '../api/superadmin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import { formatDateTime } from '../utils/date'
import { Building2, Activity, AlertCircle, ShieldAlert, TrendingUp, Users } from 'lucide-react'

export function DashboardPage() {
  const societiesQuery = useQuery({
    queryKey: ['societies'],
    queryFn: listSocieties,
  })
  const auditQuery = useQuery({
    queryKey: ['audit-logs'],
    queryFn: listAuditLogs,
  })

  const societies = societiesQuery.data?.societies || []
  const active = societies.filter((s) => s.status === 'active').length
  const suspended = societies.filter((s) => s.status === 'suspended').length

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground/90">Dashboard Overview</h1>
        <p className="text-muted-foreground font-medium text-sm">Monitor system metrics and recent activities across all societies.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-all border-l-4 border-l-primary bg-card/60 backdrop-blur-md dark:bg-card/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 shadow-none border-none">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Total Societies</CardTitle>
            </div>
            <div className="p-2.5 bg-primary/15 rounded-xl">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {societiesQuery.isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-4xl font-bold tracking-tighter">{societies.length}</div>}
            <div className="flex items-center text-xs text-muted-foreground mt-2 font-medium">
               <TrendingUp className="w-3 h-3 mr-1 text-emerald-500" />
               <span className="text-emerald-500 font-semibold mr-1">+100%</span> since last month
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all border-l-4 border-l-emerald-500 bg-card/60 backdrop-blur-md dark:bg-card/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 shadow-none border-none">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Active Tenants</CardTitle>
            </div>
            <div className="p-2.5 bg-emerald-500/15 rounded-xl">
              <Activity className="w-5 h-5 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            {societiesQuery.isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-4xl font-bold tracking-tighter">{active}</div>}
            <div className="flex items-center text-xs text-muted-foreground mt-2 font-medium">
               <span>Currently operational</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all border-l-4 border-l-destructive bg-card/60 backdrop-blur-md dark:bg-card/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 shadow-none border-none">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Suspended</CardTitle>
            </div>
            <div className="p-2.5 bg-destructive/15 rounded-xl">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            {societiesQuery.isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-4xl font-bold tracking-tighter">{suspended}</div>}
            <div className="flex items-center text-xs text-muted-foreground mt-2 font-medium">
               <span>Temporarily disabled</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all border-l-4 border-l-amber-500 bg-card/60 backdrop-blur-md dark:bg-card/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 shadow-none border-none">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Total Users</CardTitle>
            </div>
            <div className="p-2.5 bg-amber-500/15 rounded-xl">
              <Users className="w-5 h-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            {societiesQuery.isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-4xl font-bold tracking-tighter">--</div>}
            <div className="flex items-center text-xs text-muted-foreground mt-2 font-medium">
               <span>Across all societies</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden shadow-lg border-border/60 bg-card/50 backdrop-blur-sm">
        <CardHeader className="bg-muted/20 border-b border-border/50 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
               <ShieldAlert className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Recent Audit Events</CardTitle>
              <CardDescription className="text-sm mt-1">Latest global actions triggered by administrators</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {auditQuery.isLoading ? (
            <div className="space-y-4 p-6">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {(auditQuery.data?.logs || []).slice(0, 6).map((log) => (
                <div key={log._id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/40 transition-colors group">
                  <div className="flex flex-col gap-1.5">
                     <span className="font-semibold text-sm text-foreground/90 group-hover:text-primary transition-colors">{log.action}</span>
                     <span className="text-xs text-muted-foreground font-mono bg-muted/50 w-fit px-2 py-0.5 rounded-md">Actor: {log.actorId}</span>
                  </div>
                  <div className="text-xs px-3 py-1.5 bg-secondary/80 rounded-md font-medium shadow-sm">
                     {formatDateTime(log.createdAt)}
                  </div>
                </div>
              ))}
              {(auditQuery.data?.logs || []).length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                  <div className="p-4 bg-muted/30 rounded-full">
                     <ShieldAlert className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">No audit logs recorded yet.</div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
