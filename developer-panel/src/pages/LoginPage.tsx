import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../auth/AuthProvider'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { toast } from 'sonner'
import { Navigate } from 'react-router-dom'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})
type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const { login, state } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  if (state.status === 'authenticated') return <Navigate to="/" replace />

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values.email, values.password)
    } catch (err: any) {
      toast.error(err?.message || 'Login failed')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Superadmin Login</CardTitle>
          <CardDescription>Sign in to manage societies and view audit logs.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="admin@company.com" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" placeholder="••••••••" {...register('password')} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <Button className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
