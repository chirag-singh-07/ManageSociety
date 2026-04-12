import { Link, NavLink, Outlet } from 'react-router-dom'
import { Building2, ClipboardList, LayoutDashboard, LogOut, Settings, Users, Sparkles, IndianRupee } from 'lucide-react'
import { useAuth } from '../../auth/AuthProvider'
import { Button } from '../ui/button'
import { cn } from '../../lib/cn'
import { ThemeToggle } from '../ThemeToggle'

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/earnings', label: 'Earnings', icon: IndianRupee },
  { to: '/societies', label: 'Societies', icon: Building2 },
  { to: '/user-factory', label: 'User Factory', icon: Sparkles },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/audit', label: 'Audit Logs', icon: ClipboardList },
]

export function AppLayout() {
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row selection:bg-primary/20 selection:text-primary">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-border/40 bg-card/50 backdrop-blur-md flex-shrink-0 flex flex-col transition-all">
        <div className="flex h-16 items-center px-6 border-b border-border/40 overflow-hidden">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            <Settings className="w-6 h-6 text-primary" />
            ManageSociety
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto w-full py-6 px-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
             Superadmin
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group relative overflow-hidden',
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                       {isActive && <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />}
                       <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-primary" : "group-hover:text-foreground")} />
                       {item.label}
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 max-w-full overflow-hidden relative">
        <header className="flex h-16 items-center justify-between border-b border-border/40 bg-card/40 backdrop-blur-md px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
             <div className="text-sm font-medium text-muted-foreground">Admin Console v1.0</div>
          </div>
          <div className="flex items-center gap-3">
             <ThemeToggle />
             <Button variant="outline" size="sm" onClick={logout} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-border/50">
               <LogOut className="h-4 w-4 mr-2" />
               Logout
             </Button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-background to-muted/20">
          <div className="mx-auto max-w-6xl">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}


