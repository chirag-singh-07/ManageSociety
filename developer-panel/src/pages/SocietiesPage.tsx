import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSociety, listSocieties, updateSociety, deleteSociety } from "../api/superadmin";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { formatDate } from "../utils/date";
import { Loading } from "../components/ui/loading";
import { cn } from "../lib/cn";
import { 
  MoreHorizontal, 
  Trash2, 
  ShieldCheck, 
  Ban, 
  ArrowUpRight, 
  LayoutGrid, 
  Search,
  Plus,
  Rocket
} from "lucide-react";

const createSchema = z.object({
  name: z.string().min(2),
  trialDays: z.coerce.number().int().min(0).max(365).default(14),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  plan: z.string().optional(),
  months: z.coerce.number().optional(),
});

type CreateValues = z.infer<typeof createSchema>;

export function SocietiesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [setupMode, setSetupMode] = useState<"trial" | "subscription">("trial");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const societiesQuery = useQuery({
    queryKey: ["societies"],
    queryFn: listSocieties,
  });

  const createMutation = useMutation({
    mutationFn: createSociety,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["societies"] });
      toast.success("Society created successfully");
      setIsCreateOpen(false);
      form.reset();
    },
    onError: (err: any) => toast.error(err?.message || "Failed to create"),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: string; input: any }) => updateSociety(vars.id, vars.input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["societies"] }),
    onError: (err: any) => toast.error(err?.message || "Update failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSociety(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["societies"] });
      toast.success("Society deleted");
    },
    onError: (err: any) => toast.error(err?.message || "Delete failed"),
  });

  const societies = societiesQuery.data?.societies || [];

  const filtered = useMemo(() => {
    return societies.filter((s) => {
      const matchText = s.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" ? true : s.status === statusFilter;
      return matchText && matchStatus;
    });
  }, [societies, search, statusFilter]);

  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { trialDays: 14, months: 12, plan: "basic" },
  });

  const onSubmit = async (values: CreateValues) => {
    await createMutation.mutateAsync({
      name: values.name || "",
      trialDays: setupMode === "trial" ? values.trialDays : 0,
      plan: setupMode === "subscription" ? values.plan : "trial",
      months: setupMode === "subscription" ? values.months : undefined,
      address: values.address,
      city: values.city,
      state: values.state,
      pincode: values.pincode,
    });
  };

  const getPlanColor = (plan?: string) => {
    switch(plan?.toLowerCase()) {
      case 'enterprise': return 'bg-purple-500/10 text-purple-600 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400';
      case 'premium': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400';
      case 'basic': return 'bg-blue-500/10 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400';
      default: return 'bg-amber-500/10 text-amber-600 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400';
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-foreground/90">Societies</h1>
          <p className="text-muted-foreground font-medium">Manage multi-tenant isolation and subscription cycles.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="h-12 px-6 font-black shadow-xl shadow-primary/20 gap-2">
              <Plus className="w-5 h-5" />
              Launch New Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px] bg-card/95 backdrop-blur-xl border-border/40">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="text-2xl font-black flex items-center gap-2">
                <Rocket className="w-6 h-6 text-primary" />
                Register Society
              </DialogTitle>
              <DialogDescription className="font-medium">
                Bootstrap a new isolated tenant environment.
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-6 pt-6 pb-2" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Entity Name</label>
                  <Input placeholder="Green Valley Estate" {...form.register("name")} className="h-12 bg-background/50 font-bold" />
                </div>

                <div className="space-y-4">
                  <div className="flex p-1 bg-muted/60 rounded-xl border border-border/40">
                    <button
                      type="button"
                      className={cn(
                        "flex-1 py-1.5 text-xs font-black uppercase rounded-lg transition-all",
                        setupMode === "trial" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
                      )}
                      onClick={() => setSetupMode("trial")}
                    >
                      Free Trial
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "flex-1 py-1.5 text-xs font-black uppercase rounded-lg transition-all",
                        setupMode === "subscription" ? "bg-emerald-500 text-white shadow-md" : "text-muted-foreground hover:bg-muted"
                      )}
                      onClick={() => setSetupMode("subscription")}
                    >
                      Paid Start
                    </button>
                  </div>

                  {setupMode === "trial" ? (
                    <div className="space-y-2 animate-in fade-in zoom-in-95">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Trial Period (Days)</label>
                      <Input type="number" {...form.register("trialDays", { valueAsNumber: true })} className="h-12 bg-background/50 font-bold" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Plan</label>
                        <select 
                          {...form.register("plan")}
                          className="flex h-12 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm font-bold focus:outline-none"
                        >
                          <option value="basic">Basic</option>
                          <option value="premium">Premium</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Initial Months</label>
                        <Input type="number" {...form.register("months", { valueAsNumber: true })} className="h-12 bg-background/50 font-bold" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Address</label>
                      <Input placeholder="123 Sector, Road Name" {...form.register("address")} className="bg-background/50" />
                   </div>
                   <Input placeholder="City" {...form.register("city")} className="bg-background/50" />
                   <Input placeholder="State" {...form.register("state")} className="bg-background/50" />
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button type="submit" disabled={createMutation.isPending} className="w-full h-14 text-lg font-black shadow-2xl">
                  {createMutation.isPending ? <Loading size="sm" className="mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                  {createMutation.isPending ? "Onboarding..." : "Execute Onboarding"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-2xl bg-card/60 backdrop-blur-xl overflow-hidden rounded-3xl">
        <CardHeader className="bg-muted/30 border-b p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-muted-foreground/50" />
              <Input
                placeholder="Search societies by name or ID..."
                className="pl-11 h-12 bg-background/50 border-none rounded-2xl shadow-inner font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex bg-muted/80 p-1.5 rounded-2xl border border-border/40">
              {["all", "active", "suspended"].map((f) => (
                <button
                  key={f}
                  className={cn(
                    "px-6 py-2 text-xs font-black uppercase tracking-tight rounded-xl transition-all",
                    statusFilter === f ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setStatusFilter(f as any)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {societiesQuery.isLoading ? (
              <div className="py-20 flex justify-center"><Loading size="lg" text="Syncing tenant database..." /></div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/10 border-b border-border/40">
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entity</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Plan</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Status</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Validity</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right pr-10">Context</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filtered.map((s) => (
                    <tr key={s._id} className="group hover:bg-primary/5 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black">
                            {s.name[0]}
                          </div>
                          <div>
                            <Link to={`/societies/${s._id}`} className="font-black text-foreground hover:text-primary transition-colors flex items-center gap-1">
                              {s.name}
                              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                            <span className="text-[10px] font-mono text-muted-foreground uppercase">{s.city || 'GLOBAL_TENANT'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                              <Badge variant="outline" className={cn("px-3 py-1 font-black uppercase tracking-tighter cursor-pointer hover:border-primary/50", getPlanColor(s.plan))}>
                                {s.plan || 'Trial'}
                              </Badge>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="center" className="w-48 font-bold">
                              <DropdownMenuLabel className="text-[10px] uppercase font-black text-muted-foreground">Change License</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {['trial', 'basic', 'premium', 'enterprise'].map(p => (
                                <DropdownMenuItem 
                                  key={p} 
                                  className="capitalize"
                                  onClick={() => updateMutation.mutate({ id: s._id, input: { plan: p } })}
                                >
                                   {p}
                                </DropdownMenuItem>
                              ))}
                           </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                      <td className="p-6 text-center">
                        <Badge 
                          variant={s.status === 'active' ? 'default' : 'secondary'}
                          className={cn("px-3 py-1 font-black uppercase", s.status !== 'active' && 'opacity-50')}
                        >
                          {s.status}
                        </Badge>
                      </td>
                      <td className="p-6 text-center font-mono text-xs font-bold text-muted-foreground">
                        {formatDate(s.trialEndsAt)}
                      </td>
                      <td className="p-6 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                 <Button variant="ghost" size="icon" className="rounded-xl hover:bg-background shadow-none">
                                    <MoreHorizontal className="w-5 h-5" />
                                 </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl border-primary/20 bg-card/95 backdrop-blur-md">
                                 <DropdownMenuLabel className="text-[10px] uppercase font-black text-muted-foreground px-2 py-1.5 ">Administrative Actions</DropdownMenuLabel>
                                 <DropdownMenuSeparator className="mx-2" />
                                 <DropdownMenuItem className="rounded-xl flex items-center gap-3 py-3" onClick={() => window.location.href=`/societies/${s._id}`}>
                                    <LayoutGrid className="w-4 h-4 text-blue-500" />
                                    Explore Instance
                                 </DropdownMenuItem>
                                 <DropdownMenuItem 
                                    className="rounded-xl flex items-center gap-3 py-3"
                                    onClick={() => updateMutation.mutate({ 
                                      id: s._id, 
                                      input: { status: s.status === 'active' ? 'suspended' : 'active' } 
                                    })}
                                  >
                                    {s.status === 'active' ? <Ban className="w-4 h-4 text-amber-500" /> : <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                                    {s.status === 'active' ? 'Suspend Instance' : 'Reactivate Instance'}
                                 </DropdownMenuItem>
                                 <DropdownMenuSeparator className="mx-2" />
                                 <DropdownMenuItem 
                                    className="rounded-xl flex items-center gap-3 py-3 text-red-500 focus:bg-red-500/10 focus:text-red-500"
                                    onClick={() => {
                                      if (confirm(`Are you absolutely sure you want to PERMANENTLY DELETE "${s.name}"? This action cannot be undone.`)) {
                                        deleteMutation.mutate(s._id);
                                      }
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Purge Data
                                 </DropdownMenuItem>
                              </DropdownMenuContent>
                           </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!societiesQuery.isLoading && filtered.length === 0 && (
              <div className="py-24 text-center space-y-4">
                 <div className="mx-auto w-16 h-16 rounded-3xl bg-muted/30 flex items-center justify-center">
                    <LayoutGrid className="w-8 h-8 text-muted-foreground/20" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-lg font-black opacity-40">No tenants found</p>
                    <p className="text-xs text-muted-foreground font-medium">Try refining your search parameters.</p>
                 </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
