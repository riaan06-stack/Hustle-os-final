"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight, BookImage, CalendarDays, Clock, Compass, FolderKanban, Mail, Pencil, Sparkles, Wallet,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState, LoadingState } from "@/components/ui/States";
import { hustlerNav } from "@/components/layout/navConfig";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import {
  useAuthStore, useHustlerProfile, useHustlerProjects, useMyApplications, useMyEvents, useMyIncomes, useMyWorkLogs,
} from "@/lib/store/auth";
import { calcHustlerCompletion, hustlerCompletionTagline } from "@/lib/utils";
import { daysFromNow, formatDate, formatINR, formatPay, monthKey, parseDate } from "@/lib/format";
import { skillMatch } from "@/lib/search";
import { availabilityLabels, jobTypeLabels } from "@/lib/labels";

export default function HustlerDashboardPage() {
  const { ready, user } = useRequireAuth("hustler");
  const profile = useHustlerProfile();
  const projects = useHustlerProjects();
  const logs = useMyWorkLogs();
  const incomes = useMyIncomes();
  const events = useMyEvents();
  const myApps = useMyApplications();
  const jobs = useAuthStore((s) => s.jobs);
  const ownerProfiles = useAuthStore((s) => s.ownerProfiles);
  const router = useRouter();

  useEffect(() => {
    if (ready && !profile) router.replace("/onboarding/hustler");
  }, [ready, profile, router]);

  const thisMonth = monthKey(new Date());
  const stats = useMemo(() => {
    const hours = logs.filter((l) => parseDate(l.date) && monthKey(parseDate(l.date)!) === thisMonth).reduce((s, l) => s + l.hours, 0);
    const income = incomes.filter((i) => parseDate(i.date) && monthKey(parseDate(i.date)!) === thisMonth).reduce((s, i) => s + i.amount, 0);
    return { hours, income, active: projects.filter((p) => p.status === "active").length };
  }, [logs, incomes, projects, thisMonth]);

  const upcoming = useMemo(() => {
    const rows: { id: string; title: string; date: string; kind: string; days: number }[] = [];
    projects.forEach((p) => {
      if (p.deadline && p.status !== "completed") {
        const days = daysFromNow(p.deadline);
        if (days !== null && days >= 0) rows.push({ id: p.id, title: p.title, date: p.deadline, kind: "Deadline", days });
      }
    });
    events.forEach((e) => {
      const days = daysFromNow(e.date);
      if (days !== null && days >= 0) rows.push({ id: e.id, title: e.title, date: e.date, kind: "Event", days });
    });
    return rows.sort((a, b) => a.days - b.days).slice(0, 4);
  }, [projects, events]);

  const recommended = useMemo(() => {
    if (!profile) return [];
    const applied = new Set(myApps.map((a) => a.jobId));
    return jobs
      .filter((j) => j.status === "open" && !applied.has(j.id))
      .map((j) => ({ job: j, match: skillMatch(j.skills, profile) }))
      .sort((a, b) => b.match - a.match || b.job.createdAt.localeCompare(a.job.createdAt))
      .slice(0, 3);
  }, [jobs, myApps, profile]);

  if (!ready || !profile) return <LoadingState label="Loading your dashboard…" />;

  const completion = calcHustlerCompletion(profile);
  const tagline = hustlerCompletionTagline(completion);
  const invites = myApps.filter((a) => a.status === "invited").length;

  return (
    <AppShell items={hustlerNav}>
      <PageContainer className="py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          <h1 className="font-display text-2xl font-bold text-text-primary sm:text-3xl">
            Welcome back, {user?.name?.split(" ")[0]}.
          </h1>
          <p className="mt-1 text-text-secondary">Here&apos;s where your hustle stands today.</p>

          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Active projects" value={stats.active} hint={`${projects.length} in total`} icon={<FolderKanban className="h-4 w-4" />} />
            <StatCard label="Hours this month" value={`${stats.hours}h`} hint="Logged on projects" icon={<Clock className="h-4 w-4" />} />
            <StatCard label="Income this month" value={formatINR(stats.income)} hint="From your income log" icon={<Wallet className="h-4 w-4" />} />
            <Link href="/work/hustler" className="block">
              <StatCard label="Invitations" value={invites} hint={invites ? "Owners want you to apply" : "None right now"} icon={<Mail className="h-4 w-4" />} className="h-full transition-colors hover:border-blue-primary/50" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold text-text-primary">Profile completion</h2>
                <Badge variant={tagline ? "success" : "blue"}>{tagline ? "Nearly there" : "In progress"}</Badge>
              </div>
              <div className="mt-5"><ProgressBar value={completion} label="Your Hustle Profile" /></div>
              {tagline && (
                <p className="mt-3 flex items-center gap-1.5 text-sm text-blue-soft">
                  <Sparkles className="h-3.5 w-3.5" />
                  {tagline}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-text-secondary">
                  {profile.designation || profile.field
                    ? [profile.designation, profile.field].filter(Boolean).join(" · ")
                    : "Add your occupation and field to finish setting up."}
                </p>
                <Link href="/profile/hustler">
                  <Button variant="secondary" size="sm"><Pencil className="h-3.5 w-3.5" />Edit profile</Button>
                </Link>
              </div>
            </Card>

            <Link href="/wrapped/hustler" className="group block">
              <div className="relative h-full overflow-hidden rounded-2xl bg-gradient-to-br from-blue-dark via-blue-bright to-yellow p-5 text-white">
                <Sparkles className="h-5 w-5 opacity-90" />
                <p className="mt-6 font-display text-xl font-bold leading-tight">Your Hustle Wrapped</p>
                <p className="mt-1 text-sm text-white/85">See which projects you worked on most and your peak month.</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium">
                  Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold text-text-primary">Coming up</h2>
                <Link href="/calendar/hustler" className="text-sm font-medium text-blue-soft hover:underline">Calendar</Link>
              </div>
              {upcoming.length === 0 ? (
                <EmptyState className="mt-4" icon={<CalendarDays className="h-5 w-5" />} title="Nothing scheduled"
                  description="Project deadlines and events you add will appear here." />
              ) : (
                <ul className="mt-4 space-y-3">
                  {upcoming.map((u) => (
                    <li key={u.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-primary">{u.title}</p>
                        <p className="text-xs text-text-secondary">{u.kind} · {formatDate(u.date)}</p>
                      </div>
                      <Badge variant={u.days <= 3 ? "warning" : "neutral"}>{u.days === 0 ? "Today" : `${u.days}d`}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold text-text-primary">Recommended for you</h2>
                <Link href="/work/hustler" className="text-sm font-medium text-blue-soft hover:underline">Discover work</Link>
              </div>
              {recommended.length === 0 ? (
                <EmptyState className="mt-4" icon={<Compass className="h-5 w-5" />} title="No open jobs right now"
                  description="New jobs from Owners will show up here." />
              ) : (
                <ul className="mt-4 space-y-3">
                  {recommended.map(({ job, match }) => (
                    <li key={job.id}>
                      <Link href="/work/hustler" className="flex items-center justify-between gap-3 rounded-xl p-2 hover:bg-black/5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-text-primary">{job.title}</p>
                          <p className="truncate text-xs text-text-secondary">
                            {ownerProfiles[job.ownerId]?.companyName ?? "Company"} · {jobTypeLabels[job.type]} · {formatPay(job)}
                          </p>
                        </div>
                        <Badge variant={match >= 0.5 ? "success" : "neutral"}>{Math.round(match * 100)}% match</Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card>
              <h2 className="font-display font-semibold text-text-primary">Skills</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.skills.length > 0
                  ? profile.skills.map((s) => <Badge key={s} variant="blue">{s}</Badge>)
                  : <p className="text-sm text-text-secondary">No skills added yet.</p>}
              </div>
            </Card>
            <Card>
              <h2 className="font-display font-semibold text-text-primary">Availability</h2>
              <p className="mt-4 text-sm text-text-secondary">
                {profile.availability || profile.expectedRate ? (
                  <>
                    {availabilityLabels[profile.availability] ?? (profile.availability || "Not set")} · Rate:{" "}
                    <span className="text-text-primary">{profile.expectedRate || "Not set"}</span>
                  </>
                ) : "Add your availability and rate to finish setting up."}
              </p>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold text-text-primary">Portfolio</h2>
                <BookImage className="h-4 w-4 text-blue-soft" />
              </div>
              <p className="mt-4 text-sm text-text-secondary">
                {projects.filter((p) => p.inPortfolio ?? p.status !== "pending").length} project(s) shown to Owners.
              </p>
              <Link href="/portfolio/hustler" className="mt-3 inline-block">
                <Button variant="secondary" size="sm">Open portfolio <ArrowRight className="h-3.5 w-3.5" /></Button>
              </Link>
            </Card>
          </div>
        </motion.div>
      </PageContainer>
    </AppShell>
  );
}
