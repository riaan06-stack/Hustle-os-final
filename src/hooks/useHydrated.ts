"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/**
 * The auth store is persisted to localStorage, which does not exist on the
 * server. Any component that reads store state which could differ between
 * server and client render should wait for this to flip to `true` before
 * trusting that state, to avoid hydration mismatches.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
