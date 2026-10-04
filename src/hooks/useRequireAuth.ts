"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/store/auth";
import { useHydrated } from "./useHydrated";
import type { UserRole } from "@/types";

/**
 * Redirects to /login if there is no active mock session, or to the
 * correct role's dashboard if the signed-in user's role doesn't match
 * the page being guarded. Returns `ready: false` until it is safe to
 * render (post-hydration + auth check resolved), so pages can show a
 * loading state rather than flashing the wrong content.
 */
export function useRequireAuth(role?: UserRole) {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (role && user.role !== role) {
      router.replace(`/dashboard/${user.role}`);
    }
  }, [hydrated, user, role, router]);

  const ready = hydrated && !!user && (!role || user.role === role);
  return { ready, user };
}
