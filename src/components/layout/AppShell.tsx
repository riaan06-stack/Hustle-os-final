"use client";

import { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import type { NavItem } from "./navConfig";
import { useAuthStore } from "@/lib/store/auth";

export function AppShell({
  items,
  children,
}: {
  items: NavItem[];
  children: ReactNode;
}) {
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  return (
    <div className="min-h-screen glow-bg">
      <Sidebar items={items} />

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border-subtle bg-bg-main/80 px-5 backdrop-blur-lg lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-primary to-blue-dark text-xs font-bold text-white">
            H
          </div>
          <span className="font-display text-sm font-semibold tracking-tight">
            HUSTLEOS
          </span>
        </div>
        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          aria-label="Log out"
          className="rounded-lg p-2 text-text-secondary hover:bg-black/5 hover:text-red-600"
        >
          <LogOut className="h-[18px] w-[18px]" />
        </button>
      </header>

      <main className="pb-24 lg:ml-64 lg:pb-12">{children}</main>

      <BottomNav items={items} />
    </div>
  );
}
