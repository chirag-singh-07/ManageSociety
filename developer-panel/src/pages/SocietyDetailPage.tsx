import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listSocieties, updateSociety } from '../api/superadmin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { toast } from 'sonner'
import { formatDate, formatDateTime } from '../utils/date'

export function SocietyDetailPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [jsonText, setJsonText] = useState('{\n  \n}')

  const societiesQuery = useQuery({
    queryKey: ['societies'],
    queryFn: listSocieties,
  })

  const society = useMemo(() => societiesQuery.data?.societies.find((s) => s._id === id), [societiesQuery.data, id])

  useEffect(() => {
    if (!society?.settings) return
    try {
      setJsonText(JSON.stringify(society.settings, null, 2))
    } catch {
      // ignore
    }
  }, [society?._id])

  const updateMutation = useMutation({
    mutationFn: (input: { status?: 'active' | 'suspended'; settings?: Record<string, unknown> }) =>
      updateSociety(id || '', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['societies'] })
      toast.success('Society updated')
    },
    onError: (err: any) => toast.error(err?.message || 'Update failed'),
  })

  const onSaveSettings = () => {
    try {
      const parsed = JSON.parse(jsonText || '{}')
      updateMutation.mutate({ settings: parsed })
    } catch {
      toast.error('Invalid JSON')
    }
  }

  if (societiesQuery.isLoading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>
  }

  if (!society) {
    return <div className="text-sm text-muted-foreground">Society not found.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{society.name}</h1>
          <p className="text-sm text-muted-foreground">Society ID: {society._id}</p>
        </div>
        <Badge variant={society.status === 'active' ? 'success' : 'warning'}>{society.status}</Badge>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Basic tenant information and status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">Plan: {society.plan || 'trial'}</div>
              <div className="text-sm">Trial Ends: {formatDate(society.trialEndsAt)}</div>
              <div className="text-sm">Created: {formatDateTime(society.createdAt)}</div>
              <div>
                <Button
                  variant="outline"
                  onClick={() =>
                    updateMutation.mutate({ status: society.status === 'active' ? 'suspended' : 'active' })
                  }
                >
                  {society.status === 'active' ? 'Suspend Society' : 'Activate Society'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Store JSON configuration for this society.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='{"complaintCategories":["Water","Lift"]}'
              />
              <Button onClick={onSaveSettings} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
