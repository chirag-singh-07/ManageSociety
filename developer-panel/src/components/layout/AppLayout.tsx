import { Link, NavLink, Outlet } from 'react-router-dom'
import { Building2, ClipboardList, LayoutDashboard, LogOut } from 'lucide-react'
import { useAuth } from '../../auth/AuthProvider'
import { Button } from '../ui/button'
import { cn } from '../../lib/cn'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/societies', label: 'Societies', icon: Building2 },
  { to: '/audit', label: 'Audit Logs', icon: ClipboardList },
]

export function AppLayout() {
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="grid min-h-screen grid-cols-[260px_1fr]">
        <aside className="border-r bg-background">
          <div className="flex h-16 items-center px-6">
            <Link to="/" className="text-lg font-semibold">
              ManageSociety
            </Link>
          </div>
          <nav className="px-4 pb-6">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground',
                      isActive && 'bg-muted text-foreground',
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </aside>

        <div className="flex flex-col">
          <header className="flex h-16 items-center justify-between border-b bg-background px-6">
            <div className="text-sm text-muted-foreground">Superadmin Console</div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

