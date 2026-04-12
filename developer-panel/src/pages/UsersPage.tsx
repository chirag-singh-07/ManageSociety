import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listUsers, createUser, updateUser, listSocieties } from "../api/superadmin";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { formatDate } from "../utils/date";
import { Loading } from "../components/ui/loading";
import { UserPlus, Search, UserCheck, Shield, User as UserIcon } from "lucide-react";
import { cn } from "../lib/cn";

const createUserSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  societyId: z.string().min(1, "Please select a society"),
  role: z.enum(["user", "admin"]),
  phone: z.string().optional(),
});

type CreateUserValues = z.infer<typeof createUserSchema>;

export function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: listUsers,
  });

  const societiesQuery = useQuery({
    queryKey: ["societies"],
    queryFn: listSocieties,
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to create user"),
  });

  const statusMutation = useMutation({
    mutationFn: (input: { id: string; status: "active" | "blocked" }) =>
      updateUser(input.id, { status: input.status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
    onError: (err: any) => toast.error(err?.message || "Failed to update status"),
  });

  const users = usersQuery.data?.users || [];
  const societies = societiesQuery.data?.societies || [];

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchText = 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "all" ? true : u.role === roleFilter;
      return matchText && matchRole;
    });
  }, [users, search, roleFilter]);

  const form = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: "user",
    },
  });

  const onSubmit = async (values: CreateUserValues) => {
    await createMutation.mutateAsync(values);
    form.reset({ name: "", email: "", password: "", phone: "" });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground/90">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage global users and administrators across all societies.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="shadow-md bg-primary hover:bg-primary/90">
              <UserPlus className="w-4 h-4 mr-2" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] bg-card/95 backdrop-blur-xl border-border/40">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Create New User</DialogTitle>
              <DialogDescription>
                Assign a user to a society and set their access level.
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4 py-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase ml-1">Full Name</label>
                  <Input placeholder="John Doe" {...form.register("name")} className="bg-background/50" />
                  {form.formState.errors.name && <p className="text-[10px] text-destructive ml-1">{form.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase ml-1">Contact Phone</label>
                  <Input placeholder="+91..." {...form.register("phone")} className="bg-background/50" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase ml-1">Email Address</label>
                <Input type="email" placeholder="john@example.com" {...form.register("email")} className="bg-background/50" />
                {form.formState.errors.email && <p className="text-[10px] text-destructive ml-1">{form.formState.errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase ml-1">Password</label>
                <Input type="password" placeholder="••••••••" {...form.register("password")} className="bg-background/50" />
                {form.formState.errors.password && <p className="text-[10px] text-destructive ml-1">{form.formState.errors.password.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase ml-1">Assigned Society</label>
                  <select 
                    {...form.register("societyId")}
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select Society</option>
                    {societies.map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                  {form.formState.errors.societyId && <p className="text-[10px] text-destructive ml-1">{form.formState.errors.societyId.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase ml-1">User Role</label>
                  <select 
                    {...form.register("role")}
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="user">Resident (User)</option>
                    <option value="admin">Society Admin</option>
                  </select>
                </div>
              </div>

              <DialogFooter className="pt-6">
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loading size="sm" className="mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                  {createMutation.isPending ? "Creating..." : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-xl overflow-hidden border-border/40 bg-card/60 backdrop-blur-md">
        <CardHeader className="bg-muted/30 border-b border-border/40 pb-5">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                User List
              </CardTitle>
              <div className="flex items-center gap-3">
                 <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search users..." 
                      className="pl-9 h-9 w-64 bg-background/50 border-border/60"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                 </div>
                 <div className="flex p-0.5 bg-muted/80 rounded-lg border border-border/40">
                    <Button 
                      variant={roleFilter === "all" ? "secondary" : "ghost"} 
                      size="sm" 
                      onClick={() => setRoleFilter("all")}
                      className="h-8 text-xs font-semibold px-4"
                    >
                      All
                    </Button>
                    <Button 
                      variant={roleFilter === "admin" ? "secondary" : "ghost"} 
                      size="sm" 
                      onClick={() => setRoleFilter("admin")}
                      className="h-8 text-xs font-semibold px-4"
                    >
                      Admins
                    </Button>
                 </div>
              </div>
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {usersQuery.isLoading ? (
              <Loading variant="card" text="Fetching users from server..." className="bg-transparent border-0" />
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/20 border-b border-border/40">
                  <tr>
                    <th className="h-12 px-6 text-left align-middle font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                    <th className="h-12 px-6 text-left align-middle font-semibold text-muted-foreground uppercase tracking-wider">Society</th>
                    <th className="h-12 px-6 text-left align-middle font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                    <th className="h-12 px-6 text-left align-middle font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="h-12 px-6 text-right align-middle font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filtered.map((user) => {
                    const soc = societies.find(s => s._id === user.societyId);
                    return (
                      <tr key={user._id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner">
                                {user.name.charAt(0)}
                             </div>
                             <div className="flex flex-col">
                                <span className="font-bold text-foreground/90">{user.name}</span>
                                <span className="text-xs text-muted-foreground">{user.email}</span>
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <span className="font-medium px-2.5 py-1 bg-muted/50 rounded-md border border-border/40">
                             {soc?.name || "Unknown"}
                           </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="flex items-center gap-1.5">
                              {user.role === "admin" ? <Shield className="w-3.5 h-3.5 text-amber-500" /> : <UserIcon className="w-3.5 h-3.5 text-blue-500" />}
                              <span className="capitalize font-medium">{user.role}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <Badge 
                            variant={user.status === "active" ? "success" : user.status === "pending" ? "outline" : "danger"}
                            className="text-[10px] uppercase font-bold tracking-widest px-2 shadow-none"
                           >
                             {user.status}
                           </Badge>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                           <Button 
                            variant="ghost" 
                            size="sm" 
                            className={cn("h-8 text-xs font-bold transition-opacity", user.status === "active" ? "text-destructive hover:bg-destructive/10" : "text-emerald-500 hover:bg-emerald-500/10")}
                            onClick={() => statusMutation.mutate({ 
                              id: user._id, 
                              status: user.status === "active" ? "blocked" : "active" 
                            })}
                           >
                             {user.status === "active" ? "Block Access" : "Unblock"}
                           </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
          {!usersQuery.isLoading && filtered.length === 0 && (
             <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                <UserIcon className="w-16 h-16 text-muted-foreground mb-4 stroke-1" />
                <h3 className="text-lg font-bold">No users found</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">Try adjusting your search or filters to see results.</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
