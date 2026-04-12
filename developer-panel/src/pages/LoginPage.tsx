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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/50 to-primary/5 p-6 animate-in fade-in duration-700">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[100px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <Card className="w-full max-w-md border-border/50 shadow-2xl bg-card/60 backdrop-blur-xl">
        <CardHeader className="space-y-2 pb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2 mx-auto">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <CardTitle className="text-2xl font-bold text-center tracking-tight">Superadmin Login</CardTitle>
          <CardDescription className="text-center text-muted-foreground/80">
            Sign in to manage societies and view system audit logs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Email Address</Label>
              <div className="relative">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                 <Input className="pl-9 bg-background/50 focus-visible:ring-primary/50 transition-shadow" type="email" placeholder="admin@company.com" {...register('email')} />
              </div>
              {errors.email && <p className="text-xs text-destructive font-medium mt-1">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                 <Label className="text-sm font-medium">Password</Label>
              </div>
              <div className="relative">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                 <Input className="pl-9 bg-background/50 focus-visible:ring-primary/50 transition-shadow" type="password" placeholder="••••••••" {...register('password')} />
              </div>
              {errors.password && <p className="text-xs text-destructive font-medium mt-1">{errors.password.message}</p>}
            </div>
            <Button className="w-full h-11 text-base font-semibold shadow-md active:scale-[0.98] transition-all" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
