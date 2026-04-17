import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";

const bills = [
  {
    id: "BILL-401",
    member: "Rahul Sharma",
    flat: "A-101",
    amount: "₹4,500",
    period: "Oct 2023",
    dueDate: "Oct 10, 2023",
    status: "paid",
  },
  {
    id: "BILL-402",
    member: "Priya Patel",
    flat: "B-202",
    amount: "₹3,800",
    period: "Oct 2023",
    dueDate: "Oct 10, 2023",
    status: "unpaid",
  },
  {
    id: "BILL-403",
    member: "Amit Verma",
    flat: "C-305",
    amount: "₹4,200",
    period: "Oct 2023",
    dueDate: "Oct 10, 2023",
    status: "overdue",
  },
  {
    id: "BILL-404",
    member: "Sneha Gupta",
    flat: "A-404",
    amount: "₹4,500",
    period: "Oct 2023",
    dueDate: "Oct 10, 2023",
    status: "paid",
  },
  {
    id: "BILL-405",
    member: "Vikram Singh",
    flat: "D-102",
    amount: "₹3,500",
    period: "Oct 2023",
    dueDate: "Oct 10, 2023",
    status: "paid",
  },
];

export function MaintenanceList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

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
          <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <Plus className="w-4 h-4" />
            Generate Bills
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-xs font-bold text-muted-foreground uppercase opacity-60">
            Total Collected
          </p>
          <h3 className="text-2xl font-bold text-success mt-2">₹12,45,000</h3>
          <p className="text-[10px] text-muted-foreground mt-1">
            This Month (85% target reached)
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-xs font-bold text-muted-foreground uppercase opacity-60">
            Pending Dues
          </p>
          <h3 className="text-2xl font-bold text-warning mt-2">₹2,10,000</h3>
          <p className="text-[10px] text-muted-foreground mt-1">
            From 45 Units
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-xs font-bold text-muted-foreground uppercase opacity-60">
            Overdue Amount
          </p>
          <h3 className="text-2xl font-bold text-destructive mt-2">₹85,000</h3>
          <p className="text-[10px] text-muted-foreground mt-1">
            Immediate action required
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by ID, name or flat..."
              className="w-full bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-secondary transition-all">
              <Filter className="w-4 h-4" />
              Filter Status
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/30">
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Bill ID & Month
                </th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Resident Info
                </th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Amount
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
              {bills.map((bill) => (
                <tr
                  key={bill.id}
                  className="hover:bg-secondary/20 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/maintenance/${bill.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">
                          {bill.id}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {bill.period}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-sm text-foreground">
                      {bill.member}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Building className="w-3 h-3" />
                      Flat {bill.flat}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-sm text-foreground">
                      {bill.amount}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Due: {bill.dueDate}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {bill.status === "paid" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-success/10 text-success">
                        <CheckCircle2 className="w-3 h-3" /> Paid
                      </span>
                    )}
                    {bill.status === "unpaid" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-warning/10 text-warning">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                    {bill.status === "overdue" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive">
                        <AlertCircle className="w-3 h-3" /> Overdue
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
                      <Download className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
