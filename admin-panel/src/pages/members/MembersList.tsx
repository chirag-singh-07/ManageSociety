import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MoreVertical,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

const members = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@example.com",
    phone: "+91 98765 43210",
    flat: "A-101",
    type: "Owner",
    status: "active",
  },
  {
    id: 2,
    name: "Priya Patel",
    email: "priya@example.com",
    phone: "+91 98765 43211",
    flat: "B-202",
    type: "Tenant",
    status: "active",
  },
  {
    id: 3,
    name: "Amit Verma",
    email: "amit@example.com",
    phone: "+91 98765 43212",
    flat: "C-305",
    type: "Owner",
    status: "pending",
  },
  {
    id: 4,
    name: "Sneha Gupta",
    email: "sneha@example.com",
    phone: "+91 98765 43213",
    flat: "A-404",
    type: "Owner",
    status: "blocked",
  },
  {
    id: 5,
    name: "Vikram Singh",
    email: "vikram@example.com",
    phone: "+91 98765 43214",
    flat: "D-102",
    type: "Tenant",
    status: "active",
  },
];

export function MembersList() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Society Members
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage residents, owners, and tenants of Green View Society.
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

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Filters Bar */}
        <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, flat, or email..."
              className="w-full bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-primary transition-all flex-1 md:flex-none">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-primary transition-all flex-1 md:flex-none">
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/30">
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Member Info
                </th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Flat & Type
                </th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Contact
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
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-secondary/20 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/members/${member.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">
                          {member.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          ID: #{member.id * 1234}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                      {member.flat}
                    </div>
                    <div className="text-[10px] text-muted-foreground ml-5">
                      {member.type}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" />
                      {member.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Phone className="w-3.5 h-3.5" />
                      {member.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {member.status === "active" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-success/10 text-success">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    )}
                    {member.status === "pending" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-warning/10 text-warning">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                    {member.status === "blocked" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive">
                        <XCircle className="w-3 h-3" />
                        Blocked
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); /* show menu */
                      }}
                      className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing 5 of 1,240 members
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled
              className="px-3 py-1.5 rounded-lg border border-border text-[10px] font-bold text-muted-foreground disabled:opacity-50"
            >
              Previous
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-border text-[10px] font-bold text-muted-foreground hover:bg-secondary">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
