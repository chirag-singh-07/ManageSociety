import { useQuery } from '@tanstack/react-query'
import { listAuditLogs, listSocieties } from '../api/superadmin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import { formatDateTime } from '../utils/date'

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">System overview and recent activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Societies</CardTitle>
            <CardDescription>Total tenants onboarded</CardDescription>
          </CardHeader>
          <CardContent>
            {societiesQuery.isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-3xl font-semibold">{societies.length}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active</CardTitle>
            <CardDescription>Currently active societies</CardDescription>
          </CardHeader>
          <CardContent>
            {societiesQuery.isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-3xl font-semibold">{active}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Suspended</CardTitle>
            <CardDescription>Temporarily disabled</CardDescription>
          </CardHeader>
          <CardContent>
            {societiesQuery.isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-3xl font-semibold">{suspended}</div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Audit Events</CardTitle>
          <CardDescription>Latest global actions</CardDescription>
        </CardHeader>
        <CardContent>
          {auditQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : (
            <div className="space-y-3">
              {(auditQuery.data?.logs || []).slice(0, 5).map((log) => (
                <div key={log._id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <div className="font-medium">{log.action}</div>
                  <div className="text-muted-foreground">{formatDateTime(log.createdAt)}</div>
                </div>
              ))}
              {(auditQuery.data?.logs || []).length === 0 && (
                <div className="text-sm text-muted-foreground">No audit logs yet.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
