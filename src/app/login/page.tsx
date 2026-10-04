"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Rocket } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PageContainer } from "@/components/layout/PageContainer";
import { useAuthStore } from "@/lib/store/auth";
import { useHydrated } from "@/hooks/useHydrated";
import {
  DEMO_HUSTLER_EMAIL,
  DEMO_HUSTLER_PASSWORD,
  DEMO_OWNER_EMAIL,
  DEMO_OWNER_PASSWORD,
} from "@/lib/demoData";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const hydrated = useHydrated();
  const login = useAuthStore((s) => s.login);
  const router = useRouter();
  const [forgotOpen, setForgotOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function submit(email: string, password: string) {
    const result = login(email, password);
    if (!result.success) {
      setError("password", { message: result.error });
      return;
    }
    const role = useAuthStore
      .getState()
      .users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())?.role;
    router.push(role === "owner" ? "/dashboard/owner" : "/dashboard/hustler");
  }

  function fillDemo(email: string, password: string) {
    setValue("email", email, { shouldValidate: true });
    setValue("password", password, { shouldValidate: true });
  }

  if (!hydrated) return null;

  return (
    <div className="min-h-screen glow-bg py-14">
      <PageContainer narrow>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-display text-3xl font-bold text-text-primary">Welcome back</h1>
          <p className="mt-2 text-text-secondary">Log in to keep building your hustle.</p>

          <form onSubmit={handleSubmit((v) => submit(v.email, v.password))} noValidate className="mt-8 space-y-5">
            <Input label="Email" required type="email" placeholder="you@example.com" autoComplete="email"
              error={errors.email?.message} {...register("email")} />
            <div>
              <Input label="Password" required type="password" placeholder="Your password"
                autoComplete="current-password" error={errors.password?.message} {...register("password")} />
              <button type="button" onClick={() => setForgotOpen(true)}
                className="mt-2 text-sm font-medium text-blue-bright hover:underline">
                Forgot password?
              </button>
            </div>

            <Button type="submit" size="lg" fullWidth loading={isSubmitting} className="mt-2">
              LOGIN
              <ArrowRight className="h-4 w-4" />
            </Button>

            <p className="text-center text-sm text-text-secondary">
              New to HustleOS?{" "}
              <Link href="/onboarding/account-type" className="font-medium text-blue-bright hover:underline">
                Create an account
              </Link>
            </p>
          </form>

          <div className="mt-8 rounded-2xl border border-dashed border-border-subtle bg-bg-secondary/60 p-4">
            <p className="text-sm font-medium text-text-primary">Try a demo account</p>
            <p className="mt-1 text-xs text-text-secondary">
              Pre-loaded with sample projects, jobs and income. Tap one to fill the form, then press Login.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => fillDemo(DEMO_HUSTLER_EMAIL, DEMO_HUSTLER_PASSWORD)}
                className="flex items-center gap-2 rounded-xl border border-border-subtle bg-bg-card px-3 py-2.5 text-left text-sm hover:border-blue-primary/60">
                <Rocket className="h-4 w-4 shrink-0 text-blue-soft" />
                <span>
                  <span className="block font-medium text-text-primary">Demo Hustler</span>
                  <span className="block text-xs text-text-secondary">{DEMO_HUSTLER_EMAIL}</span>
                </span>
              </button>
              <button type="button" onClick={() => fillDemo(DEMO_OWNER_EMAIL, DEMO_OWNER_PASSWORD)}
                className="flex items-center gap-2 rounded-xl border border-border-subtle bg-bg-card px-3 py-2.5 text-left text-sm hover:border-blue-primary/60">
                <Briefcase className="h-4 w-4 shrink-0 text-blue-soft" />
                <span>
                  <span className="block font-medium text-text-primary">Demo Owner</span>
                  <span className="block text-xs text-text-secondary">{DEMO_OWNER_EMAIL}</span>
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </PageContainer>

      <Modal open={forgotOpen} onClose={() => setForgotOpen(false)} title="Forgot password?">
        <p className="text-sm text-text-secondary">
          Password recovery isn&apos;t available yet in this preview build of HustleOS — it will arrive once
          accounts are backed by a real server. For now, hang onto the password you registered with.
        </p>
        <Button className="mt-5" fullWidth onClick={() => setForgotOpen(false)}>
          Got it
        </Button>
      </Modal>
    </div>
  );
}
