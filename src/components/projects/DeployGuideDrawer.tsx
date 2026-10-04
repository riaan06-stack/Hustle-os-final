"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Rocket } from "lucide-react";
import { vercelDeploySteps } from "@/lib/content";

export function DeployGuideDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="relative z-10 flex h-full w-full max-w-sm flex-col border-l border-border-subtle bg-bg-secondary sm:max-w-md"
          >
            <div className="flex items-center justify-between border-b border-border-subtle px-6 py-5">
              <div className="flex items-center gap-2 text-blue-soft">
                <Rocket className="h-4 w-4" />
                <h2 className="font-display text-base font-semibold text-text-primary">
                  Deploy for free on Vercel
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-lg p-1.5 text-text-secondary hover:bg-black/5 hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <p className="text-sm text-text-secondary">
                No card, no cost — here&apos;s the fastest way to get a live link for your project.
              </p>

              <ol className="mt-6 space-y-5">
                {vercelDeploySteps.map((step, i) => (
                  <motion.li
                    key={step.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * i, ease: [0.16, 1, 0.3, 1] }}
                    className="flex gap-3"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-primary/15 text-xs font-semibold text-blue-soft">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{step.title}</p>
                      <p className="mt-1 text-sm text-text-secondary">{step.description}</p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}