import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "blue" | "neutral" | "success" | "warning";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  blue: "bg-blue-primary/12 text-blue-soft border-blue-primary/30",
  neutral: "bg-black/5 text-text-secondary border-border-subtle",
  success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/25",
  warning: "bg-amber-500/10 text-amber-600 border-amber-500/25",
};

export function Badge({ className, variant = "neutral", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
