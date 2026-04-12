import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "fullscreen" | "card";
  text?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

export function Loading({
  className,
  size = "md",
  variant = "default",
  text,
  ...props
}: LoadingProps) {
  const alignClasses =
    variant === "fullscreen"
      ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
      : variant === "card"
      ? "flex flex-col items-center justify-center min-h-[300px] w-full bg-card/50 rounded-xl"
      : "flex flex-col items-center justify-center p-4";

  return (
    <div className={cn(alignClasses, className)} {...props}>
      <Loader2
        className={cn(
          "animate-spin text-primary",
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
