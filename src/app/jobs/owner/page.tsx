"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Briefcase, Building2, CalendarClock, Clock, Pencil, Plus, Trash2, Users, Wallet } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, LoadingState } from "@/components/ui/States";
import { JobForm } from "@/components/jobs/JobForm";
import { ownerNav } from "@/components/layout/navConfig";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthStore, useOwnerApplications, useOwnerJobs } from "@/lib/store/auth";
import { daysFromNow, formatDate, formatPay } from "@/lib/format";
import { jobTypeLabels, workModeLabels } from "@/lib/labels";
import type { Job } from "@/types";

export default function OwnerJobsPage() {
  const { ready, user } = useRequireAuth("owner");
  const jobs = useOwnerJobs();
  const apps = useOwnerApplications();
  const updateJob = useAuthStore((s) => s.updateJob);
  const deleteJob = useAuthStore((s) => s.deleteJob);
  const setJobStatus = useAuthStore((s) => s.setJobStatus);

  const [editing, setEditing] = useState<Job | null>(null);
  const [deleting, setDeleting] = useState<Job | null>(null);

  if (!ready || !user) return <LoadingState label="Loading your jobs…" />;

  return (
    <AppShell items={ownerNav}>
      <PageContainer className="py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-blue-soft"><Briefcase className="h-4 w-4" />Your openings</div>
              <h1 className="mt-2 font-display text-2xl font-bold text-text-primary sm:text-3xl">My Projects</h1>
              <p className="mt-1 text-text-secondary">Everything you&apos;ve posted. Edit, close or remove openings, and see who applied.</p>
            </div>
            <Link href="/jobs/owner/new"><Button><Plus className="h-4 w-4" />Post a project</Button></Link>
          </div>

          <div className="mt-6">
            {jobs.length === 0 ? (
              <EmptyState icon={<Briefcase className="h-5 w-5" />} title="You haven't posted anything yet"
                description="Post your first opening and Hustlers can start applying."
                action={<Link href="/jobs/owner/new"><Button size="sm"><Plus className="h-4 w-4" />Post a project</Button></Link>} />
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {jobs.map((job) => {
                  const count = apps.filter((a) => a.jobId === job.id && a.status !== "invited").length;
                  const left = job.applyBy ? daysFromNow(job.applyBy) : null;
                  return (
                    <Card key={job.id} className="flex flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="font-display text-lg font-semibold text-text-primary">{job.title}</h2>
                          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-text-secondary"><Building2 className="h-3.5 w-3.5" />{job.field}</p>
                        </div>
                        <Badge variant={job.status === "open" ? "success" : "neutral"}>{job.status === "open" ? "Open" : "Closed"}</Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="blue">{jobTypeLabels[job.type]}</Badge>
                        <Badge>{workModeLabels[job.mode]}{job.location ? ` · ${job.location}` : ""}</Badge>
                        <Badge>{job.vacancies} vacanc{job.vacancies === 1 ? "y" : "ies"}</Badge>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm text-text-secondary">{job.description}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {job.skills.map((s) => <span key={s} className="rounded-full bg-black/5 px-2.5 py-1 text-xs text-text-secondary">{s}</span>)}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-text-secondary">
                        <span className="flex items-center gap-1.5 font-medium text-text-primary"><Wallet className="h-3.5 w-3.5" />{formatPay(job)}</span>
                        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{job.duration}</span>
                        {job.applyBy && <span className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" />{left !== null && left < 0 ? "Deadline passed" : `Apply by ${formatDate(job.applyBy)}`}</span>}
                      </div>
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-5">
                        <Link href="/applications/owner" className="flex items-center gap-1.5 text-sm font-medium text-blue-soft hover:underline">
                          <Users className="h-4 w-4" />{count} applicant{count === 1 ? "" : "s"}
                        </Link>
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" onClick={() => setJobStatus(job.id, job.status === "open" ? "closed" : "open")}>
                            {job.status === "open" ? "Close" : "Reopen"}
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => setEditing(job)}><Pencil className="h-3.5 w-3.5" />Edit</Button>
                          <Button variant="danger" size="sm" onClick={() => setDeleting(job)} aria-label={`Delete ${job.title}`}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </PageContainer>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit job" size="xl">
        {editing && (
          <JobForm
            key={editing.id}
            user={user}
            initial={editing}
            submitLabel="Save changes"
            onCancel={() => setEditing(null)}
            onSubmit={(data) => { updateJob(editing.id, data); setEditing(null); }}
          />
        )}
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete this job?">
        <p className="text-sm text-text-secondary">
          This removes <span className="text-text-primary">&quot;{deleting?.title}&quot;</span> and all of its applications. This can&apos;t be undone.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => { if (deleting) deleteJob(deleting.id); setDeleting(null); }}><Trash2 className="h-4 w-4" />Delete</Button>
        </div>
      </Modal>
    </AppShell>
  );
}
