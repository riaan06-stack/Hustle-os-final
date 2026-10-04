"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Rocket, Briefcase, ArrowRight, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/layout/PageContainer";
import { useAuthStore } from "@/lib/store/auth";
import type { UserRole } from "@/types";

const options: {
  role: UserRole;
  icon: typeof Rocket;
  title: string;
  description: string;
}[] = [
  {
    role: "hustler",
    icon: Rocket,
    title: "HUSTLER",
    description: "I want to showcase my skills and find opportunities.",
  },
  {
    role: "owner",
    icon: Briefcase,
    title: "OWNER",
    description: "I want to find talented people and get work done.",
  },
];

export default function AccountTypePage() {
  const [selected, setSelected] = useState<UserRole | null>(null);
  const setPendingRole = useAuthStore((s) => s.setPendingRole);
  const router = useRouter();

  function handleContinue() {
    if (!selected) return;
    setPendingRole(selected);
    router.push("/register");
  }

  return (
    <div className="min-h-screen glow-bg">
      <PageContainer className="flex min-h-screen flex-col justify-center py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto w-full max-w-3xl text-center"
        >
          <h1 className="font-display text-3xl font-bold text-text-primary sm:text-4xl">
            What brings you to HustleOS?
          </h1>
          <p className="mt-3 text-text-secondary">
            Choose the path that fits you. You can always reach out for the other later.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {options.map((opt, i) => {
              const Icon = opt.icon;
              const isSelected = selected === opt.role;
              return (
                <motion.div
                  key={opt.role}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                >
                  <Card
                    interactive
                    selected={isSelected}
                    onClick={() => setSelected(opt.role)}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelected(opt.role);
                      }
                    }}
                    className="relative flex min-h-56 flex-col items-start p-7 text-left"
                  >
                    {isSelected && (
                      <div className="absolute right-5 top-5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-primary">
                        <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                      </div>
                    )}
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-colors ${
                        isSelected
                          ? "border-blue-primary bg-blue-primary/15 text-blue-bright"
                          : "border-border-subtle bg-bg-secondary text-text-secondary"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h2 className="mt-5 font-display text-xl font-semibold text-text-primary">
                      {opt.title}
                    </h2>
                    <p className="mt-2 text-sm text-text-secondary">
                      {opt.description}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10"
          >
            <Button
              size="lg"
              disabled={!selected}
              onClick={handleContinue}
              className="mx-auto w-full sm:w-64"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>
      </PageContainer>
    </div>
  );
}
