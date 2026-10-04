"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderKanban,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Wallet,
  Building2,
  GitBranch,
  ExternalLink,
  Rocket,
  Quote,
  Lightbulb,
  CheckCircle2,
  Circle,
  Sparkles,
  Clock,
  Eye,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/States";
import { DeployGuideDrawer } from "@/components/projects/DeployGuideDrawer";
import { MilestoneEditor } from "@/components/projects/MilestoneEditor";
import { hustlerNav } from "@/components/layout/navConfig";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import {
  useAuthStore,
  useHustlerIdeas,
  useHustlerProfile,
  useHustlerProjects,
  useMyWorkLogs,
} from "@/lib/store/auth";
import { formatDate, toISODate } from "@/lib/format";
import { IdeaSuggestions } from "@/components/projects/IdeaSuggestions";
import { cn } from "@/lib/utils";
import { ideaQuotes, pickQuote, projectQuotes } from "@/lib/content";
import type { HustlerProject, ProjectIdea, ProjectMilestone, ProjectStatus } from "@/types";

const statusMeta: Record<ProjectStatus, { label: string; badge: "blue" | "warning" | "success" }> = {
  active: { label: "Active", badge: "blue" },
  pending: { label: "Pending", badge: "warning" },
  completed: { label: "Completed", badge: "success" },
};

const filterOptions: { value: ProjectStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
];

interface ProjectFormState {
  title: string;
  clientName: string;
  status: ProjectStatus;
  deadline: string;
  budget: string;
  description: string;
  githubUrl: string;
  liveUrl: string;
  progress: number;
  milestones: ProjectMilestone[];
  inPortfolio: boolean;
}

const emptyProjectForm: ProjectFormState = {
  title: "",
  clientName: "",
  status: "active",
  deadline: "",
  budget: "",
  description: "",
  githubUrl: "",
  liveUrl: "",
  progress: 0,
  milestones: [],
  inPortfolio: true,
};

interface IdeaFormState {
  title: string;
  description: string;
}

const emptyIdeaForm: IdeaFormState = { title: "", description: "" };

export default function HustlerProjectsPage() {
  const { ready } = useRequireAuth("hustler");
  const projects = useHustlerProjects();
  const ideas = useHustlerIdeas();
  const profile = useHustlerProfile();
  const workLogs = useMyWorkLogs();
  const addWorkLog = useAuthStore((s) => s.addWorkLog);
  const [logTarget, setLogTarget] = useState<HustlerProject | null>(null);
  const [logHours, setLogHours] = useState("2");
  const [logDate, setLogDate] = useState(() => toISODate(new Date()));
  const hoursByProject = useMemo(() => {
    const m = new Map<string, number>();
    workLogs.forEach((l) => m.set(l.projectId, (m.get(l.projectId) ?? 0) + l.hours));
    return m;
  }, [workLogs]);
  const addHustlerProject = useAuthStore((s) => s.addHustlerProject);
  const updateHustlerProject = useAuthStore((s) => s.updateHustlerProject);
  const deleteHustlerProject = useAuthStore((s) => s.deleteHustlerProject);
  const toggleProjectMilestone = useAuthStore((s) => s.toggleProjectMilestone);
  const addHustlerIdea = useAuthStore((s) => s.addHustlerIdea);
  const deleteHustlerIdea = useAuthStore((s) => s.deleteHustlerIdea);

  const [tab, setTab] = useState<"projects" | "ideas">("projects");
  const [filter, setFilter] = useState<ProjectStatus | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectFormState>(emptyProjectForm);
  const [deleteTarget, setDeleteTarget] = useState<HustlerProject | null>(null);
  const [deployOpen, setDeployOpen] = useState(false);

  const [ideaFormOpen, setIdeaFormOpen] = useState(false);
  const [ideaForm, setIdeaForm] = useState<IdeaFormState>(emptyIdeaForm);
  const [deleteIdeaTarget, setDeleteIdeaTarget] = useState<ProjectIdea | null>(null);

  const projectQuote = useMemo(() => pickQuote(projectQuotes), []);
  const ideaQuote = useMemo(() => pickQuote(ideaQuotes), []);

  const filtered = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.status === filter)),
    [projects, filter]
  );

  const counts = useMemo(() => {
    const c: Record<ProjectStatus, number> = { active: 0, pending: 0, completed: 0 };
    for (const p of projects) c[p.status]++;
    return c;
  }, [projects]);

  function update<K extends keyof ProjectFormState>(key: K, value: ProjectFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function openNew() {
    setEditingId(null);
    setForm(emptyProjectForm);
    setFormOpen(true);
  }

  function openEdit(project: HustlerProject) {
    setEditingId(project.id);
    setForm({
      title: project.title,
      clientName: project.clientName,
      status: project.status,
      deadline: project.deadline ?? "",
      budget: project.budget ?? "",
      description: project.description ?? "",
      githubUrl: project.githubUrl ?? "",
      liveUrl: project.liveUrl ?? "",
      progress: project.progress,
      milestones: project.milestones,
      inPortfolio: project.inPortfolio ?? project.status !== "pending",
    });
    setFormOpen(true);
  }

  function handleSubmit() {
    if (!form.title.trim() || !form.clientName.trim()) return;
    const data = {
      title: form.title.trim(),
      clientName: form.clientName.trim(),
      status: form.status,
      deadline: form.deadline || undefined,
      budget: form.budget || undefined,
      description: form.description || undefined,
      githubUrl: form.githubUrl || undefined,
      liveUrl: form.liveUrl || undefined,
      progress: form.progress,
      milestones: form.milestones,
      inPortfolio: form.inPortfolio,
    };
    if (editingId) {
      updateHustlerProject(editingId, data);
    } else {
      addHustlerProject(data);
    }
    setFormOpen(false);
  }

  function confirmDelete() {
    if (deleteTarget) deleteHustlerProject(deleteTarget.id);
    setDeleteTarget(null);
  }

  function handleAddIdea() {
    if (!ideaForm.title.trim()) return;
    addHustlerIdea({
      title: ideaForm.title.trim(),
      description: ideaForm.description || undefined,
    });
    setIdeaForm(emptyIdeaForm);
    setIdeaFormOpen(false);
  }

  function confirmDeleteIdea() {
    if (deleteIdeaTarget) deleteHustlerIdea(deleteIdeaTarget.id);
    setDeleteIdeaTarget(null);
  }

  if (!ready) return null;

  return (
    <AppShell items={hustlerNav}>
      <PageContainer className="py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-2 text-sm font-medium text-blue-soft">
            <FolderKanban className="h-4 w-4" />
            Active work
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold text-text-primary sm:text-3xl">
            My Projects
          </h1>
          <p className="mt-1 text-text-secondary">
            Track what you&apos;re building right now, and keep a running list of what&apos;s next.
          </p>

          {/* Quote banner */}
          <motion.div
            key={tab === "projects" ? "quote-projects" : "quote-ideas"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-primary/25 bg-blue-primary/8 px-5 py-4"
          >
            <Quote className="mt-0.5 h-4 w-4 shrink-0 text-blue-soft" />
            <p className="text-sm italic text-text-secondary">
              {tab === "projects" ? projectQuote : ideaQuote}
            </p>
          </motion.div>

          {/* Tab switcher */}
          <div className="mt-6 inline-flex rounded-xl border border-border-subtle bg-bg-card p-1">
            {(["projects", "ideas"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  tab === t ? "bg-blue-primary text-white" : "text-text-secondary hover:text-text-primary"
                )}
              >
                {t === "projects" ? "Projects" : "Ideas"}
              </button>
            ))}
          </div>

          {tab === "projects" ? (
            <>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {filterOptions.map((opt) => {
                    const count = opt.value === "all" ? projects.length : counts[opt.value];
                    const active = filter === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setFilter(opt.value)}
                        className={cn(
                          "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                          active
                            ? "border-blue-primary bg-blue-primary/12 text-blue-soft"
                            : "border-border-subtle text-text-secondary hover:border-blue-primary/40 hover:text-text-primary"
                        )}
                      >
                        {opt.label}
                        <span className="ml-1.5 text-xs opacity-70">{count}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setDeployOpen(true)}>
                    <Rocket className="h-3.5 w-3.5" />
                    How to deploy free
                  </Button>
                  <Button size="sm" onClick={openNew}>
                    <Plus className="h-3.5 w-3.5" />
                    New project
                  </Button>
                </div>
              </div>

              <div className="mt-6">
                {filtered.length === 0 ? (
                  <EmptyState
                    icon={<FolderKanban className="h-5 w-5" />}
                    title={projects.length === 0 ? "No projects yet" : "Nothing in this filter"}
                    description={
                      projects.length === 0
                        ? "Add the work you're currently doing to keep track of it here."
                        : "Try a different status filter, or add a new project."
                    }
                    action={
                      projects.length === 0 ? (
                        <Button size="sm" onClick={openNew}>
                          <Plus className="h-4 w-4" />
                          Add your first project
                        </Button>
                      ) : undefined
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence initial={false}>
                      {filtered.map((project) => {
                        const completedCount = project.milestones.filter((m) => m.completed).length;
                        return (
                          <motion.div
                            key={project.id}
                            layout
                            initial={{ opacity: 0, y: 12, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          >
                            <Card className="flex h-full flex-col">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate font-display font-semibold text-text-primary">
                                    {project.title}
                                  </p>
                                  <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-text-secondary">
                                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                                    {project.clientName}
                                  </p>
                                </div>
                                <Badge variant={statusMeta[project.status].badge}>
                                  {statusMeta[project.status].label}
                                </Badge>
                              </div>

                              {project.description && (
                                <p className="mt-3 line-clamp-2 text-sm text-text-secondary">
                                  {project.description}
                                </p>
                              )}

                              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-text-secondary">
                                <span className="flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5" />
                                  {hoursByProject.get(project.id) ?? 0}h logged
                                </span>
                                {(project.inPortfolio ?? project.status !== "pending") && (
                                  <span className="flex items-center gap-1.5">
                                    <Eye className="h-3.5 w-3.5" />
                                    In portfolio
                                  </span>
                                )}
                                {project.deadline && (
                                  <span className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {formatDate(project.deadline)}
                                  </span>
                                )}
                                {project.budget && (
                                  <span className="flex items-center gap-1.5">
                                    <Wallet className="h-3.5 w-3.5" />
                                    {project.budget}
                                  </span>
                                )}
                              </div>

                              {(project.githubUrl || project.liveUrl) && (
                                <div className="mt-3 flex flex-wrap gap-3 text-xs">
                                  {project.githubUrl && (
                                    
                                      <a href={project.githubUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1.5 text-text-secondary hover:text-blue-soft"
                                    >
                                      <GitBranch className="h-3.5 w-3.5" />
                                      Code
                                    </a>
                                  )}
                                  {project.liveUrl && (
                                    
                                      <a href={project.liveUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1.5 text-text-secondary hover:text-blue-soft"
                                    >
                                      <ExternalLink className="h-3.5 w-3.5" />
                                      Live site
                                    </a>
                                  )}
                                </div>
                              )}

                              <div className="mt-4">
                                <ProgressBar value={project.progress} showPercentage label="Progress" />
                              </div>

                              {project.milestones.length > 0 && (
                                <div className="mt-4">
                                  <p className="mb-2 text-xs font-medium text-text-secondary">
                                    Milestones {completedCount}/{project.milestones.length}
                                  </p>
                                  <ul className="space-y-1.5">
                                    {project.milestones.map((m) => (
                                      <li key={m.id}>
                                        <button
                                          type="button"
                                          onClick={() => toggleProjectMilestone(project.id, m.id)}
                                          className="flex w-full items-center gap-2 text-left text-sm"
                                        >
                                          <motion.span
                                            initial={false}
                                            animate={{ scale: m.completed ? [1, 1.3, 1] : 1 }}
                                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                            className="shrink-0"
                                          >
                                            {m.completed ? (
                                              <CheckCircle2 className="h-4 w-4 text-blue-bright" />
                                            ) : (
                                              <Circle className="h-4 w-4 text-text-secondary" />
                                            )}
                                          </motion.span>
                                          <span
                                            className={cn(
                                              "truncate transition-colors",
                                              m.completed
                                                ? "text-text-secondary line-through"
                                                : "text-text-primary"
                                            )}
                                          >
                                            {m.title}
                                          </span>
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              <div className="mt-auto flex flex-wrap justify-end gap-2 pt-4">
                                <Button variant="secondary" size="sm" onClick={() => { setLogTarget(project); setLogHours("2"); setLogDate(toISODate(new Date())); }}>
                                  <Clock className="h-3.5 w-3.5" />
                                  Log time
                                </Button>
                                <Button variant="secondary" size="sm" onClick={() => openEdit(project)}>
                                  <Pencil className="h-3.5 w-3.5" />
                                  Edit
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => setDeleteTarget(project)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-text-secondary">Save ideas you want to build someday.</p>
                <Button size="sm" onClick={() => setIdeaFormOpen(true)}>
                  <Plus className="h-3.5 w-3.5" />
                  New idea
                </Button>
              </div>

              <div className="mt-6">
                <IdeaSuggestions
                  profile={profile}
                  existingTitles={ideas.map((i) => i.title)}
                  onSave={(title, description) => addHustlerIdea({ title, description, source: "suggested" })}
                />
              </div>

              <div className="mt-6">
                {ideas.length === 0 ? (
                  <EmptyState
                    icon={<Lightbulb className="h-5 w-5" />}
                    title="No ideas saved yet"
                    description="Jot down anything you might want to build someday — you can turn it into a real project later."
                    action={
                      <Button size="sm" onClick={() => setIdeaFormOpen(true)}>
                        <Plus className="h-4 w-4" />
                        Add your first idea
                      </Button>
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence initial={false}>
                      {ideas.map((idea) => (
                        <motion.div
                          key={idea.id}
                          layout
                          initial={{ opacity: 0, y: 12, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <Card className="flex h-full flex-col">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex min-w-0 items-start gap-2">
                                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-soft" />
                                <p className="font-display font-semibold text-text-primary">
                                  {idea.title}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setDeleteIdeaTarget(idea)}
                                aria-label={`Delete ${idea.title}`}
                                className="shrink-0 rounded-lg p-1 text-text-secondary hover:bg-black/5 hover:text-red-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            {idea.description && (
                              <p className="mt-3 text-sm text-text-secondary">{idea.description}</p>
                            )}
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </PageContainer>

      {/* New / edit project modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? "Edit project" : "New project"}
      >
        <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
          <Input
            label="Project title"
            required
            placeholder="e.g. Landing page redesign"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
          />
          <Input
            label="Client name"
            required
            placeholder="e.g. Northbeam Studio"
            value={form.clientName}
            onChange={(e) => update("clientName", e.target.value)}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => update("status", e.target.value as ProjectStatus)}
            options={[
              { value: "active", label: "Active" },
              { value: "pending", label: "Pending" },
              { value: "completed", label: "Completed" },
            ]}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Deadline"
              type="date"
              value={form.deadline}
              onChange={(e) => update("deadline", e.target.value)}
            />
            <Input
              label="Budget / rate"
              placeholder="e.g. ₹25,000"
              value={form.budget}
              onChange={(e) => update("budget", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="GitHub link"
              placeholder="https://github.com/you/project"
              value={form.githubUrl}
              onChange={(e) => update("githubUrl", e.target.value)}
            />
            <Input
              label="Live URL"
              placeholder="https://project.vercel.app"
              value={form.liveUrl}
              onChange={(e) => update("liveUrl", e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => setDeployOpen(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-blue-soft hover:underline"
          >
            <Rocket className="h-3.5 w-3.5" />
            New to deploying? See how to do it free
          </button>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              Progress — {form.progress}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={form.progress}
              onChange={(e) => update("progress", Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-bg-secondary accent-blue-primary"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border-subtle bg-bg-secondary/50 p-3">
            <input type="checkbox" checked={form.inPortfolio} onChange={(e) => update("inPortfolio", e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--blue-primary)]" />
            <span>
              <span className="block text-sm font-medium text-text-primary">Show in my portfolio</span>
              <span className="block text-xs text-text-secondary">Owners can see this project when they view your profile.</span>
            </span>
          </label>

          <MilestoneEditor
            milestones={form.milestones}
            onChange={(milestones) => update("milestones", milestones)}
          />

          <Textarea
            label="Description"
            placeholder="What is this project about?"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={3}
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setFormOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!form.title.trim() || !form.clientName.trim()}>
            {editingId ? "Save changes" : "Add project"}
          </Button>
        </div>
      </Modal>

      {/* Delete project confirm */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete this project?">
        <p className="text-sm text-text-secondary">
          {deleteTarget && (
            <>
              This removes <span className="text-text-primary">&quot;{deleteTarget.title}&quot;</span> for good. This can&apos;t be undone.
            </>
          )}
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </Modal>

      {/* New idea modal */}
      <Modal open={ideaFormOpen} onClose={() => setIdeaFormOpen(false)} title="New idea">
        <div className="space-y-4">
          <Input
            label="Idea title"
            required
            placeholder="e.g. Habit tracker with streak sharing"
            value={ideaForm.title}
            onChange={(e) => setIdeaForm((f) => ({ ...f, title: e.target.value }))}
          />
          <Textarea
            label="Notes"
            placeholder="What's the idea? Who's it for?"
            value={ideaForm.description}
            onChange={(e) => setIdeaForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setIdeaFormOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddIdea} disabled={!ideaForm.title.trim()}>
            Save idea
          </Button>
        </div>
      </Modal>

      {/* Delete idea confirm */}
      <Modal open={!!deleteIdeaTarget} onClose={() => setDeleteIdeaTarget(null)} title="Delete this idea?">
        <p className="text-sm text-text-secondary">
          {deleteIdeaTarget && (
            <>
              This removes <span className="text-text-primary">&quot;{deleteIdeaTarget.title}&quot;</span> for good.
            </>
          )}
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteIdeaTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteIdea}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </Modal>

      <Modal open={!!logTarget} onClose={() => setLogTarget(null)} title="Log time">
        {logTarget && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">Add hours you worked on <span className="font-medium text-text-primary">{logTarget.title}</span>. These power your Hustle Wrapped.</p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Hours" type="number" min={0.5} step={0.5} value={logHours} onChange={(e) => setLogHours(e.target.value)} />
              <Input label="Date" type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setLogTarget(null)}>Cancel</Button>
              <Button
                disabled={!(Number(logHours) > 0) || !logDate}
                onClick={() => { addWorkLog(logTarget.id, Number(logHours), logDate); setLogTarget(null); }}
              >
                Add hours
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <DeployGuideDrawer open={deployOpen} onClose={() => setDeployOpen(false)} />
    </AppShell>
  );
}