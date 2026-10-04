"use client";

import { cn } from "@/lib/utils";

export interface TabItem<T extends string> {
  value: T;
  label: string;
  count?: number;
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: TabItem<T>[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex max-w-full overflow-x-auto rounded-xl border border-border-subtle bg-bg-card p-1", className)} role="tablist">
      {tabs.map((t) => (
        <button
          key={t.value}
          role="tab"
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            "whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            value === t.value ? "bg-blue-primary text-white" : "text-text-secondary hover:text-text-primary"
          )}
        >
          {t.label}
          {t.count !== undefined && <span className="ml-1.5 text-xs opacity-75">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
