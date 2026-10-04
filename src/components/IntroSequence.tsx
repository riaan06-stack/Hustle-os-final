"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function IntroSequence({ onDone }: { onDone: () => void }) {
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 350), // glow appears
      setTimeout(() => setStage(2), 1050), // HUSTLEOS reveals
      setTimeout(() => setStage(3), 1900), // welcome line appears
      setTimeout(() => onDone(), 3300), // fade out to landing
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <AnimatePresence>
      <motion.div
        key="intro"
        exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-bg-main"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: stage >= 1 ? 1 : 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="pointer-events-none absolute h-[70vmin] w-[70vmin] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(219,110,61,0.16) 0%, rgba(232,184,75,0.08) 45%, rgba(219,110,61,0) 70%)",
          }}
        />

        <div className="relative flex flex-col items-center px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 14, letterSpacing: "0.15em" }}
            animate={
              stage >= 2
                ? { opacity: 1, y: 0, letterSpacing: "0.04em" }
                : { opacity: 0, y: 14 }
            }
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-4xl font-bold text-text-primary sm:text-5xl md:text-6xl"
          >
            HUSTLEOS
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={stage >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 text-sm font-medium tracking-[0.2em] text-blue-soft sm:text-base"
          >
            WELCOME HUSTLERS.
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}