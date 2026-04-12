import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSociety, listSocieties, updateSociety } from "../api/superadmin";
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
import { Link } from "react-router-dom";
import { formatDate } from "../utils/date";
import { Loading } from "../components/ui/loading";

const createSchema = z.object({
  name: z.string().min(2),
  trialDays: z.coerce.number().int().min(0).max(365).default(14),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
});
type CreateValues = z.infer<typeof createSchema>;

export function SocietiesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "suspended">("all");

  const societiesQuery = useQuery({
    queryKey: ["societies"],
    queryFn: listSocieties,
  });

  const createMutation = useMutation({
    mutationFn: createSociety,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["societies"] });
      toast.success("Society created");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to create"),
  });

  const statusMutation = useMutation({
    mutationFn: (input: { id: string; status: "active" | "suspended" }) =>
      updateSociety(input.id, { status: input.status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["societies"] }),
    onError: (err: any) =>
      toast.error(err?.message || "Failed to update status"),
  });

  const societies = societiesQuery.data?.societies || [];

  const filtered = useMemo(() => {
    return societies.filter((s) => {
      const matchText = s.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = status === "all" ? true : s.status === status;
      return matchText && matchStatus;
    });
  }, [societies, search, status]);

  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { trialDays: 14 },
  });

  const onSubmit = async (values: CreateValues) => {
    await createMutation.mutateAsync({
      name: values.name || "",
      trialDays: values.trialDays,
      address: values.address,
      city: values.city,
      state: values.state,
      pincode: values.pincode,
    });
    form.reset({ name: "", trialDays: 14 });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Societies</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and monitor all tenant societies.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 mr-2"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Create Society
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Society</DialogTitle>
              <DialogDescription>
                Add a new society tenant and configure their trial period.
              </DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4 py-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="space-y-2">
                <Input placeholder="Society name" {...form.register("name")} />
              </div>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Trial days"
                  {...form.register("trialDays", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Address (optional)"
                  {...form.register("address")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="City" {...form.register("city")} />
                <Input placeholder="State" {...form.register("state")} />
              </div>
              <div className="space-y-2">
                <Input placeholder="Pincode" {...form.register("pincode")} />
              </div>
              <DialogFooter className="pt-4 drop-shadow-sm">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Society"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm overflow-hidden border-muted/50">
        <CardHeader className="bg-muted/10 border-b pb-4">
          <CardTitle className="text-lg">
            All Societies ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/5">
            <div className="relative w-full max-w-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <Input
                className="pl-9 bg-background/50"
                placeholder="Search societies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex bg-muted/50 p-1 rounded-md">
              <Button
                variant={status === "all" ? "default" : "ghost"}
                className="h-8 shadow-none"
                onClick={() => setStatus("all")}
              >
                All
              </Button>
              <Button
                variant={status === "active" ? "default" : "ghost"}
                className="h-8 shadow-none"
                onClick={() => setStatus("active")}
              >
                Active
              </Button>
              <Button
                variant={status === "suspended" ? "default" : "ghost"}
                className="h-8 shadow-none"
                onClick={() => setStatus("suspended")}
              >
                Suspended
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            {societiesQuery.isLoading ? (
              <Loading variant="card" size="md" text="Loading tenants..." className="border-0 shadow-none bg-transparent" />
            ) : (
              <>
                <table className="w-full text-sm caption-bottom">
                  <thead className="[&_tr]:border-b bg-muted/20">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Trial Ends</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created</th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {filtered.map((s) => (
                      <tr
                        key={s._id}
                        className="border-b transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted"
                      >
                        <td className="p-4 align-middle font-medium">
                          <Link className="hover:underline text-primary" to={`/societies/${s._id}`}>
                            {s.name}
                          </Link>
                        </td>
                        <td className="p-4 align-middle">
                          <Badge
                            variant={s.status === "active" ? "default" : "danger"}
                            className="font-semibold shadow-none"
                          >
                            {s.status}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle text-muted-foreground">{formatDate(s.trialEndsAt)}</td>
                        <td className="p-4 align-middle text-muted-foreground">{formatDate(s.createdAt)}</td>
                        <td className="p-4 align-middle text-right">
                          <Button
                            variant={s.status === "active" ? "outline" : "secondary"}
                            size="sm"
                            onClick={() =>
                              statusMutation.mutate({
                                id: s._id,
                                status: s.status === "active" ? "suspended" : "active",
                              })
                            }
                          >
                            {s.status === "active" ? "Suspend" : "Activate"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-12 h-12 text-muted-foreground/30 mb-4"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="9" x2="15" y1="15" y2="15" />
                    </svg>
                    <div className="text-lg font-medium">No societies found</div>
                    <div className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search.</div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
