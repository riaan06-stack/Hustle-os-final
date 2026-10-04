"use client";

import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  selected?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, selected = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border bg-bg-card p-5 transition-all duration-200",
          selected
            ? "border-blue-primary shadow-[0_0_0_1px_rgba(219,110,61,0.4),0_0_20px_-6px_rgba(219,110,61,0.3)]"
            : "border-border-subtle",
          interactive &&
            !selected &&
            "hover:border-blue-primary/50 hover:bg-bg-card-hover cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export { Card };