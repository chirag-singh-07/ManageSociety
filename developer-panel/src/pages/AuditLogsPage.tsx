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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">Global actions across all societies.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input placeholder="Filter by action..." value={filter} onChange={(e) => setFilter(e.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2">Action</th>
                  <th>Actor Role</th>
                  <th>Target</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log._id} className="border-b">
                    <td className="py-3 font-medium">{log.action}</td>
                    <td>{log.actorRole}</td>
                    <td>{log.targetType || '-'}</td>
                    <td>{formatDateTime(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">No audit logs found.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
