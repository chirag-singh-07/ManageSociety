import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listSocieties, createUser } from "../api/superadmin";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { Loading } from "../components/ui/loading";
import { 
  ShieldCheck, 
  Home, 
  UserCircle, 
  Briefcase, 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2,
  Users
} from "lucide-react";
import { cn } from "../lib/cn";

type UserTemplate = {
  id: string;
  title: string;
  description: string;
  icon: any;
  role: "admin" | "user";
  userType: "resident" | "owner" | "tenant" | "staff" | "guard";
  color: string;
};

const TEMPLATES: UserTemplate[] = [
  {
    id: "admin",
    title: "Society Admin",
    description: "Full management access for a specific society.",
    icon: ShieldCheck,
    role: "admin",
    userType: "staff",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "owner",
    title: "Flat Owner",
    description: "Resident with property ownership rights.",
    icon: Home,
    role: "user",
    userType: "owner",
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "tenant",
    title: "Tenant",
    description: "Resident living on lease agreement.",
    icon: UserCircle,
    role: "user",
    userType: "tenant",
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "staff",
    title: "Society Staff",
    description: "Management staff or facility workers.",
    icon: Briefcase,
    role: "user",
    userType: "staff",
    color: "from-purple-500 to-violet-600",
  },
  {
    id: "guard",
    title: "Security Guard",
    description: "Main gate and patrolling personnel.",
    icon: ShieldAlert,
    role: "user",
    userType: "guard",
    color: "from-red-500 to-rose-600",
  },
];

export function UserFactoryPage() {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<UserTemplate | null>(null);
  const [step, setStep] = useState(1);

  const societiesQuery = useQuery({
    queryKey: ["societies"],
    queryFn: listSocieties,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    societyId: "",
  });

  const createMutation = useMutation({
    mutationFn: (vars: any) => createUser(vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully!");
      setStep(3); // Result step
    },
    onError: (err: any) => toast.error(err?.message || "Creation failed"),
  });

  const societies = societiesQuery.data?.societies || [];

  const handleSelectTemplate = (tpl: UserTemplate) => {
    setSelectedTemplate(tpl);
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    if (!formData.name || !formData.email || !formData.password || !formData.societyId) {
       return toast.error("Please fill required fields");
    }
    createMutation.mutate({
      ...formData,
      role: selectedTemplate.role,
      userType: selectedTemplate.userType,
    });
  };

  if (step === 1) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tight text-foreground/90">User Factory</h1>
          <p className="text-muted-foreground font-medium">Select a user profile template to start registration.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((tpl) => (
            <Card 
              key={tpl.id} 
              className="group cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
              onClick={() => handleSelectTemplate(tpl)}
            >
              <div className={cn("h-2 w-full bg-gradient-to-r", tpl.color)} />
              <CardHeader className="pt-6">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 bg-gradient-to-br shadow-lg", tpl.color)}>
                  <tpl.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl font-bold">{tpl.title}</CardTitle>
                <CardDescription className="text-sm font-medium leading-relaxed">{tpl.description}</CardDescription>
              </CardHeader>
              <CardFooter className="pb-6 border-t border-border/20 pt-4 flex justify-between items-center group-hover:bg-muted/30 transition-colors">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Profile</span>
                <ArrowRight className="w-4 h-4 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (step === 2 && selectedTemplate) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
        <Button variant="ghost" onClick={() => setStep(1)} className="mb-4 hover:bg-muted/50 -ml-4">
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Back to Templates
        </Button>

        <Card className="shadow-2xl border-primary/20 overflow-hidden bg-card/80 backdrop-blur-xl">
           <div className={cn("h-1.5 w-full bg-gradient-to-r", selectedTemplate.color)} />
           <CardHeader className="bg-muted/20 border-b pb-6">
              <div className="flex items-center gap-4">
                 <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br shadow-inner", selectedTemplate.color)}>
                    <selectedTemplate.icon className="w-6 h-6" />
                 </div>
                 <div>
                    <CardTitle className="text-2xl font-black">Configure {selectedTemplate.title}</CardTitle>
                    <CardDescription className="font-semibold">Setup account credentials and society assignment.</CardDescription>
                 </div>
              </div>
           </CardHeader>
           <form onSubmit={handleSubmit}>
              <CardContent className="pt-8 space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <Label className="uppercase text-[10px] font-black tracking-widest text-muted-foreground ml-1">Full Name</Label>
                       <Input 
                        placeholder="Elon Musk" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="h-11 bg-background/50 border-border/80"
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="uppercase text-[10px] font-black tracking-widest text-muted-foreground ml-1">Phone (Optional)</Label>
                       <Input 
                        placeholder="+91..." 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="h-11 bg-background/50 border-border/80"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label className="uppercase text-[10px] font-black tracking-widest text-muted-foreground ml-1">Email Address</Label>
                    <Input 
                      type="email" 
                      placeholder="elon@mars.com" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="h-11 bg-background/50 border-border/80"
                    />
                 </div>

                 <div className="space-y-2">
                    <Label className="uppercase text-[10px] font-black tracking-widest text-muted-foreground ml-1">Password</Label>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="h-11 bg-background/50 border-border/80"
                    />
                 </div>

                 <div className="space-y-2">
                    <Label className="uppercase text-[10px] font-black tracking-widest text-muted-foreground ml-1">Assign to Society</Label>
                    <select 
                      value={formData.societyId}
                      onChange={e => setFormData({...formData, societyId: e.target.value})}
                      className="flex h-11 w-full rounded-md border border-border/80 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select Target Society</option>
                      {societies.map(s => (
                        <option key={s._id} value={s._id}>{s.name} ({s.status})</option>
                      ))}
                    </select>
                 </div>
              </CardContent>
              <CardFooter className="bg-muted/10 border-t pt-6 pb-6 mt-4">
                 <Button type="submit" className="w-full h-12 text-base font-black shadow-xl" disabled={createMutation.isPending}>
                    {createMutation.isPending ? <Loading size="sm" className="mr-2" /> : <Users className="w-5 h-5 mr-2" />}
                    {createMutation.isPending ? "Generating User..." : `Finalize ${selectedTemplate.title} Creation`}
                 </Button>
              </CardFooter>
           </form>
        </Card>
      </div>
    );
  }

  if (step === 3 && selectedTemplate) {
     return (
        <div className="max-w-md mx-auto py-12 text-center space-y-6 animate-in zoom-in-50 duration-500">
           <div className="relative inline-block">
              <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center text-white bg-gradient-to-br shadow-2xl animate-bounce", selectedTemplate.color)}>
                 <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 border-4 border-background flex items-center justify-center">
                 <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
           </div>
           
           <div className="space-y-2">
              <h2 className="text-3xl font-black">{selectedTemplate.title} Created!</h2>
              <p className="text-muted-foreground font-medium">Provisioning complete. The user can now login to their respective dashboard.</p>
           </div>

           <Card className="bg-muted/30 border-dashed">
              <CardContent className="p-4 space-y-3">
                 <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-bold">Email</span>
                    <span className="font-mono text-primary">{formData.email}</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-bold">Role</span>
                    <span className="capitalize">{selectedTemplate.role}</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-bold">Society ID</span>
                    <span className="font-mono">{formData.societyId}</span>
                 </div>
              </CardContent>
           </Card>

           <div className="flex gap-4">
              <Button variant="outline" className="flex-1 font-bold h-12" onClick={() => {
                 setFormData({ name: "", email: "", password: "", phone: "", societyId: "" });
                 setStep(1);
              }}>
                 Create Another
              </Button>
              <Button className="flex-1 font-bold h-12 shadow-md" onClick={() => window.location.href = "/users"}>
                 Go to List
              </Button>
           </div>
        </div>
     );
  }

  return null;
}
