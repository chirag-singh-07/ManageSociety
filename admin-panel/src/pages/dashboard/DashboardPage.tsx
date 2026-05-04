import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Users,
  ClipboardCheck,
  ArrowUpRight,
  Plus,
  ShieldAlert,
  Zap,
  Calendar as CalendarIcon,
  ChevronRight,
  CloudSun,
  AlertCircle,
  Loader,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { getDashboard, type DashboardData } from "../../api/http";
import { decodeJwt, getAccessToken } from "../../auth/session";

const recentActivities = [
  {
    id: 1,
    user: "System",
    action: "All systems operational",
    time: "Now",
    type: "notice",
    avatar: "SYS",
  },
  {
    id: 2,
    user: "Admin",
    action: "Last backup completed successfully",
    time: "2 hours ago",
    type: "security",
    avatar: "BCK",
  },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [userName, setUserName] = useState("Administrator");

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      const decoded = decodeJwt(token);
      if (decoded?.name) {
        setUserName(String(decoded.name));
      }
    }
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await getDashboard();
      setDashboardData(data);
    } catch (err) {
      toast.error("Failed to load dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Members",
      value: dashboardData?.totalMembers || 0,
      change: "+12%",
      subValue: `${dashboardData?.activeMembers || 0} active`,
      icon: Users,
      trend: "up",
      color: "text-primary bg-primary/10",
    },
    {
      label: "Pending Approvals",
      value: dashboardData?.pendingMembers || 0,
      change: "Action needed",
      subValue: `${dashboardData?.blockedMembers || 0} blocked`,
      icon: AlertCircle,
      trend: "neutral",
      color: "text-warning bg-warning/10",
    },
    {
      label: "Open Complaints",
      value: dashboardData?.openComplaints || 0,
      change: `${dashboardData?.pendingComplaints || 0} pending`,
      subValue: `${dashboardData?.resolvedComplaints || 0} resolved`,
      icon: ClipboardCheck,
      trend: "down",
      color: "text-warning bg-warning/10",
    },
    {
      label: "Notices Published",
      value: dashboardData?.noticesCount || 0,
      change: "All active",
      subValue: `${dashboardData?.invCodesActive || 0} invite codes`,
      icon: Zap,
      trend: "up",
      color: "text-success bg-success/10",
    },
  ];
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Dynamic Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest opacity-80">
            <CloudSun className="w-4 h-4" />
            Good morning, {userName}
          </div>
          <h1 className="text-4xl font-extra-bold tracking-tight text-foreground">
            Dashboard <span className="text-primary italic">Overview</span>
          </h1>
          <p className="text-muted-foreground">
            {dashboardData?.pendingMembers || 0} members awaiting approval.
            {dashboardData?.openComplaints || 0} complaints active.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/members/create')}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            Add Member
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white p-6 rounded-[2rem] border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group"
            >
              <div className="flex items-center justify-between mb-6">
                <div
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                    stat.color,
                  )}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <div className="text-right">
                  {stat.trend === "up" && (
                    <span className="flex items-center text-success text-[10px] font-bold px-2 py-1 rounded-full bg-success/10">
                      <ArrowUpRight className="w-3 h-3 mr-0.5" />
                      {stat.change}
                    </span>
                  )}
                  {stat.trend !== "up" && (
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {stat.change}
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-muted-foreground opacity-60 uppercase tracking-wider">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl font-extra-bold text-foreground">
                    {stat.value}
                  </h2>
                </div>
                <p className="text-[10px] font-semibold text-muted-foreground/50">
                  {stat.subValue}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Activity Feed */}
          <div className="bg-white rounded-[2rem] border border-border shadow-sm overflow-hidden flex flex-col">
            <div className="p-8 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-xl flex items-center gap-2">
                <Zap className="w-5 h-5 text-warning fill-warning" />
                System Status
              </h3>
              <button 
                onClick={fetchDashboard}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                Refresh <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="p-2 space-y-1">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-4 rounded-3xl hover:bg-secondary/50 transition-all group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm text-xs">
                    {activity.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">
                      {activity.user}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {activity.action}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-semibold text-muted-foreground">
                      {activity.time}
                    </p>
                    <div
                      className={cn(
                        "mt-1 w-2 h-2 rounded-full ml-auto",
                        activity.type === "notice"
                          ? "bg-success"
                          : activity.type === "complaint"
                            ? "bg-warning"
                            : "bg-primary",
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-secondary/20 mt-auto">
              <button 
                onClick={() => navigate('/complaints')}
                className="w-full py-3 bg-white border border-border rounded-2xl text-xs font-bold text-muted-foreground hover:text-primary hover:border-primary transition-all shadow-sm"
              >
                View All Complaints
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => navigate('/members')}
              className="p-6 rounded-[2rem] bg-primary text-white shadow-xl shadow-primary/20 group hover:scale-[1.02] transition-all"
            >
              <Users className="w-8 h-8 mb-3 opacity-80 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-sm">Members</h4>
              <p className="text-[10px] opacity-70 mt-1 uppercase tracking-wider">
                Manage All
              </p>
            </button>
            <button 
              onClick={() => navigate('/complaints')}
              className="p-6 rounded-[2rem] bg-warning text-white shadow-xl shadow-warning/20 group hover:scale-[1.02] transition-all"
            >
              <ClipboardCheck className="w-8 h-8 mb-3 opacity-80 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-sm">Complaints</h4>
              <p className="text-[10px] opacity-70 mt-1 uppercase tracking-wider">
                {dashboardData?.openComplaints || 0} Open
              </p>
            </button>
            <button 
              onClick={() => navigate('/notices')}
              className="p-6 rounded-[2rem] bg-success text-white shadow-xl shadow-success/20 group hover:scale-[1.02] transition-all"
            >
              <Zap className="w-8 h-8 mb-3 opacity-80 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-sm">Notices</h4>
              <p className="text-[10px] opacity-70 mt-1 uppercase tracking-wider">
                Post New
              </p>
            </button>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          {/* Upcoming Events */}
          <div className="bg-white rounded-[2rem] border border-border p-8 shadow-sm space-y-6">
            <h3 className="font-bold text-xl flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="text-xs font-bold text-muted-foreground">Active Members</p>
                <p className="text-2xl font-bold text-primary mt-1">{dashboardData?.activeMembers || 0}</p>
              </div>
              <div className="p-4 bg-warning/5 rounded-lg">
                <p className="text-xs font-bold text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning mt-1">{dashboardData?.pendingMembers || 0}</p>
              </div>
              <div className="p-4 bg-destructive/5 rounded-lg">
                <p className="text-xs font-bold text-muted-foreground">Blocked</p>
                <p className="text-2xl font-bold text-destructive mt-1">{dashboardData?.blockedMembers || 0}</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/settings')}
              className="w-full py-3 bg-primary/5 text-primary rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
            >
              View Settings
            </button>
          </div>

          {/* System Status */}
          <div className="bg-foreground rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] group-hover:bg-primary/40 transition-all" />
            <div className="flex items-center justify-between mb-8">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-primary" />
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-success/20 text-success flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                SECURE
              </span>
            </div>
            <h3 className="text-lg font-bold">System Status</h3>
            <p className="text-xs text-white/60 mt-2 leading-relaxed">
              All systems operational. Database connected and synced.
            </p>
            <div className="mt-8 space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span>Database Health</span>
                <span className="text-success font-bold">100%</span>
              </div>
              <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-success w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
