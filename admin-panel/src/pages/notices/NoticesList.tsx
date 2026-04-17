import { useNavigate } from "react-router-dom";
import {
  Plus,
  Calendar,
  Eye,
  Trash2,
  Edit2,
  Megaphone,
  CheckCircle2,
  Users,
} from "lucide-react";

const notices = [
  {
    id: 1,
    title: "Water Supply Maintenance",
    content:
      "Scheduled maintenance for water tanks will occur tomorrow between 2 PM and 5 PM. Please store sufficient water.",
    audience: "All Blocks",
    date: "Oct 24, 2023",
    views: 450,
    active: true,
  },
  {
    id: 2,
    title: "New Security Guidelines",
    content:
      "All guests must register at the gate from Nov 1st onwards. This is for the safety of all residents.",
    audience: "All Residents",
    date: "Oct 22, 2023",
    views: 890,
    active: true,
  },
  {
    id: 3,
    title: "Diwali Celebration",
    content:
      "Join us for society-wide Diwali celebrations on Saturday evening at the community hall.",
    audience: "All Families",
    date: "Oct 20, 2023",
    views: 620,
    active: false,
  },
];

export function NoticesList() {
  const navigate = useNavigate();
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Society Notices
          </h1>
          <p className="text-muted-foreground mt-1">
            Make announcements and share important updates with residents.
          </p>
        </div>
        <button 
          onClick={() => navigate('/notices/create')}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Notice
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistics or Quick Info */}
        <div className="bg-primary p-6 rounded-2xl text-white shadow-lg shadow-primary/20 space-y-4 relative overflow-hidden">
          <Megaphone className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
          <p className="text-sm font-semibold opacity-80 uppercase tracking-widest">
            Visibility Stat
          </p>
          <h3 className="text-3xl font-bold">1.2k+ Views</h3>
          <p className="text-xs opacity-70 leading-relaxed">
            Your notices reached 92% of the society residents in the last 7
            days.
          </p>
          <button className="text-xs font-bold border border-white/30 bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-all">
            Detailed Analytics
          </button>
        </div>

        <div className="lg:col-span-2 bg-secondary/50 border border-border rounded-2xl p-6 flex items-center justify-center border-dashed">
          <div className="text-center space-y-2">
            <Calendar className="w-8 h-8 text-primary/40 mx-auto" />
            <p className="font-bold text-sm">Schedule Notices</p>
            <p className="text-xs text-muted-foreground">
              Plan your announcements ahead of time.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className="bg-white border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex flex-col md:flex-row gap-6">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-foreground">
                    {notice.title}
                  </h3>
                  {notice.active ? (
                    <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Live
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold">
                      Expired
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {notice.content}
                </p>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="w-4 h-4" />
                    Audience:{" "}
                    <span className="font-semibold text-foreground">
                      {notice.audience}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Posted on:{" "}
                    <span className="font-semibold text-foreground">
                      {notice.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    Views:{" "}
                    <span className="font-semibold text-foreground">
                      {notice.views}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 justify-center">
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-secondary text-primary px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all">
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-secondary text-destructive px-4 py-2 rounded-xl text-xs font-bold hover:bg-destructive hover:text-white transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
