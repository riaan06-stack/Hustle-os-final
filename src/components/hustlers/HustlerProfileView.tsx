"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck, ExternalLink, FileText, GitBranch, GraduationCap, Send, ShieldCheck } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ResumePreview } from "./ResumePreview";
import type { HustlerEntry } from "@/lib/search";
import { useAuthStore, useOwnerJobs, useSavedHustlerIds } from "@/lib/store/auth";
import { availabilityLabels, educationLabels, experienceLabels } from "@/lib/labels";
import { displayName } from "@/lib/format";
import { calcHustlerCompletion } from "@/lib/utils";

/**
 * What an Owner sees of a Hustler. Only public professional information is
 * shown: email, age and gender are never displayed.
 */
export function HustlerProfileView({
  entry,
  onClose,
}: {
  entry: HustlerEntry | null;
  onClose: () => void;
}) {
  const jobs = useOwnerJobs();
  const savedIds = useSavedHustlerIds();
  const toggleSaved = useAuthStore((s) => s.toggleSavedHustler);
  const inviteHustler = useAuthStore((s) => s.inviteHustler);
  const applications = useAuthStore((s) => s.applications);

  const [resumeOpen, setResumeOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [jobId, setJobId] = useState("");
  const [inviteMsg, setInviteMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const openJobs = jobs.filter((j) => j.status === "open");
  const saved = entry ? savedIds.includes(entry.user.id) : false;
  const portfolio = entry ? entry.projects.filter((p) => p.inPortfolio ?? p.status !== "pending") : [];

  function sendInvite() {
    if (!entry || !jobId) return;
    const res = inviteHustler(jobId, entry.user.id);
    setInviteMsg(res.success ? { ok: true, text: "Invitation sent. They'll see it under Discover Work." } : { ok: false, text: res.error ?? "Could not send invite." });
  }

  const alreadyForJob = (id: string) => !!entry && applications.some((a) => a.jobId === id && a.hustlerId === entry.user.id);

  return (
    <>
      <Modal open={!!entry} onClose={onClose} title="Hustler profile" size="lg">
        {entry && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-primary to-blue-dark text-xl font-bold text-white">
                  {entry.user.name[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-text-primary">{displayName(entry.user.name)}</h3>
                  <p className="text-sm text-text-secondary">{entry.profile.designation || entry.profile.occupation}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {entry.profile.occupation && <Badge variant="blue">{entry.profile.occupation}</Badge>}
                    {entry.profile.field && <Badge>{entry.profile.field}</Badge>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => toggleSaved(entry.user.id)}>
                  {saved ? <BookmarkCheck className="h-4 w-4 text-blue-soft" /> : <Bookmark className="h-4 w-4" />}
                  {saved ? "Saved" : "Save"}
                </Button>
                <Button size="sm" onClick={() => { setInviteMsg(null); setInviteOpen(true); }}>
                  <Send className="h-4 w-4" />
                  Invite
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Availability", availabilityLabels[entry.profile.availability] ?? (entry.profile.availability || "—")],
                ["Expected rate", entry.profile.expectedRate || "—"],
                ["Experience", experienceLabels[entry.profile.experience] ?? (entry.profile.experience || "—")],
                ["Projects", String(portfolio.length)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-border-subtle bg-bg-secondary/50 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">{k}</p>
                  <p className="mt-1 text-sm font-semibold text-text-primary">{v}</p>
                </div>
              ))}
            </div>

            {entry.profile.bio && (
              <section>
                <h4 className="mb-1.5 text-sm font-semibold text-text-primary">About</h4>
                <p className="text-sm text-text-secondary">{entry.profile.bio}</p>
              </section>
            )}

            {entry.profile.skills.length > 0 && (
              <section>
                <h4 className="mb-2 text-sm font-semibold text-text-primary">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {entry.profile.skills.map((s) => <Badge key={s} variant="blue">{s}</Badge>)}
                </div>
              </section>
            )}

            {entry.profile.services && (
              <section>
                <h4 className="mb-1.5 text-sm font-semibold text-text-primary">Services</h4>
                <p className="text-sm text-text-secondary">{entry.profile.services}</p>
              </section>
            )}

            <section className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border-subtle p-3">
                <p className="flex items-center gap-2 text-sm font-medium text-text-primary">
                  <GraduationCap className="h-4 w-4 text-blue-soft" />
                  {entry.profile.educationStatus ? educationLabels[entry.profile.educationStatus] ?? entry.profile.educationStatus : "Education not shared"}
                </p>
                {entry.profile.cgpa && <p className="mt-1 text-xs text-text-secondary">CGPA {entry.profile.cgpa}</p>}
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle p-3">
                <p className="flex min-w-0 items-center gap-2 text-sm font-medium text-text-primary">
                  <FileText className="h-4 w-4 shrink-0 text-blue-soft" />
                  <span className="truncate">{entry.profile.resumeFileName || "No resume attached"}</span>
                </p>
                <Button variant="secondary" size="sm" onClick={() => setResumeOpen(true)}>View</Button>
              </div>
            </section>

            <section>
              <h4 className="mb-2 text-sm font-semibold text-text-primary">Portfolio</h4>
              {portfolio.length === 0 ? (
                <p className="text-sm text-text-secondary">No projects shared yet.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {portfolio.map((p) => (
                    <div key={p.id} className="rounded-xl border border-border-subtle p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-text-primary">{p.title}</p>
                        <Badge variant={p.status === "completed" ? "success" : "blue"}>{p.status === "completed" ? "Completed" : "In progress"}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-text-secondary">for {p.clientName}</p>
                      {p.description && <p className="mt-2 line-clamp-3 text-sm text-text-secondary">{p.description}</p>}
                      {p.status !== "completed" && <ProgressBar className="mt-3" value={p.progress} label="Progress" />}
                      <div className="mt-3 flex gap-3 text-xs">
                        {p.githubUrl && (
                          <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-text-secondary hover:text-blue-soft">
                            <GitBranch className="h-3.5 w-3.5" /> Code
                          </a>
                        )}
                        {p.liveUrl && (
                          <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-text-secondary hover:text-blue-soft">
                            <ExternalLink className="h-3.5 w-3.5" /> Live
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <p className="flex items-center gap-2 rounded-xl bg-bg-secondary/60 px-3 py-2 text-xs text-text-secondary">
              <ShieldCheck className="h-4 w-4 shrink-0 text-blue-soft" />
              Profile completeness {calcHustlerCompletion(entry.profile)}%. Email, age and gender are private and never shown to Owners.
            </p>
          </div>
        )}
      </Modal>

      <Modal open={resumeOpen} onClose={() => setResumeOpen(false)} title="Resume" size="lg">
        {entry && (
          <>
            <p className="mb-3 text-xs text-text-secondary">
              Auto-generated from the Hustler&apos;s profile and portfolio. (Real file uploads arrive with the backend phase.)
            </p>
            <ResumePreview name={displayName(entry.user.name)} profile={entry.profile} projects={portfolio} />
          </>
        )}
      </Modal>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite to apply">
        {openJobs.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">You don&apos;t have an open job yet. Post one first, then invite Hustlers to it.</p>
            <Link href="/jobs/owner/new"><Button fullWidth>Post a job</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            <Select
              label="Choose a job"
              placeholder="Select a job"
              value={jobId}
              onChange={(e) => { setJobId(e.target.value); setInviteMsg(null); }}
              options={openJobs.map((j) => ({ value: j.id, label: alreadyForJob(j.id) ? `${j.title} (already invited/applied)` : j.title }))}
            />
            {inviteMsg && (
              <p className={inviteMsg.ok ? "text-sm text-emerald-600" : "text-sm text-red-600"}>{inviteMsg.text}</p>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setInviteOpen(false)}>Close</Button>
              <Button onClick={sendInvite} disabled={!jobId || alreadyForJob(jobId) || !!inviteMsg?.ok}>Send invite</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
