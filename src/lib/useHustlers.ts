"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/lib/store/auth";
import type { HustlerEntry } from "@/lib/search";

/** Every Hustler that has a profile, joined with their projects. */
export function useHustlerEntries(): HustlerEntry[] {
  const users = useAuthStore((s) => s.users);
  const profiles = useAuthStore((s) => s.hustlerProfiles);
  const projects = useAuthStore((s) => s.hustlerProjects);
  return useMemo(
    () =>
      users
        .filter((u) => u.role === "hustler" && profiles[u.id])
        .map((u) => ({ user: u, profile: profiles[u.id], projects: projects[u.id] ?? [] })),
    [users, profiles, projects]
  );
}
