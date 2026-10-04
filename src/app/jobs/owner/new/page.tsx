"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, FilePlus2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { JobForm } from "@/components/jobs/JobForm";
import { LoadingState } from "@/components/ui/States";
import { ownerNav } from "@/components/layout/navConfig";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthStore } from "@/lib/store/auth";

export default function PostJobPage() {
  const { ready, user } = useRequireAuth("owner");
  const addJob = useAuthStore((s) => s.addJob);
  const updateUser = useAuthStore((s) => s.updateUser);
  const router = useRouter();

  if (!ready || !user) return <LoadingState label="Loading…" />;

  return (
    <AppShell items={ownerNav}>
      <PageContainer className="max-w-3xl py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          <Link href="/jobs/owner" className="mb-4 inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary">
            <ArrowLeft className="h-4 w-4" />Back to my jobs
          </Link>
          <div className="flex items-center gap-2 text-sm font-medium text-blue-soft"><FilePlus2 className="h-4 w-4" />New opening</div>
          <h1 className="mt-2 font-display text-2xl font-bold text-text-primary sm:text-3xl">Post a Project</h1>
          <p className="mt-1 text-text-secondary">Describe the work, time period, pay and vacancies. Hustlers can then find and apply.</p>

          <div className="mt-6 rounded-2xl border border-border-subtle bg-bg-card/60 p-5 sm:p-7">
            <JobForm
              user={user}
              submitLabel="Publish job"
              onCancel={() => router.push("/jobs/owner")}
              onSubmit={(data) => {
                if (data.contactPhone && !user.phone) updateUser({ phone: data.contactPhone });
                addJob(data);
                router.push("/jobs/owner");
              }}
            />
          </div>
        </motion.div>
      </PageContainer>
    </AppShell>
  );
}
