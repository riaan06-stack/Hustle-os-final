"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/States";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center glow-bg px-6">
      <ErrorState
        title="Something went wrong"
        description="An unexpected error occurred. You can try again."
        onRetry={reset}
        className="max-w-sm"
      />
    </div>
  );
}
