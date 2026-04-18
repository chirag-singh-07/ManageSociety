import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Search,
  UserPlus,
  Phone,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Loader,
  Trash2,
} from "lucide-react";
import { useAppDialog } from "../../components/dialog/AppDialogProvider";
import { getMembers, updateMemberStatus, deleteMember, type User } from "../../api/http";

export function MembersList() {
  const [members, setMembers] = useState<User[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { confirm } = useAppDialog();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await getMembers();
      if (response.ok) {
        setMembers(response.users);
        applyFilters(response.users, searchTerm, statusFilter);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (
    membersToFilter: User[],
    search: string,
    status: string
  ) => {
    let filtered = membersToFilter;

    if (search.trim()) {
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.email.toLowerCase().includes(search.toLowerCase()) ||
          (m.phone && m.phone.includes(search))
      );
    }

    if (status !== "all") {
      filtered = filtered.filter((m) => m.status === status);
    }

    setFilteredMembers(filtered);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    applyFilters(members, term, statusFilter);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    applyFilters(members, searchTerm, status);
  };

  const handleUpdateStatus = async (
    memberId: string,
    newStatus: "active" | "blocked" | "pending"
  ) => {
    try {
      setUpdatingId(memberId);
      await updateMemberStatus(memberId, newStatus);
      
      // Update local state
      setMembers((prev) =>
        prev.map((m) => (m._id === memberId ? { ...m, status: newStatus } : m))
      );
      applyFilters(members, searchTerm, statusFilter);
      
      const statusLabel = newStatus === "active" ? "approved" : newStatus;
      toast.success(`Member ${statusLabel} successfully`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update member"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteMember = async (memberId: string, memberName: string) => {
    const approved = await confirm({
      title: "Delete Member",
      description: `Are you sure you want to delete "${memberName}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      destructive: true,
    });
    if (!approved) return;

    try {
      setDeleting(true);
      await deleteMember(memberId);
      
      // Remove from local state
      setMembers((prev) => prev.filter((m) => m._id !== memberId));
      applyFilters(members, searchTerm, statusFilter);
      
      toast.success("Member deleted successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete member");
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success";
      case "pending":
        return "bg-warning/10 text-warning";
      case "blocked":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-secondary text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="w-3 h-3" />;
      case "pending":
        return <Clock className="w-3 h-3" />;
      case "blocked":
        return <XCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Society Members
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and approve residents and members.
            </p>
          </div>
          <button
            onClick={() => navigate("/members/create")}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <UserPlus className="w-5 h-5" />
            Add Member
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
              <p className="text-muted-foreground">Loading members...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            {/* Filters Bar */}
            <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name, email or phone..."
                  className="w-full bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-primary transition-all">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-primary transition-all bg-white cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {filteredMembers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No members found</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-secondary/30">
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Member Info
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredMembers.map((member) => {
                      const initials = member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase();
                      return (
                        <tr
                          key={member._id}
                          className="hover:bg-secondary/20 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                {initials}
                              </div>
                              <div>
                                <p className="font-bold text-sm text-foreground">
                                  {member.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {member.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {member.phone && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Phone className="w-3.5 h-3.5" />
                                {member.phone}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-foreground capitalize">
                              {member.userType || "Resident"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(
                                member.status
                              )}`}
                            >
                              {getStatusIcon(member.status)}
                              {member.status.charAt(0).toUpperCase() +
                                member.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center gap-2 justify-end">
                              {member.status === "pending" && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleUpdateStatus(member._id, "active")
                                    }
                                    disabled={updatingId === member._id}
                                    className="px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-bold hover:bg-success/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                  >
                                    {updatingId === member._id ? (
                                      <Loader className="w-3 h-3 animate-spin" />
                                    ) : (
                                      "Approve"
                                    )}
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleUpdateStatus(member._id, "blocked")
                                    }
                                    disabled={updatingId === member._id}
                                    className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-bold hover:bg-destructive/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {member.status === "active" && (
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(member._id, "blocked")
                                  }
                                  disabled={updatingId === member._id}
                                  className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-bold hover:bg-destructive/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                  Block
                                </button>
                              )}
                              {member.status === "blocked" && (
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(member._id, "active")
                                  }
                                  disabled={updatingId === member._id}
                                  className="px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-bold hover:bg-success/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                  Unblock
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteMember(member._id, member.name)}
                                disabled={deleting}
                                className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

