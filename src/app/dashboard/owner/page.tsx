"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Bookmark, Briefcase, ClipboardList, Pencil, Plus, Search, UserCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SearchBar } from "@/components/ui/SearchBar";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState, LoadingState } from "@/components/ui/States";
import { HustlerProfileView } from "@/components/hustlers/HustlerProfileView";
import { ownerNav } from "@/components/layout/navConfig";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useOwnerApplications, useOwnerJobs, useOwnerProfile, useSavedHustlerIds } from "@/lib/store/auth";
import { useHustlerEntries } from "@/lib/useHustlers";
import { skillMatch, type HustlerEntry } from "@/lib/search";
import { applicationStatusLabels } from "@/lib/labels";
import { displayName, formatDate } from "@/lib/format";
import { calcOwnerCompletion } from "@/lib/utils";

const POPULAR = ["graphic designer", "video editor", "React developer", "data analyst", "content writer", "UI/UX"];

export default function OwnerDashboardPage() {
  const { ready, user } = useRequireAuth("owner");
  const profile = useOwnerProfile();
  const jobs = useOwnerJobs();
  const apps = useOwnerApplications();
  const saved = useSavedHustlerIds();
  const entries = useHustlerEntries();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [viewing, setViewing] = useState<HustlerEntry | null>(null);

  useEffect(() => {
    if (ready && !profile) router.replace("/onboarding/owner");
  }, [ready, profile, router]);

  const openJobs = jobs.filter((j) => j.status === "open");
  const latestJob = openJobs[0];

  const suggested = useMemo(() => {
    if (!latestJob) return [];
    return entries
      .map((e) => ({ e, match: skillMatch(latestJob.skills, e.profile) }))
      .filter((x) => x.match > 0)
      .sort((a, b) => b.match - a.match)
      .slice(0, 3);
  }, [entries, latestJob]);

  if (!ready || !profile) return <LoadingState label="Loading your dashboard…" />;

  const completion = calcOwnerCompletion(profile);
  const recent = [...apps].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);

  function search(e?: FormEvent) {
    e?.preventDefault();
    router.push(`/find/owner${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
  }

  return (
    <AppShell items={ownerNav}>
      <PageContainer className="py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          <h1 className="font-display text-2xl font-bold text-text-primary sm:text-3xl">Welcome back, {user?.name?.split(" ")[0]}.</h1>
          <p className="mt-1 text-text-secondary">{[profile.companyName, profile.industry].filter(Boolean).join(" · ") || "Finish your company profile to get started."}</p>

          <Card className="mt-6">
            <h2 className="font-display font-semibold text-text-primary">Who do you need today?</h2>
            <SearchBar className="mt-3" value={query} onChange={setQuery} onSubmit={search}
              placeholder='Search Hustlers — try "graphic designer" or "React"' />
            <div className="mt-3 flex flex-wrap gap-2">
              {POPULAR.map((p) => (
                <button key={p} type="button" onClick={() => router.push(`/find/owner?q=${encodeURIComponent(p)}`)}
                  className="rounded-full border border-border-subtle bg-bg-card px-3 py-1 text-xs font-medium text-text-secondary hover:border-blue-primary/50 hover:text-blue-soft">
                  {p}
                </button>
              ))}
            </div>
          </Card>

          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Open jobs" value={openJobs.length} hint={`${jobs.length} posted in total`} icon={<Briefcase className="h-4 w-4" />} />
            <StatCard label="Applications" value={apps.length} hint="Across all your jobs" icon={<ClipboardList className="h-4 w-4" />} />
            <StatCard label="Shortlisted" value={apps.filter((a) => a.status === "shortlisted").length} icon={<UserCheck className="h-4 w-4" />} />
            <StatCard label="Saved Hustlers" value={saved.length} icon={<Bookmark className="h-4 w-4" />} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold text-text-primary">Recent applications</h2>
                <Link href="/applications/owner" className="text-sm font-medium text-blue-soft hover:underline">See all</Link>
              </div>
              {recent.length === 0 ? (
                <div className="mt-4">
                  <EmptyState icon={<ClipboardList className="h-5 w-5" />} title="No applications yet"
                    description="Post a job and Hustlers can apply, or invite them directly."
                    action={<Link href="/jobs/owner/new"><Button size="sm"><Plus className="h-4 w-4" />Post a job</Button></Link>} />
                </div>
              ) : (
                <ul className="mt-4 divide-y divide-border-subtle">
                  {recent.map((a) => {
                    const entry = entries.find((e) => e.user.id === a.hustlerId);
                    const job = jobs.find((j) => j.id === a.jobId);
                    return (
                      <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-text-primary">{entry ? displayName(entry.user.name) : "Hustler"} → {job?.title}</p>
                          <p className="text-xs text-text-secondary">{formatDate(a.createdAt.slice(0, 10))}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={a.status === "hired" ? "success" : a.status === "shortlisted" ? "blue" : "neutral"}>{applicationStatusLabels[a.status]}</Badge>
                          {entry && <Button variant="secondary" size="sm" onClick={() => setViewing(entry)}>View</Button>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold text-text-primary">Company profile</h2>
                <Badge variant={completion === 100 ? "success" : "blue"}>{completion}%</Badge>
              </div>
              <div className="mt-4"><ProgressBar value={completion} showPercentage={false} /></div>
              <p className="mt-3 line-clamp-3 text-sm text-text-secondary">{profile.description || "Add a short description to finish setting up."}</p>
              <Link href="/profile/owner" className="mt-4 inline-block">
                <Button variant="secondary" size="sm"><Pencil className="h-3.5 w-3.5" />Edit profile</Button>
              </Link>
            </Card>
          </div>

          <Card className="mt-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-text-primary">
                {latestJob ? `Suggested for “${latestJob.title}”` : "Suggested Hustlers"}
              </h2>
              <Link href="/find/owner" className="flex items-center gap-1 text-sm font-medium text-blue-soft hover:underline">Browse all <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
            {suggested.length === 0 ? (
              <div className="mt-4">
                <EmptyState icon={<Search className="h-5 w-5" />} title={latestJob ? "No skill matches yet" : "Post a job to get suggestions"}
                  description="We match your job's required skills with Hustler profiles." />
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                {suggested.map(({ e, match }) => (
                  <button key={e.user.id} type="button" onClick={() => setViewing(e)}
                    className="rounded-xl border border-border-subtle p-4 text-left transition-colors hover:border-blue-primary/50 hover:bg-bg-card-hover">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-text-primary">{displayName(e.user.name)}</p>
                      <Badge variant="success">{Math.round(match * 100)}% match</Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-text-secondary">{e.profile.designation || e.profile.occupation}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {e.profile.skills.slice(0, 3).map((s) => <span key={s} className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] text-text-secondary">{s}</span>)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </PageContainer>
      <HustlerProfileView entry={viewing} onClose={() => setViewing(null)} />
    </AppShell>
  );
}
