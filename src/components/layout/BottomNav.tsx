"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, MoreHorizontal } from "lucide-react";
import type { NavItem } from "./navConfig";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/auth";

export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [moreOpen, setMoreOpen] = useState(false);

  const primary = items.filter((i) => i.primary);
  const more = items.filter((i) => !i.primary);
  const moreActive = more.some((i) => pathname === i.href && !i.disabled);

  const itemClass = (active: boolean, disabled?: boolean) =>
    cn(
      "flex w-full flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
      active ? "text-blue-bright" : "text-text-secondary",
      disabled && "opacity-40"
    );

  return (
    <>
      <AnimatePresence>
        {moreOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40"
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-3 rounded-2xl border border-border-subtle bg-bg-card p-2 shadow-xl"
              style={{ bottom: "calc(env(safe-area-inset-bottom) + 68px)" }}
            >
              {more.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                if (item.disabled) {
                  return (
                    <div key={item.label} className="flex items-center justify-between rounded-xl px-3 py-3 text-sm text-text-secondary/60">
                      <span className="flex items-center gap-3"><Icon className="h-5 w-5" />{item.label}</span>
                      <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-medium">Soon</span>
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium",
                      active ? "bg-blue-primary/12 text-blue-soft" : "text-text-primary hover:bg-black/5"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setMoreOpen(false);
                  logout();
                  router.push("/");
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 hover:bg-black/5"
              >
                <LogOut className="h-5 w-5" />
                Log out
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border-subtle bg-bg-secondary/95 backdrop-blur-lg lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
          {primary.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <li key={item.label} className="flex-1">
                {item.disabled ? (
                  <button type="button" disabled className={itemClass(false, true)}>
                    <Icon className="h-5 w-5" />
                    <span className="truncate">{item.label}</span>
                  </button>
                ) : (
                  <Link href={item.href} aria-current={active ? "page" : undefined} className={itemClass(active)}>
                    <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                    <span className="truncate">{item.label.replace("Discover Work", "Discover").replace("Find Hustlers", "Find").replace("Post a Project", "Post").replace("My Projects", "Projects")}</span>
                  </Link>
                )}
              </li>
            );
          })}
          {more.length > 0 && (
            <li className="flex-1">
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                aria-expanded={moreOpen}
                className={itemClass(moreActive || moreOpen)}
              >
                <MoreHorizontal className="h-5 w-5" />
                <span>More</span>
              </button>
            </li>
          )}
        </ul>
      </nav>
    </>
  );
}
