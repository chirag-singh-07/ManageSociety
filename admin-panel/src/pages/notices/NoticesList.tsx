import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Plus,
  Calendar,
  Eye,
  Trash2,
  Edit2,
  Megaphone,
  CheckCircle2,
  Users,
  Loader,
} from "lucide-react";
import { getNotices, deleteNotice, type Notice } from "../../api/http";

export function NoticesList() {
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await getNotices();
      if (response.ok) {
        setNotices(response.notices || []);
      } else {
        toast.error("Failed to load notices");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load notices");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;

    try {
      setDeleting(id);
      await deleteNotice(id);
      setNotices(notices.filter((n) => n._id !== id));
      toast.success("Notice deleted successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete notice");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading notices...</p>
        </div>
      </div>
    );
  }

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
          onClick={() => navigate("/notices/create")}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Notice
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistics */}
        <div className="bg-primary p-6 rounded-2xl text-white shadow-lg shadow-primary/20 space-y-4 relative overflow-hidden">
          <Megaphone className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
          <p className="text-sm font-semibold opacity-80 uppercase tracking-widest">
            Published Notices
          </p>
          <h3 className="text-3xl font-bold">{notices.length}</h3>
          <p className="text-xs opacity-70 leading-relaxed">
            Total notices published to your society.
          </p>
        </div>

        <div className="lg:col-span-2 bg-secondary/50 border border-border rounded-2xl p-6 flex items-center justify-center border-dashed">
          <div className="text-center space-y-2">
            <Calendar className="w-8 h-8 text-primary/40 mx-auto" />
            <p className="font-bold text-sm">Latest Updates</p>
            <p className="text-xs text-muted-foreground">
              {notices.length > 0
                ? `Last updated ${new Date(notices[0]?.createdAt).toLocaleDateString()}`
                : "No notices published yet"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {notices.length === 0 ? (
          <div className="text-center py-12">
            <Megaphone className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-semibold">No notices published yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-6">
              Create your first notice to share updates with residents
            </p>
            <button
              onClick={() => navigate("/notices/create")}
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold"
            >
              <Plus className="w-4 h-4" />
              Create Notice
            </button>
          </div>
        ) : (
          notices.map((notice) => {
            const createdDate = new Date(notice.createdAt);
            return (
              <div
                key={notice._id}
                className="bg-white border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-foreground">
                        {notice.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {notice.body}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="w-4 h-4" />
                        Audience:{" "}
                        <span className="font-semibold text-foreground capitalize">
                          {notice.audience}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        Posted:{" "}
                        <span className="font-semibold text-foreground">
                          {createdDate.toLocaleDateString()}
                        </span>
                      </div>
                      {notice.createdBy && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span>By: {notice.createdBy.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                    <button
                      onClick={() => navigate(`/notices/${notice._id}/edit`)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-secondary text-primary px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                      disabled={deleting === notice._id}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(notice._id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-secondary text-destructive px-4 py-2 rounded-xl text-xs font-bold hover:bg-destructive hover:text-white transition-all disabled:opacity-50"
                      disabled={deleting === notice._id}
                    >
                      {deleting === notice._id ? (
                        <Loader className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
