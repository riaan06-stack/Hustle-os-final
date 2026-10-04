import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center glow-bg px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border-subtle bg-bg-card text-blue-soft">
        <Compass className="h-6 w-6" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-bold text-text-primary">
        404 — Off the map
      </h1>
      <p className="mt-2 max-w-sm text-text-secondary">
        This page doesn&apos;t exist in HustleOS. Let&apos;s get you back to
        somewhere real.
      </p>
      <Link href="/" className="mt-8">
        <Button size="lg">Back to HustleOS</Button>
      </Link>
    </div>
  );
}
