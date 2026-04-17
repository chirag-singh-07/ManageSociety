import {
  Users,
  IndianRupee,
  ClipboardCheck,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Clock,
  ShieldAlert,
  Zap,
  Calendar as CalendarIcon,
  ChevronRight,
  CloudSun,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "../../lib/utils";

const stats = [
  {
    label: "Total Occupancy",
    value: "942",
    change: "+2.4%",
    subValue: "from 1,000 units",
    icon: Users,
    trend: "up",
    color: "text-primary bg-primary/10",
  },
  {
    label: "Revenue (MTD)",
    value: "₹8.2L",
    change: "+14%",
    subValue: "₹7.2L last month",
    icon: IndianRupee,
    trend: "up",
    color: "text-success bg-success/10",
  },
  {
    label: "Open Complaints",
    value: "12",
    change: "-4",
    subValue: "8 resolved today",
    icon: ClipboardCheck,
    trend: "down",
    color: "text-warning bg-warning/10",
  },
  {
    label: "Security Alerts",
    value: "0",
    change: "0",
    subValue: "All systems normal",
    icon: ShieldAlert,
    trend: "neutral",
    color: "text-destructive bg-destructive/10",
  },
];

const recentActivities = [
  {
    id: 1,
    user: "Rahul Sharma",
    action: "Paid maintenance for A-101",
    time: "12 mins ago",
    type: "payment",
    avatar: "RS",
  },
  {
    id: 2,
    user: "Staff Entry",
    action: "Housekeeping checked in at Gate 2",
    time: "25 mins ago",
    type: "security",
    avatar: "HK",
  },
  {
    id: 3,
    user: "System",
    action: "New Notice: Water Supply update sent",
    time: "1 hour ago",
    type: "notice",
    avatar: "MS",
  },
  {
    id: 4,
    user: "Amit Verma",
    action: "Raised a plumbing complaint",
    time: "2 hours ago",
    type: "complaint",
    avatar: "AV",
  },
];

const upcomingEvents = [
  {
    id: 1,
    title: "Annual General Meeting",
    date: "Oct 30, 2023",
    time: "5:00 PM",
    location: "Clubhouse",
  },
  {
    id: 2,
    title: "Diwali Decor Planning",
    date: "Nov 02, 2023",
    time: "4:30 PM",
    location: "Garden Area",
  },
];

export function DashboardPage() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Dynamic Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest opacity-80">
            <CloudSun className="w-4 h-4" />
            Good morning, Administrator
          </div>
          <h1 className="text-4xl font-extra-bold tracking-tight text-foreground">
            Green View <span className="text-primary italic">Residency</span>
          </h1>
          <p className="text-muted-foreground">
            Systems are optimal. You have 12 pending approvals for today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-white border border-border px-4 py-2.5 rounded-2xl shadow-sm italic text-xs font-semibold text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Live Updates Enabled
          </div>
          <button className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all group">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            Post Quick Update
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
                  {stat.trend === "down" && (
                    <span className="flex items-center text-destructive text-[10px] font-bold px-2 py-1 rounded-full bg-destructive/10">
                      <ArrowDownRight className="w-3 h-3 mr-0.5" />
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
                Live Activity
              </h3>
              <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                Full Log <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="p-2 space-y-1">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-4 rounded-3xl hover:bg-secondary/50 transition-all group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
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
                        activity.type === "payment"
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
              <button className="w-full py-3 bg-white border border-border rounded-2xl text-xs font-bold text-muted-foreground hover:text-primary hover:border-primary transition-all shadow-sm">
                Load More Activity
              </button>
            </div>
          </div>

          {/* Emergency Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-6 rounded-[2rem] bg-destructive text-white shadow-xl shadow-destructive/20 group hover:scale-[1.02] transition-all">
              <ShieldAlert className="w-8 h-8 mb-3 opacity-80 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-sm">Security Alert</h4>
              <p className="text-[10px] opacity-70 mt-1 uppercase tracking-wider">
                Broadcast to Guard
              </p>
            </button>
            <button className="p-6 rounded-[2rem] bg-success text-white shadow-xl shadow-success/20 group hover:scale-[1.02] transition-all">
              <Clock className="w-8 h-8 mb-3 opacity-80 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-sm">Automate Bills</h4>
              <p className="text-[10px] opacity-70 mt-1 uppercase tracking-wider">
                Process Batch Now
              </p>
            </button>
            <button className="p-6 rounded-[2rem] bg-foreground text-white shadow-xl shadow-foreground/20 group hover:scale-[1.02] transition-all">
              <MoreHorizontal className="w-8 h-8 mb-3 opacity-80 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-sm">More Tools</h4>
              <p className="text-[10px] opacity-70 mt-1 uppercase tracking-wider">
                Utility Panel
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
              Timeline
            </h3>
            <div className="space-y-6">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="relative pl-6 border-l-2 border-primary/20 hover:border-primary transition-colors py-1 group cursor-pointer"
                >
                  <div className="absolute -left-[9px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-primary transition-all group-hover:scale-125" />
                  <p className="text-xs font-bold text-muted-foreground opacity-60">
                    {event.date}
                  </p>
                  <h4 className="font-bold text-foreground text-sm mt-1">
                    {event.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-2 text-[10px] font-semibold text-primary">
                    <Clock className="w-3 h-3" />
                    {event.time} • {event.location}
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full py-3 bg-primary/5 text-primary rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
              Create Event
            </button>
          </div>

          {/* Security Monitor Widget Mockup */}
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
            <h3 className="text-lg font-bold">Gate Surveillance</h3>
            <p className="text-xs text-white/60 mt-2 leading-relaxed">
              4 Gates active. Zero unauthorized entries detected in the last 24
              hours.
            </p>
            <div className="mt-8 flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden"
                >
                  <div
                    className="h-full bg-primary w-full animate-shimmer"
                    style={{ animationDelay: `${i * 200}ms` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
