"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserRound,
  GraduationCap,
  FileUp,
  X,
  Sparkles,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Pencil,
  FileText,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import { FormSection } from "@/components/onboarding/FormSection";
import { SkillsInput } from "@/components/onboarding/SkillsInput";
import { SelectWithOther, OTHER_VALUE } from "@/components/onboarding/SelectWithOther";
import { hustlerNav } from "@/components/layout/navConfig";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthStore, useHustlerProfile } from "@/lib/store/auth";
import { calcHustlerCompletion, hustlerCompletionTagline } from "@/lib/utils";
import {
  occupationOptions,
  fieldOptions,
  educationStatusOptions,
  trendingSkills,
} from "@/lib/onboardingOptions";

interface FormState {
  occupation: string;
  occupationOther: string;
  field: string;
  fieldOther: string;
  designation: string;
  educationStatus: string;
  cgpa: string;
  resumeFileName: string;
  skills: string[];
  experience: string;
  services: string;
  bio: string;
  availability: string;
  expectedRate: string;
}

function resolveLabel(
  value: string,
  otherValue: string,
  options: { value: string; label: string }[]
) {
  if (!value) return "";
  if (value === OTHER_VALUE) return otherValue.trim();
  return options.find((o) => o.value === value)?.label ?? value;
}

/** Reverses resolveLabel — if a stored value matches a known option's
 *  label, preselect that option; otherwise treat it as a custom "Other"
 *  entry so nothing typed during onboarding gets lost. */
function toSelectValue(
  stored: string | undefined,
  options: { value: string; label: string }[]
): { value: string; other: string } {
  if (!stored) return { value: "", other: "" };
  const match = options.find((o) => o.label === stored);
  if (match) return { value: match.value, other: "" };
  return { value: OTHER_VALUE, other: stored };
}

export default function HustlerProfilePage() {
  const { ready, user } = useRequireAuth("hustler");
  const profile = useHustlerProfile();
  const saveHustlerProfile = useAuthStore((s) => s.saveHustlerProfile);
  const clearHustlerProfile = useAuthStore((s) => s.clearHustlerProfile);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialOccupation = toSelectValue(profile?.occupation, occupationOptions);
  const initialField = toSelectValue(profile?.field, fieldOptions);

  const [form, setForm] = useState<FormState>({
    occupation: initialOccupation.value,
    occupationOther: initialOccupation.other,
    field: initialField.value,
    fieldOther: initialField.other,
    designation: profile?.designation ?? "",
    educationStatus: profile?.educationStatus ?? "",
    cgpa: profile?.cgpa ?? "",
    resumeFileName: profile?.resumeFileName ?? "",
    skills: profile?.skills ?? [],
    experience: profile?.experience ?? "",
    services: profile?.services ?? "",
    bio: profile?.bio ?? "",
    availability: profile?.availability ?? "",
    expectedRate: profile?.expectedRate ?? "",
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setJustCompleted(false);
  }

  const resolved = useMemo(
    () => ({
      occupation: resolveLabel(form.occupation, form.occupationOther, occupationOptions),
      field: resolveLabel(form.field, form.fieldOther, fieldOptions),
      designation: form.designation,
      educationStatus: form.educationStatus,
      cgpa: form.cgpa,
      resumeFileName: form.resumeFileName,
      skills: form.skills,
      experience: form.experience,
      services: form.services,
      bio: form.bio,
      availability: form.availability,
      expectedRate: form.expectedRate,
    }),
    [form]
  );

  const completion = useMemo(() => calcHustlerCompletion(resolved), [resolved]);
  const tagline = hustlerCompletionTagline(completion);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) update("resumeFileName", file.name);
    e.target.value = "";
  }

  function handleSaveAndPreview() {
    saveHustlerProfile(resolved);
    setJustCompleted(false);
    setPreviewOpen(true);
  }

  function handleDismissPreview() {
    setPreviewOpen(false);
    setTimeout(() => setJustCompleted(true), 250);
  }

  function handleClear() {
    clearHustlerProfile();
    setForm({
      occupation: "",
      occupationOther: "",
      field: "",
      fieldOther: "",
      designation: "",
      educationStatus: "",
      cgpa: "",
      resumeFileName: "",
      skills: [],
      experience: "",
      services: "",
      bio: "",
      availability: "",
      expectedRate: "",
    });
    setClearModalOpen(false);
    setPreviewOpen(false);
    setJustCompleted(false);
  }

  if (!ready) return null;

  return (
    <AppShell items={hustlerNav}>
      <PageContainer className="max-w-3xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-soft">
            <UserRound className="h-4 w-4" />
            Your profile
          </div>
          <h1 className="font-display text-3xl font-bold text-text-primary">
            Build out your Hustle Profile.
          </h1>
          <p className="mt-2 text-text-secondary">
            Fill in as much as you like — you can always come back and edit it.
          </p>

          {/* Identity card — pulled from your account, read-only here */}
          <Card className="mt-6 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-primary to-blue-dark text-lg font-bold text-white">
              {user?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0">
              <p className="truncate font-display font-semibold text-text-primary">
                {user?.name}
              </p>
              <p className="text-sm text-text-secondary">
                {user?.age} yrs · {user?.gender} · {user?.email}
              </p>
            </div>
          </Card>

          <div className="mt-6">
            <ProgressBar value={completion} label="Your Hustle Profile" />
            {tagline && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 flex items-center gap-1.5 text-sm text-blue-soft"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {tagline}
              </motion.p>
            )}
          </div>

          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border border-border-subtle bg-bg-card/60 p-6 sm:p-8">
              <FormSection
                title="What you do"
                description="This is how Owners will find and understand your work."
              >
                <SelectWithOther
                  label="Occupation"
                  placeholder="Select your occupation"
                  options={occupationOptions}
                  value={form.occupation}
                  otherValue={form.occupationOther}
                  onValueChange={(v) => update("occupation", v)}
                  onOtherChange={(v) => update("occupationOther", v)}
                />
                <SelectWithOther
                  label="Field"
                  placeholder="Select your field"
                  options={fieldOptions}
                  value={form.field}
                  otherValue={form.fieldOther}
                  onValueChange={(v) => update("field", v)}
                  onOtherChange={(v) => update("fieldOther", v)}
                />
                <Input
                  label="Designation"
                  placeholder="e.g. Junior React Developer"
                  value={form.designation}
                  onChange={(e) => update("designation", e.target.value)}
                  className="sm:col-span-2"
                />
              </FormSection>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-bg-card/60 p-6 sm:p-8">
              <FormSection
                title="Education"
                description="Where you're at right now, academically."
              >
                <Select
                  label="Education status"
                  placeholder="Select your status"
                  value={form.educationStatus}
                  onChange={(e) => update("educationStatus", e.target.value)}
                  options={educationStatusOptions}
                />
                <Input
                  label="Cumulative CGPA"
                  placeholder="e.g. 8.4/10 or 3.6/4.0"
                  value={form.cgpa}
                  onChange={(e) => update("cgpa", e.target.value)}
                  hint="Optional — leave blank if you'd rather not share it."
                />

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">
                    Resume
                  </label>
                  {form.resumeFileName ? (
                    <div className="flex items-center justify-between rounded-xl border border-border-subtle bg-bg-card px-4 py-3">
                      <span className="flex min-w-0 items-center gap-2 text-sm text-text-primary">
                        <FileText className="h-4 w-4 shrink-0 text-blue-soft" />
                        <span className="truncate">{form.resumeFileName}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => update("resumeFileName", "")}
                        aria-label="Remove resume"
                        className="ml-3 shrink-0 rounded-lg p-1.5 text-text-secondary hover:bg-black/5 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border-subtle bg-bg-card px-4 py-4 text-sm font-medium text-text-secondary transition-colors hover:border-blue-primary/50 hover:text-blue-soft"
                    >
                      <FileUp className="h-4 w-4" />
                      Upload resume (PDF or Word) — optional
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <p className="mt-1.5 text-sm text-text-secondary">
                    Don&apos;t have one built yet? Skip this — you can add it later.
                  </p>
                </div>
              </FormSection>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-bg-card/60 p-6 sm:p-8">
              <FormSection
                title="Skills & services"
                description="Add your own, or tap a trending skill to add it instantly."
              >
                <SkillsInput
                  value={form.skills}
                  onChange={(skills) => update("skills", skills)}
                  suggestions={trendingSkills}
                />
                <Select
                  label="Experience level"
                  placeholder="Select level"
                  value={form.experience}
                  onChange={(e) => update("experience", e.target.value)}
                  options={[
                    { value: "beginner", label: "Just starting out" },
                    { value: "intermediate", label: "1–3 years" },
                    { value: "experienced", label: "3–6 years" },
                    { value: "expert", label: "6+ years" },
                  ]}
                />
                <Input
                  label="Services offered"
                  placeholder="e.g. Landing pages, dashboards"
                  value={form.services}
                  onChange={(e) => update("services", e.target.value)}
                />
                <Select
                  label="Availability"
                  placeholder="Select availability"
                  value={form.availability}
                  onChange={(e) => update("availability", e.target.value)}
                  options={[
                    { value: "full-time", label: "Full-time" },
                    { value: "part-time", label: "Part-time" },
                    { value: "weekends", label: "Weekends only" },
                    { value: "flexible", label: "Flexible" },
                  ]}
                />
                <Input
                  label="Expected rate"
                  placeholder="e.g. $25/hr or $500/project"
                  value={form.expectedRate}
                  onChange={(e) => update("expectedRate", e.target.value)}
                />
                <Textarea
                  label="Short summary"
                  placeholder="A couple of sentences about who you are and what you're great at."
                  value={form.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  className="sm:col-span-2"
                  rows={4}
                />
              </FormSection>
            </div>
          </div>

          {/* Completion banner — replaces the preview once dismissed */}
          <AnimatePresence mode="wait">
            {justCompleted && (
              <motion.div
                key="complete-banner"
                initial={{ opacity: 0, y: -10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-blue-primary/40 bg-blue-primary/10 px-6 py-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
                >
                  <CheckCircle2 className="h-10 w-10 text-blue-bright" />
                </motion.div>
                <div>
                  <p className="font-display text-lg font-semibold text-text-primary">
                    Profile saved
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    Your Hustle Profile is {completion}% complete.
                    {tagline ? ` ${tagline}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setJustCompleted(false)}
                  >
                    <Pencil className="h-4 w-4" />
                    Keep editing
                  </Button>
                  <Button onClick={() => router.push("/dashboard/hustler")}>
                    Go to dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <Button
              variant="danger"
              onClick={() => setClearModalOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Clear profile
            </Button>
            <Button size="lg" onClick={handleSaveAndPreview}>
              Save &amp; preview
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </PageContainer>

      {/* Live preview — pops in, drag or button to dismiss */}
      <AnimatePresence>
        {previewOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center">
            <motion.div
              key="preview-card"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 120) handleDismissPreview();
              }}
              initial={{ opacity: 0, scale: 0.85, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, x: 320, rotate: 6, transition: { duration: 0.35 } }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="relative w-full max-w-md cursor-grab rounded-t-2xl border border-border-subtle bg-bg-card p-6 shadow-[0_0_60px_-12px_rgba(219,110,61,0.28)] active:cursor-grabbing sm:rounded-2xl"
            >
              <button
                onClick={handleDismissPreview}
                aria-label="Close preview"
                className="absolute right-4 top-4 rounded-lg p-1.5 text-text-secondary hover:bg-black/5 hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-primary to-blue-dark text-lg font-bold text-white">
                  {user?.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-lg font-semibold text-text-primary">
                    {user?.name}
                  </p>
                  <p className="truncate text-sm text-text-secondary">
                    {resolved.designation || "Designation not set"}
                  </p>
                </div>
              </div>

              {resolved.bio && (
                <p className="mt-4 text-sm text-text-secondary">{resolved.bio}</p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {resolved.occupation && <Badge variant="blue">{resolved.occupation}</Badge>}
                {resolved.field && <Badge variant="neutral">{resolved.field}</Badge>}
                {resolved.educationStatus && (
                  <Badge variant="neutral">
                    <GraduationCap className="h-3 w-3" />
                    {educationStatusOptions.find((o) => o.value === resolved.educationStatus)
                      ?.label ?? resolved.educationStatus}
                  </Badge>
                )}
              </div>

              {resolved.skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {resolved.skills.slice(0, 8).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-black/5 px-2.5 py-1 text-xs text-text-secondary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-5 flex items-center justify-between border-t border-border-subtle pt-4 text-sm text-text-secondary">
                <span>{resolved.availability || "Availability not set"}</span>
                <span className="font-medium text-text-primary">
                  {resolved.expectedRate || "Rate not set"}
                </span>
              </div>

              <div className="mt-5">
                <ProgressBar value={completion} label="Profile strength" />
              </div>

              <Button fullWidth className="mt-5" onClick={handleDismissPreview}>
                Looks good
                <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="mt-2 text-center text-xs text-text-secondary">
                Or drag this card sideways to dismiss.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Modal
        open={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title="Clear your profile?"
      >
        <p className="text-sm text-text-secondary">
          This removes everything you&apos;ve filled in on this page. Your
          account and login stay put — you can always fill it back in.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setClearModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleClear}>
            <Trash2 className="h-4 w-4" />
            Clear profile
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}