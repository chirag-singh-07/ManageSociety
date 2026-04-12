import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listUsers, updateUser, deleteUser } from "../api/superadmin";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "../components/ui/dropdown-menu";
import { Loading } from "../components/ui/loading";
import { formatDate } from "../utils/date";
import { cn } from "../lib/cn";
import { 
  MoreHorizontal, 
  UserX, 
  ShieldCheck, 
  Mail, 
  Building2, 
  Search,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Ban,
  Trash2,
  Users
} from "lucide-react";
import { toast } from "sonner";

export function UsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 10;

  const usersQuery = useQuery({
    queryKey: ["users", page, search],
    queryFn: () => listUsers({ page, limit, search }),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: string; input: any }) => updateUser(vars.id, vars.input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated");
    },
    onError: (err: any) => toast.error(err?.message || "Update failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User removed permanently");
    },
    onError: (err: any) => toast.error(err?.message || "Delete failed"),
  });

  const users = usersQuery.data?.users || [];
  const pagination = usersQuery.data?.pagination || { total: 0, pages: 1 };

  const getUserTypeBadge = (type?: string) => {
    switch(type?.toLowerCase()) {
      case 'owner': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'tenant': return 'bg-amber-500/10 text-amber-600 border-amber-200';
      case 'staff': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'guard': return 'bg-red-500/10 text-red-600 border-red-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-foreground/90">Identity Manager</h1>
          <p className="text-muted-foreground font-medium">Oversee global user access and tenant-level permissions.</p>
        </div>
        
        <div className="flex bg-muted/50 p-1.5 rounded-2xl border border-border/40 backdrop-blur-sm">
           <div className="px-4 py-2 text-sm font-black text-primary border-r border-border/30 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total: {pagination.total}
           </div>
           <div className="px-4 py-2 text-sm font-bold text-muted-foreground flex items-center gap-2">
              Page {page} of {pagination.pages}
           </div>
        </div>
      </div>

      <Card className="border-none shadow-2xl bg-card/60 backdrop-blur-xl overflow-hidden rounded-3xl">
        <CardHeader className="bg-muted/30 border-b p-6">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/40" />
            <Input
              placeholder="Filter by name or email address..."
              className="pl-12 h-12 bg-background/50 border-none rounded-2xl shadow-inner font-medium text-lg"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset to first page on search
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {usersQuery.isLoading ? (
              <div className="py-24 flex justify-center"><Loading size="lg" text="Fetching global identity registry..." /></div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/10 border-b border-border/40">
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Identity</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Classification</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Affiliation</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Role / Status</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right pr-8">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {users.map((u) => (
                    <tr key={u._id} className="group hover:bg-primary/[0.03] transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12 rounded-2xl border-2 border-background shadow-lg">
                            <AvatarFallback className="bg-primary/10 text-primary font-black text-lg">
                              {u.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-0.5">
                            <div className="font-black text-foreground text-base leading-none">{u.name}</div>
                            <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                               <Mail className="w-3 h-3 pt-0.5" />
                               {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <Badge variant="outline" className={cn("px-3 py-1 font-black uppercase text-[10px] tracking-widest", getUserTypeBadge(u.userType))}>
                          {u.userType || 'Unassigned'}
                        </Badge>
                      </td>
                      <td className="p-6 text-center">
                        <div className="flex flex-col items-center gap-1">
                           <div className="px-3 py-1 bg-muted/40 rounded-lg text-xs font-bold flex items-center gap-1.5 ">
                              <Building2 className="w-3.5 h-3.5 text-primary" />
                              {(u.societyId as any)?.name || 'Central Admin'}
                           </div>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                           <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="px-2 py-0.5 text-[10px] font-black uppercase">
                              {u.role}
                           </Badge>
                           <span className={cn(
                             "text-[10px] font-black uppercase tracking-widest",
                             u.status === 'active' ? 'text-emerald-500' : u.status === 'blocked' ? 'text-red-500' : 'text-amber-500'
                           )}>
                             {u.status}
                           </span>
                        </div>
                      </td>
                      <td className="p-6 text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-background shadow-none">
                              <MoreHorizontal className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-60 p-2 rounded-2xl shadow-2xl border-primary/20 bg-card/95 backdrop-blur-md">
                            <DropdownMenuLabel className="text-[10px] uppercase font-black text-muted-foreground px-2 py-1.5">User Controls</DropdownMenuLabel>
                            <DropdownMenuSeparator className="mx-2" />
                            <DropdownMenuItem 
                              className="rounded-xl flex items-center gap-3 py-3"
                              onClick={() => updateMutation.mutate({ 
                                id: u._id, 
                                input: { status: u.status === 'active' ? 'blocked' : 'active' } 
                              })}
                            >
                              {u.status === 'active' ? <Ban className="w-4 h-4 text-amber-500" /> : <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                              {u.status === 'active' ? 'Revoke Access (Block)' : 'Restore Access'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="rounded-xl flex items-center gap-3 py-3"
                              onClick={() => updateMutation.mutate({ 
                                id: u._id, 
                                input: { role: u.role === 'admin' ? 'user' : 'admin' } 
                              })}
                            >
                               <UserCheck className="w-4 h-4 text-blue-500" />
                               {u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="mx-2" />
                            <DropdownMenuItem 
                              className="rounded-xl flex items-center gap-3 py-3 text-red-500 focus:bg-red-500/10 focus:text-red-500"
                              onClick={() => {
                                if (confirm(`Are you SURE you want to delete user ${u.name}?`)) {
                                  deleteMutation.mutate(u._id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                              Wipe Fingerprints
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
        {pagination.pages > 1 && (
          <div className="bg-muted/20 border-t p-4 flex items-center justify-center gap-4">
             <Button 
               variant="outline" 
               size="icon" 
               className="rounded-xl disabled:opacity-30"
               onClick={() => setPage(p => Math.max(1, p - 1))}
               disabled={page === 1}
             >
                <ChevronLeft className="w-5 h-5" />
             </Button>
             <div className="flex items-center gap-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <Button
                    key={p}
                    variant={page === p ? 'default' : 'ghost'}
                    size="sm"
                    className={cn("w-10 h-10 rounded-xl font-black", page === p ? "shadow-lg shadow-primary/20" : "")}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
             </div>
             <Button 
               variant="outline" 
               size="icon" 
               className="rounded-xl disabled:opacity-30"
               onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
               disabled={page === pagination.pages}
             >
                <ChevronRight className="w-5 h-5" />
             </Button>
          </div>
        )}
      </Card>
      
      {!usersQuery.isLoading && users.length === 0 && (
         <div className="py-32 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
               <UserX className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <p className="text-xl font-black text-muted-foreground/50">Zero matching identities</p>
         </div>
      )}
    </div>
  );
}
