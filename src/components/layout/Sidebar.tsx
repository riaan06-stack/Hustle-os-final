"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import type { NavItem } from "./navConfig";
import { cn } from "@/lib/utils";
import { useAuthStore, useCurrentUser } from "@/lib/store/auth";
import { useRouter } from "next/navigation";

export function Sidebar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const user = useCurrentUser();
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border-subtle bg-bg-secondary/60 lg:flex">
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-primary to-blue-dark text-sm font-bold text-white">
          H
        </div>
        <span className="font-display text-[15px] font-semibold tracking-tight">
          HUSTLEOS
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            if (item.disabled) {
              return (
                <li key={item.label}>
                  <div className="flex cursor-not-allowed items-center justify-between rounded-xl px-3 py-2.5 text-sm text-text-secondary/50">
                    <span className="flex items-center gap-3">
                      <Icon className="h-[18px] w-[18px]" />
                      {item.label}
                    </span>
                    <span className="rounded-full bg-black/5 px-1.5 py-0.5 text-[10px] font-medium">
                      Soon
                    </span>
                  </div>
                </li>
              );
            }

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-blue-primary/12 text-blue-soft"
                      : "text-text-secondary hover:bg-black/5 hover:text-text-primary"
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border-subtle p-3">
        <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg-card text-sm font-semibold text-blue-soft">
            {user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text-primary">
              {user?.name ?? "Guest"}
            </p>
            <p className="truncate text-xs text-text-secondary">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-black/5 hover:text-red-600"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Log out
        </button>
      </div>
    </aside>
  );
}
