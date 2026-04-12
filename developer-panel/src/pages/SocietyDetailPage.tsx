import { useEffect, useMemo, useState } from 'react'
import { cn } from '../lib/cn'
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
import { Loading } from '../components/ui/loading'
import { CreditCard, History, Package, Zap } from 'lucide-react'
import { Input } from '../components/ui/input'
import { subscribeSociety } from '../api/superadmin'

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
    mutationFn: (input: { 
      status?: 'active' | 'suspended'; 
      settings?: Record<string, unknown>; 
      trialEndsAt?: string 
    }) => updateSociety(id || '', input),
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

  const subscribeMutation = useMutation({
    mutationFn: (input: { plan: string; months: number }) => subscribeSociety(id || '', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['societies'] })
      toast.success('Subscription updated successfully')
    },
    onError: (err: any) => toast.error(err?.message || 'Subscription failed'),
  })

  const [subForm, setSubForm] = useState({ plan: 'premium', months: 12 })

  if (societiesQuery.isLoading) {
    return <Loading variant="card" size="md" text="Loading society details..." className="mt-8" />
  }

  if (!society) {
    return <div className="text-sm text-muted-foreground">Society not found.</div>
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-primary/80"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
             {society.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-mono bg-muted/30 inline-flex items-center px-2 py-1 rounded-md">ID: {society._id}</p>
        </div>
        <Badge variant={society.status === 'active' ? 'default' : 'danger'} className="text-sm px-3 py-1 shadow-sm mt-2 sm:mt-0 uppercase tracking-wider font-semibold">
           {society.status}
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-[600px] grid-cols-3 mb-4 p-1 bg-muted/30">
          <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Overview</TabsTrigger>
          <TabsTrigger value="subscription" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Subscription</TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Settings JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card className="shadow-sm border-muted/50 overflow-hidden">
            <CardHeader className="bg-muted/10 border-b pb-4">
              <CardTitle className="text-lg">Tenant Overview</CardTitle>
              <CardDescription>Basic information, billing plan, and active status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plan</p>
                    <p className="text-base font-medium capitalize">{society.plan || 'Trial'}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trial Ends</p>
                    <p className="text-base font-medium">{formatDate(society.trialEndsAt)}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created At</p>
                    <p className="text-base font-medium">{formatDateTime(society.createdAt)}</p>
                 </div>
              </div>
              
              <div className="border-t pt-6 flex gap-4">
                <Button
                  variant={society.status === 'active' ? 'outline' : 'default'}
                  className={society.status === 'active' ? 'hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30' : ''}
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

        <TabsContent value="subscription" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trial Management Card */}
            <Card className="shadow-lg border-primary/20 bg-card/60 backdrop-blur-md overflow-hidden">
              <CardHeader className="bg-primary/5 border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <History className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">Trial Days</CardTitle>
                    <CardDescription className="text-xs">Extend free access period</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  {[7, 14, 30].map(days => (
                    <Button 
                      key={days} 
                      variant="outline" 
                      onClick={() => {
                        const currentBase = (society.trialEndsAt && new Date(society.trialEndsAt) > new Date()) 
                          ? new Date(society.trialEndsAt) 
                          : new Date();
                        const newDate = new Date(currentBase);
                        newDate.setDate(newDate.getDate() + days);
                        updateMutation.mutate({ trialEndsAt: newDate.toISOString() })
                      }}
                      disabled={updateMutation.isPending}
                      className="h-16 flex flex-col gap-1 border-primary/20 hover:bg-primary/5 hover:border-primary/40 group"
                    >
                      <span className="text-lg font-black text-primary group-hover:scale-110 transition-transform">+{days}</span>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Days</span>
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
                  <Package className="w-5 h-5 text-muted-foreground" />
                  <div className="text-[11px] leading-snug">
                    <p className="font-bold text-foreground/80">Soft Extension Mode</p>
                    <p className="text-muted-foreground">Maintains current plan while extending the evaluation window.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Paid Subscription Card */}
            <Card className="shadow-lg border-emerald-500/20 bg-card/60 backdrop-blur-md overflow-hidden">
              <CardHeader className="bg-emerald-500/5 border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Zap className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">Paid License</CardTitle>
                    <CardDescription className="text-xs">Activate commercial status</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex p-1 bg-muted/80 rounded-xl border border-border/60">
                    {['basic', 'premium', 'enterprise'].map(p => (
                      <button
                        key={p}
                        className={cn(
                          "flex-1 py-2 text-[11px] uppercase font-black rounded-lg transition-all",
                          subForm.plan === p ? "bg-emerald-500 text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => setSubForm({ ...subForm, plan: p })}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Input 
                        type="number" 
                        min="1" 
                        value={subForm.months} 
                        onChange={(e) => setSubForm({ ...subForm, months: parseInt(e.target.value) || 1 })}
                        className="pl-10 font-bold h-12 bg-background/50 rounded-xl"
                      />
                      <CreditCard className="absolute left-3.5 top-3.5 w-5 h-5 text-muted-foreground/50" />
                    </div>
                    <Button 
                      className="h-12 px-8 font-black bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 shrink-0 uppercase tracking-tight"
                      onClick={() => subscribeMutation.mutate(subForm)}
                      disabled={subscribeMutation.isPending}
                    >
                      {subscribeMutation.isPending ? 'Working' : 'Activate'}
                    </Button>
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   New expiry will be calculated from current end date.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card className="shadow-sm border-muted/50">
            <CardHeader className="bg-muted/10 border-b pb-4">
              <CardTitle className="text-lg">JSON Settings</CardTitle>
              <CardDescription>Manage custom feature flags and configurations for this tenant.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <Textarea
                className="font-mono text-sm min-h-[300px] bg-muted/30 focus-visible:ring-primary/50"
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='{"features": { "water": true }}'
              />
              <div className="flex justify-end">
                 <Button onClick={onSaveSettings} disabled={updateMutation.isPending} className="px-8 shadow-sm">
                   {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
                 </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
