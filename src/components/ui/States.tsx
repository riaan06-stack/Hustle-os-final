"use client";

import { ReactNode } from "react";
import { Loader2, Inbox, AlertTriangle } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export function LoadingState({
  label = "Loading…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-text-secondary",
        className
      )}
    >
      <Loader2 className="h-6 w-6 animate-spin text-blue-bright" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border-subtle bg-bg-secondary/50 px-6 py-12 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bg-card text-text-secondary">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <div>
        <p className="font-medium text-text-primary">{title}</p>
        {description && (
          <p className="mt-1 max-w-xs text-sm text-text-secondary">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-12 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div>
        <p className="font-medium text-text-primary">{title}</p>
        {description && (
          <p className="mt-1 max-w-xs text-sm text-text-secondary">{description}</p>
        )}
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
