"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, ClipboardList, Eye, UserCheck, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState, LoadingState } from "@/components/ui/States";
import { HustlerProfileView } from "@/components/hustlers/HustlerProfileView";
import { ownerNav } from "@/components/layout/navConfig";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthStore, useOwnerApplications, useOwnerJobs } from "@/lib/store/auth";
import { useHustlerEntries } from "@/lib/useHustlers";
import { skillMatch, type HustlerEntry } from "@/lib/search";
import { applicationStatusLabels } from "@/lib/labels";
import { displayName, formatDate } from "@/lib/format";
import type { ApplicationStatus } from "@/types";

type Filter = "all" | ApplicationStatus;

export default function ApplicationsPage() {
  const { ready } = useRequireAuth("owner");
  const apps = useOwnerApplications();
  const jobs = useOwnerJobs();
  const entries = useHustlerEntries();
  const updateStatus = useAuthStore((s) => s.updateApplicationStatus);
  const [filter, setFilter] = useState<Filter>("all");
  const [viewing, setViewing] = useState<HustlerEntry | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: apps.length };
    apps.forEach((a) => (c[a.status] = (c[a.status] ?? 0) + 1));
    return c;
  }, [apps]);

  const rows = useMemo(
    () => [...apps].filter((a) => filter === "all" || a.status === filter).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [apps, filter]
  );

  if (!ready) return <LoadingState label="Loading applications…" />;

  return (
    <AppShell items={ownerNav}>
      <PageContainer className="py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          <div className="flex items-center gap-2 text-sm font-medium text-blue-soft"><ClipboardList className="h-4 w-4" />Your pipeline</div>
          <h1 className="mt-2 font-display text-2xl font-bold text-text-primary sm:text-3xl">Applications</h1>
          <p className="mt-1 text-text-secondary">Review who applied, shortlist the best, and hire.</p>

          <div className="mt-6">
            <Tabs<Filter>
              value={filter}
              onChange={setFilter}
              tabs={[
                { value: "all", label: "All", count: counts.all },
                { value: "applied", label: "New", count: counts.applied ?? 0 },
                { value: "shortlisted", label: "Shortlisted", count: counts.shortlisted ?? 0 },
                { value: "hired", label: "Hired", count: counts.hired ?? 0 },
                { value: "invited", label: "Invited", count: counts.invited ?? 0 },
                { value: "rejected", label: "Not selected", count: counts.rejected ?? 0 },
              ]}
            />
          </div>

          <div className="mt-6">
            {rows.length === 0 ? (
              <EmptyState icon={<ClipboardList className="h-5 w-5" />} title="Nothing here yet"
                description="Applications and invitations for your jobs will appear here." />
            ) : (
              <div className="space-y-3">
                {rows.map((a) => {
                  const entry = entries.find((e) => e.user.id === a.hustlerId);
                  const job = jobs.find((j) => j.id === a.jobId);
                  if (!entry || !job) return null;
                  const match = Math.round(skillMatch(job.skills, entry.profile) * 100);
                  return (
                    <Card key={a.id}>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-primary to-blue-dark font-bold text-white">
                            {entry.user.name[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-display font-semibold text-text-primary">{displayName(entry.user.name)}</p>
                            <p className="text-sm text-text-secondary">{entry.profile.designation || entry.profile.occupation}</p>
                            <p className="mt-1 text-xs text-text-secondary">for <span className="font-medium text-text-primary">{job.title}</span> · {formatDate(a.createdAt.slice(0, 10))}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={match >= 50 ? "success" : "neutral"}>{match}% skill match</Badge>
                          <Badge variant={a.status === "hired" ? "success" : a.status === "shortlisted" ? "blue" : a.status === "invited" ? "warning" : "neutral"}>{applicationStatusLabels[a.status]}</Badge>
                        </div>
                      </div>
                      {a.message && <p className="mt-3 rounded-xl bg-bg-secondary/60 p-3 text-sm text-text-secondary">“{a.message}”</p>}
                      <div className="mt-4 flex flex-wrap justify-end gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setViewing(entry)}><Eye className="h-4 w-4" />View profile</Button>
                        {a.status !== "invited" && a.status !== "shortlisted" && a.status !== "hired" && (
                          <Button variant="secondary" size="sm" onClick={() => updateStatus(a.id, "shortlisted")}><UserCheck className="h-4 w-4" />Shortlist</Button>
                        )}
                        {a.status !== "invited" && a.status !== "hired" && (
                          <Button size="sm" onClick={() => updateStatus(a.id, "hired")}><Check className="h-4 w-4" />Hire</Button>
                        )}
                        {a.status !== "invited" && a.status !== "rejected" && a.status !== "hired" && (
                          <Button variant="danger" size="sm" onClick={() => updateStatus(a.id, "rejected")}><X className="h-4 w-4" />Reject</Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </PageContainer>
      <HustlerProfileView entry={viewing} onClose={() => setViewing(null)} />
    </AppShell>
  );
}
