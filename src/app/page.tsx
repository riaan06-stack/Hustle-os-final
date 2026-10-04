"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { IntroSequence } from "@/components/IntroSequence";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/store/auth";
import { useHydrated } from "@/hooks/useHydrated";

export default function LandingPage() {
  const hydrated = useHydrated();
  const hasSeenIntro = useAuthStore((s) => s.hasSeenIntro);
  const markIntroSeen = useAuthStore((s) => s.markIntroSeen);
  const [introDone, setIntroDone] = useState(false);

  // Only play the cinematic intro once per browser (state persisted locally).
  const shouldPlayIntro = hydrated && !hasSeenIntro && !introDone;

  return (
    <div className="relative min-h-screen glow-bg">
      {shouldPlayIntro && (
        <IntroSequence
          onDone={() => {
            markIntroSeen();
            setIntroDone(true);
          }}
        />
      )}

      {hydrated && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: shouldPlayIntro ? 0 : 0 }}
        >
          <Nav />
          <Hero />
        </motion.div>
      )}
    </div>
  );
}

function Nav() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8 lg:px-10">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-primary to-blue-dark text-sm font-bold text-white">
          H
        </div>
        <span className="font-display text-[15px] font-semibold tracking-tight">
          HUSTLEOS
        </span>
      </div>
      <Link href="/login">
        <Button variant="ghost" size="sm">
          Login
        </Button>
      </Link>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-6xl flex-col items-center justify-center px-5 py-16 text-center sm:px-8 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        <h1 className="text-gradient font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
          HUSTLEOS
        </h1>
        <p className="mt-4 text-sm font-medium tracking-[0.2em] text-blue-soft sm:text-base">
          WELCOME HUSTLERS.
        </p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
        className="mt-8 max-w-md text-lg text-text-secondary sm:text-xl"
      >
        Build. Work. Earn. Grow.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        className="mt-10 flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center"
      >
        <Link href="/onboarding/account-type" className="w-full sm:w-auto">
          <Button size="lg" fullWidth className="sm:w-56">
            GET STARTED
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/login" className="w-full sm:w-auto">
          <Button variant="secondary" size="lg" fullWidth className="sm:w-40">
            LOGIN
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}
