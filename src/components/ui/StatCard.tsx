import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border-subtle bg-bg-card p-5", className)}>
      <div className="flex items-center justify-between text-text-secondary">
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
        {icon && <span className="text-blue-soft">{icon}</span>}
      </div>
      <p className="mt-2 font-display text-2xl font-bold text-text-primary">{value}</p>
      {hint && <p className="mt-1 text-xs text-text-secondary">{hint}</p>}
    </div>
  );
}
