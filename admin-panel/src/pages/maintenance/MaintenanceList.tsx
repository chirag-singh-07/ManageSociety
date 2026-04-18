import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Search,
  Filter,
  Download,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Building,
  Bell,
  Settings,
  Loader,
  Calendar,
  CreditCard,
  Trash2,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAppDialog } from "../../components/dialog/AppDialogProvider";
import {
  getMaintenanceBills,
  generateMaintenanceBills,
  recordMaintenancePayment,
  deleteMaintenanceBill,
  type MaintenanceBill,
} from "../../api/http";

const statusColors = {
  paid: { bg: "bg-success/10", text: "text-success", icon: CheckCircle2 },
  unpaid: { bg: "bg-warning/10", text: "text-warning", icon: Clock },
  partial: { bg: "bg-blue-100", text: "text-blue-600", icon: Clock },
  overdue: { bg: "bg-destructive/10", text: "text-destructive", icon: AlertCircle },
};

export function MaintenanceList() {
  const navigate = useNavigate();
  const { confirm } = useAppDialog();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [bills, setBills] = useState<MaintenanceBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [generateData, setGenerateData] = useState({
    period: new Date().toISOString().slice(0, 7),
    dueDate: "",
  });

  useEffect(() => {
    fetchBills();
  }, [filterStatus]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await getMaintenanceBills(
        filterStatus !== "all" ? filterStatus : undefined
      );
      if (response.ok) {
        setBills(response.bills || []);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBills = async () => {
    if (!generateData.period || !generateData.dueDate) {
      toast.error("Please select period and due date");
      return;
    }

    try {
      setGenerating(true);
      const response = await generateMaintenanceBills({
        period: generateData.period,
        dueDate: generateData.dueDate,
      });

      if (response.ok) {
        toast.success(`Generated ${response.count || 0} bills successfully!`);
        setShowGenerateModal(false);
        fetchBills();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate bills");
    } finally {
      setGenerating(false);
    }
  };

  const handleRecordPayment = async (billId: string, amount: number) => {
    try {
      const response = await recordMaintenancePayment(billId, {
        amount,
        method: "Bank Transfer",
      });

      if (response.ok) {
        toast.success("Payment recorded successfully!");
        fetchBills();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to record payment");
    }
  };

  const handleDeleteBill = async (billId: string, billInfo: string) => {
    const approved = await confirm({
      title: "Delete Maintenance Bill",
      description: `Are you sure you want to delete "${billInfo}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      destructive: true,
    });
    if (!approved) return;

    try {
      setDeleting(true);
      await deleteMaintenanceBill(billId);
      setBills((prev) => prev.filter((b) => b._id !== billId));
      toast.success("Bill deleted successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete bill");
    } finally {
      setDeleting(false);
    }
  };

  const filteredBills = bills.filter((bill) =>
    searchTerm
      ? bill.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.period.includes(searchTerm)
      : true
  );

  const summary = {
    total: bills.reduce((sum, b) => sum + b.totalAmount, 0),
    collected: bills.reduce((sum, b) => sum + b.paidAmount, 0),
    pending: bills.filter((b) => b.status !== "paid").length,
    overdue: bills.filter((b) => b.status === "overdue").length,
  };

  const StatusIcon =
    statusColors[bills[0]?.status as keyof typeof statusColors]?.icon || Clock;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Maintenance Bills
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate and track monthly maintenance payments for all units.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate("/maintenance/setup")}
            className="flex items-center gap-2 bg-white border border-border text-foreground px-5 py-2.5 rounded-xl font-bold hover:bg-secondary transition-all shadow-sm"
          >
            <Settings className="w-4 h-4" />
            Configure Charges
          </button>
          <button
            onClick={() => navigate("/maintenance/reminders")}
            className="flex items-center gap-2 bg-secondary text-primary px-5 py-2.5 rounded-xl font-bold hover:bg-primary hover:text-white transition-all shadow-sm"
          >
            <Bell className="w-4 h-4" />
            Send Reminders
          </button>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            Generate Bills
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-xs font-bold text-muted-foreground uppercase opacity-60">
            Total Billing
          </p>
          <h3 className="text-2xl font-bold text-primary mt-2">₹{summary.total.toLocaleString()}</h3>
          <p className="text-[10px] text-muted-foreground mt-1">
            All pending & paid
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-xs font-bold text-muted-foreground uppercase opacity-60">
            Collected
          </p>
          <h3 className="text-2xl font-bold text-success mt-2">₹{summary.collected.toLocaleString()}</h3>
          <p className="text-[10px] text-muted-foreground mt-1">
            {Math.round((summary.collected / summary.total) * 100 || 0)}% collected
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-xs font-bold text-muted-foreground uppercase opacity-60">
            Pending
          </p>
          <h3 className="text-2xl font-bold text-warning mt-2">{summary.pending}</h3>
          <p className="text-[10px] text-muted-foreground mt-1">
            Units pending payment
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-xs font-bold text-muted-foreground uppercase opacity-60">
            Overdue
          </p>
          <h3 className="text-2xl font-bold text-destructive mt-2">{summary.overdue}</h3>
          <p className="text-[10px] text-muted-foreground mt-1">
            Past due date
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by flat number or period..."
              className="w-full bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground bg-white hover:bg-secondary transition-all cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <Loader className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Loading bills...</p>
            </div>
          </div>
        ) : filteredBills.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-secondary/30">
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Flat & Period
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Paid
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredBills.map((bill) => {
                  const StatusIconComponent =
                    statusColors[bill.status as keyof typeof statusColors]?.icon ||
                    Clock;
                  const statusColor =
                    statusColors[bill.status as keyof typeof statusColors] ||
                    statusColors.unpaid;

                  return (
                    <tr
                      key={bill._id}
                      className="hover:bg-secondary/20 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                            <Building className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-foreground">
                              Flat {bill.flatNumber}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {bill.period}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm text-foreground">
                          ₹{bill.totalAmount}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm text-success">
                          ₹{bill.paidAmount}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold",
                            statusColor.bg,
                            statusColor.text
                          )}
                        >
                          <StatusIconComponent className="w-3 h-3" />
                          {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(bill.dueDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => {
                              const remaining = bill.totalAmount - bill.paidAmount;
                              if (remaining > 0) {
                                handleRecordPayment(bill._id, remaining);
                              }
                            }}
                            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-primary"
                          >
                            <CreditCard className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteBill(bill._id, `Flat ${bill.flatNumber} - ${bill.period}`)
                            }
                            disabled={deleting}
                            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FileText className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No bills found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Generate bills to get started
            </p>
          </div>
        )}
      </div>

      {/* Generate Bills Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full space-y-6">
            <h3 className="text-2xl font-bold">Generate Bills</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase px-1 mb-2 block">
                  Billing Period *
                </label>
                <input
                  type="month"
                  value={generateData.period}
                  onChange={(e) =>
                    setGenerateData({ ...generateData, period: e.target.value })
                  }
                  className="w-full bg-secondary/50 border-2 border-transparent focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase px-1 mb-2 block">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={generateData.dueDate}
                  onChange={(e) =>
                    setGenerateData({ ...generateData, dueDate: e.target.value })
                  }
                  className="w-full bg-secondary/50 border-2 border-transparent focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-border text-foreground font-bold hover:bg-secondary transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateBills}
                disabled={generating}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
