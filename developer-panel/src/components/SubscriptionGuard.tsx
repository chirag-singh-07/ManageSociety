import { AlertCircle, Zap } from "lucide-react";
import { cn } from "../lib/cn";

export function TrialAlert({
  trialEndsAt,
  plan,
}: {
  trialEndsAt?: string;
  plan?: string;
}) {
  if (plan !== "trial" || !trialEndsAt) return null;

  const endsAt = new Date(trialEndsAt);
  const now = new Date();
  const diffTime = endsAt.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return null;

  return (
    <div
      className={cn(
        "w-full p-3 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest animate-in slide-in-from-top duration-500",
        diffDays <= 3 ? "bg-red-500 text-white" : "bg-amber-500 text-white",
      )}
    >
      <Zap className="w-4 h-4 animate-pulse" />
      <span>
        {diffDays === 0
          ? "Last day of trial!"
          : `Free Trial active - ${diffDays} days remaining`}
      </span>
      <div className="h-4 w-px bg-white/30 hidden sm:block" />
      <span className="hidden sm:inline opacity-80">
        Upgrade to Premium to unlock full isolation & global support
      </span>
    </div>
  );
}

export function SubscriptionLockout() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-8 animate-in zoom-in-95 duration-700">
        <div className="relative">
          <div className="mx-auto w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full -z-10" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black text-white tracking-tighter">
            Instance Locked
          </h1>
          <p className="text-slate-400 font-medium text-balance">
            Your society's subscription or trial period has ended. Access to the
            management dashboard has been suspended.
          </p>
        </div>

        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-4 shadow-2xl">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-500 pb-2 border-b border-slate-800">
            <span>Status</span>
            <span className="text-red-500">EXPIRED</span>
          </div>
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-500">
            <span>Last Plan</span>
            <span className="text-white">FREEV2_TRIAL</span>
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <button className="w-full h-14 bg-white text-black font-black rounded-2xl hover:bg-slate-200 transition-colors shadow-xl">
            Contact Developer Support
          </button>
          <p className="text-[10px] font-black uppercase text-slate-600 tracking-[0.2em]">
            Powered by ManageSociety Engine v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
