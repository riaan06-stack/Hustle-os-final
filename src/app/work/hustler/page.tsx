"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, CalendarClock, Check, Clock, Compass, Mail, MapPin, Phone, Search, Users, Wallet, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { SearchBar } from "@/components/ui/SearchBar";
import { Tabs } from "@/components/ui/Tabs";
import { Textarea } from "@/components/ui/Textarea";
import { EmptyState } from "@/components/ui/States";
import { hustlerNav } from "@/components/layout/navConfig";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthStore, useHustlerProfile, useMyApplications } from "@/lib/store/auth";
import { searchJobs, skillMatch } from "@/lib/search";
import { daysFromNow, formatDate, formatPay } from "@/lib/format";
import { applicationStatusLabels, jobTypeLabels, workModeLabels } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { Application, Job } from "@/types";

type Tab = "all" | "invites" | "applications";

const statusVariant = (s: string) =>
  s === "hired" ? "success" : s === "shortlisted" ? "blue" : s === "rejected" ? "neutral" : s === "invited" ? "warning" : "blue";

export default function DiscoverWorkPage() {
  const { ready } = useRequireAuth("hustler");
  const profile = useHustlerProfile();
  const jobs = useAuthStore((s) => s.jobs);
  const ownerProfiles = useAuthStore((s) => s.ownerProfiles);
  const applyToJob = useAuthStore((s) => s.applyToJob);
  const respondToInvite = useAuthStore((s) => s.respondToInvite);
  const myApps = useMyApplications();

  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [bestMatch, setBestMatch] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const appFor = (jobId: string): Application | undefined => myApps.find((a) => a.jobId === jobId);
  const openJobs = useMemo(() => jobs.filter((j) => j.status === "open"), [jobs]);

  const results = useMemo(() => {
    let rows = searchJobs(openJobs, (id) => ownerProfiles[id], query);
    if (typeFilter !== "all") rows = rows.filter((r) => r.job.type === typeFilter);
    if (modeFilter !== "all") rows = rows.filter((r) => r.job.mode === modeFilter);
    const withMatch = rows.map((r) => ({ ...r, match: profile ? skillMatch(r.job.skills, profile) : 0 }));
    if (bestMatch) withMatch.sort((a, b) => b.match - a.match);
    else if (!query.trim()) withMatch.sort((a, b) => b.job.createdAt.localeCompare(a.job.createdAt));
    return withMatch;
  }, [openJobs, ownerProfiles, query, typeFilter, modeFilter, bestMatch, profile]);

  const invites = myApps.filter((a) => a.status === "invited");
  const applied = myApps.filter((a) => a.status !== "invited");
  const selected = selectedId ? jobs.find((j) => j.id === selectedId) ?? null : null;
  const selectedApp = selected ? appFor(selected.id) : undefined;
  const company = selected ? ownerProfiles[selected.ownerId] : undefined;

  if (!ready) return null;

  function openJob(job: Job) {
    setMessage("");
    setSelectedId(job.id);
  }

  function JobRow({ job, match, matched }: { job: Job; match: number; matched?: string[] }) {
    const app = appFor(job.id);
    const co = ownerProfiles[job.ownerId];
    const left = job.applyBy ? daysFromNow(job.applyBy) : null;
    const mine = profile?.skills.map((s) => s.toLowerCase()) ?? [];
    return (
      <Card interactive onClick={() => openJob(job)} className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-text-primary">{job.title}</h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-text-secondary">
              <Building2 className="h-3.5 w-3.5" />
              {co?.companyName ?? "Company"}
            </p>
          </div>
          {app ? (
            <Badge variant={statusVariant(app.status)}>{applicationStatusLabels[app.status]}</Badge>
          ) : profile ? (
            <Badge variant={match >= 0.5 ? "success" : "neutral"}>{Math.round(match * 100)}% match</Badge>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="blue">{jobTypeLabels[job.type]}</Badge>
          <Badge>{workModeLabels[job.mode]}{job.location ? ` · ${job.location}` : ""}</Badge>
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-text-secondary">{job.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.skills.map((s) => (
            <span key={s} className={cn("rounded-full px-2.5 py-1 text-xs", mine.some((m) => m.includes(s.toLowerCase()) || s.toLowerCase().includes(m)) ? "bg-blue-primary/15 font-medium text-blue-soft" : "bg-black/5 text-text-secondary")}>
              {s}
            </span>
          ))}
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4 text-xs text-text-secondary">
          <span className="flex items-center gap-1.5 font-medium text-text-primary"><Wallet className="h-3.5 w-3.5" />{formatPay(job)}</span>
          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{job.duration}</span>
          {left !== null && <span className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" />{left < 0 ? "Closed" : left === 0 ? "Last day" : `${left}d left`}</span>}
        </div>
        {matched && matched.length > 0 && query.trim() && (
          <p className="mt-2 text-[11px] text-text-secondary">Matched on: {matched.join(", ")}</p>
        )}
      </Card>
    );
  }

  return (
    <AppShell items={hustlerNav}>
      <PageContainer className="py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          <div className="flex items-center gap-2 text-sm font-medium text-blue-soft"><Compass className="h-4 w-4" />Find your next gig</div>
          <h1 className="mt-2 font-display text-2xl font-bold text-text-primary sm:text-3xl">Discover Work</h1>
          <p className="mt-1 text-text-secondary">Search jobs posted by Owners, apply in one tap, and track every application.</p>

          <div className="mt-6">
            <Tabs<Tab>
              value={tab}
              onChange={setTab}
              tabs={[
                { value: "all", label: "All jobs", count: openJobs.length },
                { value: "invites", label: "Invitations", count: invites.length },
                { value: "applications", label: "My applications", count: applied.length },
              ]}
            />
          </div>

          {tab === "all" && (
            <>
              <SearchBar className="mt-5" value={query} onChange={setQuery}
                placeholder='Search jobs — try "graphic designer", "React", "remote video editor"' />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {[["all", "All types"], ...Object.entries(jobTypeLabels)].map(([v, l]) => (
                  <button key={v} onClick={() => setTypeFilter(v)}
                    className={cn("rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                      typeFilter === v ? "border-blue-primary bg-blue-primary/12 text-blue-soft" : "border-border-subtle text-text-secondary hover:border-blue-primary/40")}>
                    {l}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {[["all", "Any mode"], ...Object.entries(workModeLabels)].map(([v, l]) => (
                  <button key={v} onClick={() => setModeFilter(v)}
                    className={cn("rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                      modeFilter === v ? "border-blue-primary bg-blue-primary/12 text-blue-soft" : "border-border-subtle text-text-secondary hover:border-blue-primary/40")}>
                    {l}
                  </button>
                ))}
                <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
                  <input type="checkbox" checked={bestMatch} onChange={(e) => setBestMatch(e.target.checked)} className="h-4 w-4 accent-[var(--blue-primary)]" />
                  Best match for my skills
                </label>
              </div>

              <p className="mt-4 text-sm text-text-secondary">{results.length} job{results.length === 1 ? "" : "s"} found</p>
              <div className="mt-3">
                {results.length === 0 ? (
                  <EmptyState icon={<Search className="h-5 w-5" />} title="No jobs match your search"
                    description="Try a broader search like “design” or clear the filters." />
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {results.map((r) => <JobRow key={r.job.id} job={r.job} match={r.match} matched={r.matched} />)}
                  </div>
                )}
              </div>
            </>
          )}

          {tab === "invites" && (
            <div className="mt-6">
              {invites.length === 0 ? (
                <EmptyState icon={<Mail className="h-5 w-5" />} title="No invitations yet"
                  description="When an Owner invites you to apply, it shows up here. A complete profile and portfolio gets you noticed." />
              ) : (
                <div className="space-y-3">
                  {invites.map((a) => {
                    const job = jobs.find((j) => j.id === a.jobId);
                    if (!job) return null;
                    return (
                      <Card key={a.id} className="flex flex-wrap items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-display font-semibold text-text-primary">{job.title}</p>
                          <p className="text-sm text-text-secondary">{ownerProfiles[job.ownerId]?.companyName} invited you · {formatPay(job)} · {job.duration}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" onClick={() => openJob(job)}>View job</Button>
                          <Button variant="secondary" size="sm" onClick={() => respondToInvite(a.id, false)}><X className="h-4 w-4" />Decline</Button>
                          <Button size="sm" onClick={() => respondToInvite(a.id, true)}><Check className="h-4 w-4" />Accept &amp; apply</Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === "applications" && (
            <div className="mt-6">
              {applied.length === 0 ? (
                <EmptyState icon={<Users className="h-5 w-5" />} title="You haven't applied yet" description="Find a job you like and press Apply." />
              ) : (
                <div className="space-y-3">
                  {applied.map((a) => {
                    const job = jobs.find((j) => j.id === a.jobId);
                    if (!job) return null;
                    return (
                      <Card key={a.id} interactive onClick={() => openJob(job)} className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-display font-semibold text-text-primary">{job.title}</p>
                          <p className="text-sm text-text-secondary">{ownerProfiles[job.ownerId]?.companyName} · Applied {formatDate(a.createdAt.slice(0, 10))}</p>
                        </div>
                        <Badge variant={statusVariant(a.status)}>{applicationStatusLabels[a.status]}</Badge>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </PageContainer>

      <Modal open={!!selected} onClose={() => setSelectedId(null)} title={selected?.title} size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-sm text-text-secondary">
                <Building2 className="h-4 w-4" />
                <span className="font-medium text-text-primary">{company?.companyName ?? "Company"}</span>
                {company?.industry && <span>· {company.industry}</span>}
              </p>
              {selectedApp && <Badge variant={statusVariant(selectedApp.status)}>{applicationStatusLabels[selectedApp.status]}</Badge>}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Pay", formatPay(selected)],
                ["Time period", selected.duration],
                ["Type", jobTypeLabels[selected.type]],
                ["Vacancies", String(selected.vacancies)],
                ["Work mode", `${workModeLabels[selected.mode]}${selected.location ? ` · ${selected.location}` : ""}`],
                ["Apply by", selected.applyBy ? formatDate(selected.applyBy) : "Open"],
                ["Category", selected.field],
                ["Posted", formatDate(selected.createdAt.slice(0, 10))],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-border-subtle bg-bg-secondary/50 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">{k}</p>
                  <p className="mt-1 text-sm font-semibold text-text-primary">{v}</p>
                </div>
              ))}
            </div>

            <section>
              <h4 className="mb-1.5 text-sm font-semibold text-text-primary">About the work</h4>
              <p className="text-sm text-text-secondary">{selected.description}</p>
            </section>
            <section>
              <h4 className="mb-2 text-sm font-semibold text-text-primary">Skills required</h4>
              <div className="flex flex-wrap gap-2">{selected.skills.map((s) => <Badge key={s} variant="blue">{s}</Badge>)}</div>
            </section>

            {selected.showContact && (selected.contactEmail || selected.contactPhone) && (
              <section className="rounded-xl border border-border-subtle p-4">
                <h4 className="mb-2 text-sm font-semibold text-text-primary">Contact</h4>
                <div className="space-y-1.5 text-sm text-text-secondary">
                  {selected.contactName && <p className="font-medium text-text-primary">{selected.contactName}</p>}
                  {selected.contactEmail && <p className="flex items-center gap-2"><Mail className="h-4 w-4" /><a className="hover:text-blue-soft" href={`mailto:${selected.contactEmail}`}>{selected.contactEmail}</a></p>}
                  {selected.contactPhone && <p className="flex items-center gap-2"><Phone className="h-4 w-4" /><a className="hover:text-blue-soft" href={`tel:${selected.contactPhone}`}>{selected.contactPhone}</a></p>}
                  {selected.mode !== "remote" && selected.location && <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{selected.location}</p>}
                </div>
              </section>
            )}

            <AnimatePresence mode="wait">
              {!selectedApp || selectedApp.status === "invited" ? (
                <motion.div key="apply" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  {selectedApp?.status === "invited" && (
                    <p className="rounded-xl bg-yellow/15 px-3 py-2 text-sm text-text-primary">The Owner invited you to apply for this job.</p>
                  )}
                  <Textarea label="Message to the Owner (optional)" rows={3} placeholder="Why are you a good fit?" value={message} onChange={(e) => setMessage(e.target.value)} />
                  <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={() => setSelectedId(null)}>Close</Button>
                    <Button onClick={() => { applyToJob(selected.id, message.trim() || undefined); setMessage(""); }}>Apply now</Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="applied" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
                  <span className="flex items-center gap-2 font-medium"><Check className="h-4 w-4" />You applied for this job. Status: {applicationStatusLabels[selectedApp.status]}.</span>
                  {selectedApp.message && <p className="mt-1 text-text-secondary">Your message: {selectedApp.message}</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
