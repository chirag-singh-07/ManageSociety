import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  ChevronRight,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Tag,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import { getComplaints, type Complaint } from "../../api/http";

export function ComplaintsList() {
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, [activeTab]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const status = activeTab === "all" ? undefined : activeTab;
      const data = await getComplaints(status);
      setComplaints(data.complaints || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load complaints");
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Complaints Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Review and resolve issues raised by society members.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-12">
        <div className="flex bg-secondary p-1 rounded-xl w-fit">
          {["all", "open", "in_progress", "resolved"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-lg transition-all capitalize",
                activeTab === tab
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Loading complaints...</p>
          </div>
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-secondary/30 p-12 rounded-2xl border border-border text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto" />
          <p className="text-sm font-semibold text-foreground">No complaints found</p>
          <p className="text-xs text-muted-foreground">No complaints in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {complaints.map((item) => (
            <div
              key={item._id}
              onClick={() => navigate(`/complaints/${item._id}`)}
              className="bg-white p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer"
            >
              <div className="flex gap-4 flex-1">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                    item.priority === "critical"
                      ? "bg-destructive/10 text-destructive"
                      : item.priority === "high"
                        ? "bg-warning/10 text-warning"
                        : "bg-primary/10 text-primary",
                  )}
                >
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground">
                      #{item._id?.toString().slice(-4).toUpperCase()}
                    </span>
                    <h3 className="font-bold text-foreground text-lg">
                      {item.title}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {item.memberId?.toString() || "Unknown"} (Flat: {item.flatNumber || "N/A"})
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      {item.category}
                    </div>
                    <div className="flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0">
                {item.priority === "critical" && (
                  <span className="px-2 py-1 rounded-lg bg-destructive text-white text-[10px] font-bold uppercase tracking-wider shadow-sm shadow-destructive/20 animate-pulse">
                    Critical
                  </span>
                )}
                {item.status === "open" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-secondary text-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    Open
                  </span>
                )}
                {item.status === "in_progress" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-warning/10 text-warning">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Reviewing
                  </span>
                )}
                {item.status === "resolved" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-success/10 text-success">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resolved
                  </span>
                )}

                <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary text-primary hover:bg-primary hover:text-white transition-all">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-primary/5 p-8 rounded-2xl border border-primary/10 flex flex-col items-center text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-primary/60" />
        <p className="text-sm font-bold text-primary">
          Need urgent resolution?
        </p>
        <p className="text-xs text-muted-foreground max-w-sm">
          Escalate critical issues directly to the society chairman or legal
          advisor through the escalation panel.
        </p>
        <button className="text-xs font-bold text-primary underline">
          Open Escalation Panel
        </button>
      </div>
    </div>
  );
}
