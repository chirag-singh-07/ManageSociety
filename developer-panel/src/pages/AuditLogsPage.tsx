import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listAuditLogs } from '../api/superadmin'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { formatDateTime } from '../utils/date'

export function AuditLogsPage() {
  const [filter, setFilter] = useState('')
  const auditQuery = useQuery({
    queryKey: ['audit-logs'],
    queryFn: listAuditLogs,
  })

  const logs = auditQuery.data?.logs || []
  const filtered = useMemo(() => {
    if (!filter) return logs
    const f = filter.toLowerCase()
    return logs.filter((l) => l.action.toLowerCase().includes(f))
  }, [logs, filter])

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">Review global actions and system audibility across all societies.</p>
      </div>

      <Card className="shadow-sm overflow-hidden border-muted/50">
        <CardHeader className="bg-muted/10 border-b pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
            System Event Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 border-b bg-muted/5">
            <div className="relative w-full max-w-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <Input
                className="pl-9 bg-background/50"
                placeholder="Filter by action name..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm caption-bottom">
              <thead className="[&_tr]:border-b bg-muted/20">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Action Event</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actor Role</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Target</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0 bg-background/50">
                {filtered.map((log) => (
                  <tr key={log._id} className="border-b transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle font-medium text-primary">{log.action}</td>
                    <td className="p-4 align-middle">
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">{log.targetType || '-'}</td>
                    <td className="p-4 align-middle text-right text-muted-foreground">{formatDateTime(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-muted-foreground/30 mb-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                <div className="text-lg font-medium">No audit logs found</div>
                <div className="text-sm text-muted-foreground mt-1">Events will appear here as they occur.</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
