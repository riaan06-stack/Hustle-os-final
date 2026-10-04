"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth";

/**
 * Loads the demo dataset (demo Hustlers, Owners, jobs, applications, income,
 * work logs) into the local store the first time the app is opened in a
 * browser. Runs once; real accounts are never overwritten.
 */
export function DemoSeeder() {
  useEffect(() => {
    const run = () => useAuthStore.getState().seedDemoData();
    if (useAuthStore.persist.hasHydrated()) {
      run();
      return;
    }
    return useAuthStore.persist.onFinishHydration(run);
  }, []);
  return null;
}
