"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowRight, Rocket, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/layout/PageContainer";
import { useAuthStore } from "@/lib/store/auth";
import { useHydrated } from "@/hooks/useHydrated";

const schema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name."),
    age: z
      .string()
      .min(1, "Age is required.")
      .refine((v) => Number(v) >= 13 && Number(v) <= 100, { message: "Age must be between 13 and 100." }),
    gender: z.string().min(1, "Please select a gender."),
    email: z.string().trim().email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const hydrated = useHydrated();
  const pendingRole = useAuthStore((s) => s.pendingRole);
  const registerAccount = useAuthStore((s) => s.register);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (hydrated && !pendingRole) router.replace("/onboarding/account-type");
  }, [hydrated, pendingRole, router]);

  async function onSubmit(values: FormValues) {
    const result = registerAccount({
      name: values.name,
      age: values.age,
      gender: values.gender,
      email: values.email,
      password: values.password,
    });
    if (!result.success) {
      setError("email", { message: result.error });
      return;
    }
    router.push(pendingRole === "owner" ? "/onboarding/owner" : "/onboarding/hustler");
  }

  if (!hydrated || !pendingRole) return null;

  return (
    <div className="min-h-screen glow-bg py-14">
      <PageContainer narrow>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-7 flex items-center gap-2 text-sm font-medium text-blue-soft">
            {pendingRole === "owner" ? <Briefcase className="h-4 w-4" /> : <Rocket className="h-4 w-4" />}
            Creating a {pendingRole === "owner" ? "Owner" : "Hustler"} account
          </div>

          <h1 className="font-display text-3xl font-bold text-text-primary">Create your account</h1>
          <p className="mt-2 text-text-secondary">
            Just the basics for now — you can build out your profile next.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
            <Input label="Name" required placeholder="Your full name" autoComplete="name"
              error={errors.name?.message} {...register("name")} />

            <div className="grid grid-cols-2 gap-4">
              <Input label="Age" required type="number" inputMode="numeric" placeholder="21"
                error={errors.age?.message} {...register("age")} />
              <Select
                label="Gender"
                required
                placeholder="Select"
                defaultValue=""
                error={errors.gender?.message}
                options={[
                  { value: "female", label: "Female" },
                  { value: "male", label: "Male" },
                  { value: "non-binary", label: "Non-binary" },
                  { value: "prefer-not-to-say", label: "Prefer not to say" },
                ]}
                {...register("gender")}
              />
            </div>

            <Input label="Email" required type="email" placeholder="you@example.com" autoComplete="email"
              error={errors.email?.message} {...register("email")} />
            <Input label="Password" required type="password" placeholder="At least 8 characters"
              autoComplete="new-password" error={errors.password?.message} {...register("password")} />
            <Input label="Confirm Password" required type="password" placeholder="Re-enter your password"
              autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />

            <Button type="submit" size="lg" fullWidth loading={isSubmitting} className="mt-2">
              CREATE ACCOUNT
              <ArrowRight className="h-4 w-4" />
            </Button>

            <p className="text-center text-sm text-text-secondary">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-blue-bright hover:underline">
                Login
              </Link>
            </p>
          </form>
        </motion.div>
      </PageContainer>
    </div>
  );
}
