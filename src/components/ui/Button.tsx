"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-primary text-white hover:bg-blue-bright active:bg-blue-dark shadow-[0_0_0_1px_rgba(219,110,61,0.35),0_6px_16px_-6px_rgba(219,110,61,0.4)] disabled:shadow-none disabled:bg-border-subtle disabled:text-text-secondary",
  secondary:
    "bg-bg-card text-text-primary border border-border-subtle hover:border-blue-primary/60 hover:bg-bg-card-hover disabled:text-text-secondary disabled:hover:border-border-subtle disabled:hover:bg-bg-card",
  ghost:
    "bg-transparent text-text-secondary hover:text-text-primary hover:bg-black/5 disabled:hover:bg-transparent disabled:hover:text-text-secondary",
  danger:
    "bg-transparent text-red-600 border border-red-500/30 hover:bg-red-500/10 disabled:text-text-secondary disabled:border-border-subtle disabled:hover:bg-transparent",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm rounded-lg gap-1.5",
  md: "h-11 px-5 text-sm rounded-xl gap-2",
  lg: "h-[52px] px-7 text-base rounded-xl gap-2",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 ease-out active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 whitespace-nowrap",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };