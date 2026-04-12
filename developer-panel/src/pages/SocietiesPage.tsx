import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSociety, listSocieties, updateSociety } from '../api/superadmin'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { formatDate } from '../utils/date'

const createSchema = z.object({
  name: z.string().min(2),
  trialDays: z.coerce.number().int().min(0).max(365).default(14),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
})
type CreateValues = z.infer<typeof createSchema>

export function SocietiesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'suspended'>('all')

  const societiesQuery = useQuery({
    queryKey: ['societies'],
    queryFn: listSocieties,
  })

  const createMutation = useMutation({
    mutationFn: createSociety,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['societies'] })
      toast.success('Society created')
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to create'),
  })

  const statusMutation = useMutation({
    mutationFn: (input: { id: string; status: 'active' | 'suspended' }) =>
      updateSociety(input.id, { status: input.status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['societies'] }),
    onError: (err: any) => toast.error(err?.message || 'Failed to update status'),
  })

  const societies = societiesQuery.data?.societies || []

  const filtered = useMemo(() => {
    return societies.filter((s) => {
      const matchText = s.name.toLowerCase().includes(search.toLowerCase())
      const matchStatus = status === 'all' ? true : s.status === status
      return matchText && matchStatus
    })
  }, [societies, search, status])

  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { trialDays: 14 },
  })

  const onSubmit = async (values: CreateValues) => {
    await createMutation.mutateAsync(values)
    form.reset({ name: '', trialDays: 14 })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Societies</h1>
          <p className="text-sm text-muted-foreground">Manage all tenant societies.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Create Society</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Society</DialogTitle>
              <DialogDescription>Add a new society tenant with trial period.</DialogDescription>
            </DialogHeader>
            <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
              <Input placeholder="Society name" {...form.register('name')} />
              <Input type="number" placeholder="Trial days" {...form.register('trialDays', { valueAsNumber: true })} />
              <Input placeholder="Address (optional)" {...form.register('address')} />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="City" {...form.register('city')} />
                <Input placeholder="State" {...form.register('state')} />
              </div>
              <Input placeholder="Pincode" {...form.register('pincode')} />
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Societies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <Input className="md:max-w-sm" placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="flex gap-2">
              <Button variant={status === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setStatus('all')}>
                All
              </Button>
              <Button variant={status === 'active' ? 'default' : 'outline'} size="sm" onClick={() => setStatus('active')}>
                Active
              </Button>
              <Button variant={status === 'suspended' ? 'default' : 'outline'} size="sm" onClick={() => setStatus('suspended')}>
                Suspended
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2">Name</th>
                  <th>Status</th>
                  <th>Trial Ends</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s._id} className="border-b">
                    <td className="py-3 font-medium">
                      <Link className="hover:underline" to={`/societies/${s._id}`}>
                        {s.name}
                      </Link>
                    </td>
                    <td>
                      <Badge variant={s.status === 'active' ? 'success' : 'warning'}>{s.status}</Badge>
                    </td>
                    <td>{formatDate(s.trialEndsAt)}</td>
                    <td>{formatDate(s.createdAt)}</td>
                    <td className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          statusMutation.mutate({ id: s._id, status: s.status === 'active' ? 'suspended' : 'active' })
                        }
                      >
                        {s.status === 'active' ? 'Suspend' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">No societies found.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
