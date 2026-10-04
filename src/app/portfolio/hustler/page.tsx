"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookImage, Clock, ExternalLink, Eye, EyeOff, FileText, GitBranch, Pencil } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState, LoadingState } from "@/components/ui/States";
import { ResumePreview } from "@/components/hustlers/ResumePreview";
import { hustlerNav } from "@/components/layout/navConfig";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthStore, useHustlerProfile, useHustlerProjects, useMyWorkLogs } from "@/lib/store/auth";
import { availabilityLabels } from "@/lib/labels";
import { cn } from "@/lib/utils";

export default function PortfolioPage() {
  const { ready, user } = useRequireAuth("hustler");
  const profile = useHustlerProfile();
  const projects = useHustlerProjects();
  const logs = useMyWorkLogs();
  const togglePortfolio = useAuthStore((s) => s.toggleProjectPortfolio);
  const [resumeOpen, setResumeOpen] = useState(false);

  const visible = useMemo(() => projects.filter((p) => p.inPortfolio ?? p.status !== "pending"), [projects]);
  const totalHours = useMemo(() => logs.reduce((s, l) => s + l.hours, 0), [logs]);

  if (!ready || !profile) return <LoadingState label="Loading your portfolio…" />;

  return (
    <AppShell items={hustlerNav}>
      <PageContainer className="py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-blue-soft"><BookImage className="h-4 w-4" />What Owners see</div>
              <h1 className="mt-2 font-display text-2xl font-bold text-text-primary sm:text-3xl">Portfolio</h1>
              <p className="mt-1 text-text-secondary">Choose which projects to show off. Owners can view them from your public profile.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setResumeOpen(true)}><FileText className="h-4 w-4" />Preview resume</Button>
              <Link href="/profile/hustler"><Button variant="secondary"><Pencil className="h-4 w-4" />Edit profile</Button></Link>
            </div>
          </div>

          <Card className="mt-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-primary to-blue-dark text-xl font-bold text-white">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-xl font-semibold text-text-primary">{user?.name}</h2>
                <p className="text-sm text-text-secondary">{profile.designation || profile.occupation || "Add your designation"}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {profile.skills.slice(0, 6).map((s) => <Badge key={s} variant="blue">{s}</Badge>)}
                </div>
              </div>
              <div className="text-right text-sm text-text-secondary">
                <p>{availabilityLabels[profile.availability] ?? profile.availability}</p>
                <p className="font-medium text-text-primary">{profile.expectedRate}</p>
              </div>
            </div>
            {profile.bio && <p className="mt-4 text-sm text-text-secondary">{profile.bio}</p>}
          </Card>

          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Shown to Owners" value={visible.length} hint={`of ${projects.length} projects`} icon={<Eye className="h-4 w-4" />} />
            <StatCard label="Completed" value={projects.filter((p) => p.status === "completed").length} hint="Finished projects" />
            <StatCard label="Hours logged" value={`${totalHours}h`} hint="Across all projects" icon={<Clock className="h-4 w-4" />} />
            <StatCard label="Resume" value={profile.resumeFileName ? "Ready" : "Auto"} hint={profile.resumeFileName ?? "Generated from your profile"} icon={<FileText className="h-4 w-4" />} />
          </div>

          <h2 className="mt-8 font-display text-lg font-semibold text-text-primary">Your projects</h2>
          {projects.length === 0 ? (
            <div className="mt-4">
              <EmptyState icon={<BookImage className="h-5 w-5" />} title="No projects yet"
                description="Add projects on the My Projects page, then choose which ones appear here."
                action={<Link href="/projects/hustler"><Button size="sm">Go to My Projects</Button></Link>} />
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((p) => {
                const shown = p.inPortfolio ?? p.status !== "pending";
                const hours = logs.filter((l) => l.projectId === p.id).reduce((s, l) => s + l.hours, 0);
                return (
                  <Card key={p.id} className={cn("flex flex-col transition-opacity", !shown && "opacity-70")}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-text-primary">{p.title}</p>
                        <p className="text-sm text-text-secondary">for {p.clientName}</p>
                      </div>
                      <Badge variant={p.status === "completed" ? "success" : p.status === "active" ? "blue" : "warning"}>
                        {p.status === "completed" ? "Completed" : p.status === "active" ? "Active" : "Pending"}
                      </Badge>
                    </div>
                    {p.description && <p className="mt-3 line-clamp-3 text-sm text-text-secondary">{p.description}</p>}
                    {p.status !== "completed" && <ProgressBar className="mt-3" value={p.progress} label="Progress" />}
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-text-secondary">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{hours}h</span>
                      {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-soft"><GitBranch className="h-3.5 w-3.5" />Code</a>}
                      {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-soft"><ExternalLink className="h-3.5 w-3.5" />Live</a>}
                    </div>
                    <div className="mt-auto pt-4">
                      <Button variant={shown ? "secondary" : "primary"} size="sm" onClick={() => togglePortfolio(p.id)}>
                        {shown ? <><EyeOff className="h-4 w-4" />Hide from Owners</> : <><Eye className="h-4 w-4" />Show to Owners</>}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </motion.div>
      </PageContainer>

      <Modal open={resumeOpen} onClose={() => setResumeOpen(false)} title="Resume preview" size="lg">
        <p className="mb-3 text-xs text-text-secondary">Generated from your profile and the projects you&apos;ve chosen to show.</p>
        <ResumePreview name={user?.name ?? ""} email={user?.email} profile={profile} projects={visible} />
      </Modal>
    </AppShell>
  );
}
