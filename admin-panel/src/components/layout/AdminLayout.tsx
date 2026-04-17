import { useNavigate, Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import {
  BarChart3,
  Building2,
  Users,
  ClipboardList,
  Settings,
  Bell,
  LogOut,
  Search,
  IndianRupee,
  Megaphone,
} from "lucide-react";
import { cn } from "../../lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/members", label: "Members", icon: Users },
  { to: "/maintenance", label: "Maintenance", icon: IndianRupee },
  { to: "/complaints", label: "Complaints", icon: ClipboardList },
  { to: "/notices", label: "Notices", icon: Megaphone },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/login", { replace: true });
    }
  };
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-sans selection:bg-primary/20 selection:text-primary">
      {/* Sidebar */}
      <aside className="w-full md:w-72 border-r border-border bg-white shrink-0 flex flex-col transition-all z-20">
        <div className="flex h-20 items-center px-8 border-b border-border mb-4">
          <Link
            to="/"
            className="flex items-center gap-3 text-xl font-bold tracking-tight text-primary"
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Building2 className="w-6 h-6" />
            </div>
            <span>ManageSociety</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto w-full py-4 px-6 space-y-8">
          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 px-3">
              Main Menu
            </div>
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all group relative overflow-hidden",
                        isActive
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "text-muted-foreground hover:bg-secondary hover:text-primary",
                      )
                    }
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="pt-8 border-t border-border/50">
            <div className="p-4 rounded-2xl bg-secondary/50 border border-secondary">
              <p className="text-xs font-semibold text-primary/80 mb-2">
                Need help?
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                Check our documentation or contact support for assistance.
              </p>
              <button className="text-[11px] font-bold text-primary hover:underline">
                View Docs
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border mt-auto">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4.5 w-4.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 max-w-full overflow-hidden relative min-h-screen">
        <header className="flex h-20 items-center justify-between border-b border-border bg-white/80 backdrop-blur-xl px-8 sticky top-0 z-10">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-border mx-2"></div>
            <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none">John Doe</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Society Admin
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-primary">
                JD
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
