"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  X,
  Sparkles,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Pencil,
  Globe,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import { FormSection } from "@/components/onboarding/FormSection";
import { SelectWithOther, OTHER_VALUE } from "@/components/onboarding/SelectWithOther";
import { ownerNav } from "@/components/layout/navConfig";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthStore, useOwnerProfile } from "@/lib/store/auth";
import { calcOwnerCompletion } from "@/lib/utils";
import { industryOptions } from "@/lib/onboardingOptions";

interface FormState {
  companyName: string;
  industry: string;
  industryOther: string;
  designation: string;
  description: string;
  website: string;
  freelancerRequirements: string;
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

function toSelectValue(
  stored: string | undefined,
  options: { value: string; label: string }[]
): { value: string; other: string } {
  if (!stored) return { value: "", other: "" };
  const match = options.find((o) => o.label === stored);
  if (match) return { value: match.value, other: "" };
  return { value: OTHER_VALUE, other: stored };
}

export default function OwnerProfilePage() {
  const { ready, user } = useRequireAuth("owner");
  const profile = useOwnerProfile();
  const saveOwnerProfile = useAuthStore((s) => s.saveOwnerProfile);
  const clearOwnerProfile = useAuthStore((s) => s.clearOwnerProfile);
  const updateUser = useAuthStore((s) => s.updateUser);
  const router = useRouter();

  const initialIndustry = toSelectValue(profile?.industry, industryOptions);

  const [form, setForm] = useState<FormState>({
    companyName: profile?.companyName ?? "",
    industry: initialIndustry.value,
    industryOther: initialIndustry.other,
    designation: profile?.designation ?? "",
    description: profile?.description ?? "",
    website: profile?.website ?? "",
    freelancerRequirements: profile?.freelancerRequirements ?? "",
  });

  const [phone, setPhone] = useState(user?.phone ?? "");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setJustCompleted(false);
  }

  const resolved = useMemo(
    () => ({
      companyName: form.companyName,
      industry: resolveLabel(form.industry, form.industryOther, industryOptions),
      designation: form.designation,
      description: form.description,
      website: form.website || undefined,
      freelancerRequirements: form.freelancerRequirements,
    }),
    [form]
  );

  const completion = useMemo(() => calcOwnerCompletion(resolved), [resolved]);

  function handleSaveAndPreview() {
    saveOwnerProfile(resolved);
    updateUser({ phone: phone.trim() || undefined });
    setJustCompleted(false);
    setPreviewOpen(true);
  }

  function handleDismissPreview() {
    setPreviewOpen(false);
    setTimeout(() => setJustCompleted(true), 250);
  }

  function handleClear() {
    clearOwnerProfile();
    setForm({
      companyName: "",
      industry: "",
      industryOther: "",
      designation: "",
      description: "",
      website: "",
      freelancerRequirements: "",
    });
    setClearModalOpen(false);
    setPreviewOpen(false);
    setJustCompleted(false);
  }

  if (!ready) return null;

  return (
    <AppShell items={ownerNav}>
      <PageContainer className="max-w-3xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-soft">
            <Briefcase className="h-4 w-4" />
            Your profile
          </div>
          <h1 className="font-display text-3xl font-bold text-text-primary">
            Build out your company profile.
          </h1>
          <p className="mt-2 text-text-secondary">
            Fill in as much as you like — you can always come back and edit it.
          </p>

          <Card className="mt-6 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-primary to-blue-dark text-lg font-bold text-white">
              {user?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0">
              <p className="truncate font-display font-semibold text-text-primary">
                {user?.name}
              </p>
              <p className="text-sm text-text-secondary">{user?.email}</p>
            </div>
          </Card>

          <div className="mt-6">
            <ProgressBar value={completion} label="Your Company Profile" />
          </div>

          <div className="mt-6 rounded-2xl border border-border-subtle bg-bg-card/60 p-6 sm:p-8">
            <FormSection
              title="Your company"
              description="Just enough for Hustlers to know who they'd be working with."
            >
              <Input
                label="Company / business name"
                placeholder="e.g. Northbeam Studio"
                value={form.companyName}
                onChange={(e) => update("companyName", e.target.value)}
              />
              <SelectWithOther
                label="Industry"
                placeholder="Select your industry"
                options={industryOptions}
                value={form.industry}
                otherValue={form.industryOther}
                onValueChange={(v) => update("industry", v)}
                onOtherChange={(v) => update("industryOther", v)}
              />
              <Input
                label="Your designation"
                placeholder="e.g. Founder, Operations Lead"
                value={form.designation}
                onChange={(e) => update("designation", e.target.value)}
              />
              <Input
                label="Website"
                placeholder="https://yourcompany.com"
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
              />
              <Input
                label="Contact phone (optional)"
                type="tel"
                placeholder="+91 …"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setJustCompleted(false); }}
                hint="Shown to Hustlers only on jobs where you choose to show contact details."
              />
              <Textarea
                label="Short description"
                placeholder="What does your company do?"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                className="sm:col-span-2"
                rows={3}
              />
              <Textarea
                label="What type of freelancers are you looking for?"
                placeholder="e.g. Product designers with fintech experience"
                value={form.freelancerRequirements}
                onChange={(e) => update("freelancerRequirements", e.target.value)}
                className="sm:col-span-2"
                rows={3}
              />
            </FormSection>
          </div>

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
                    Your company profile is {completion}% complete.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button variant="secondary" onClick={() => setJustCompleted(false)}>
                    <Pencil className="h-4 w-4" />
                    Keep editing
                  </Button>
                  <Button onClick={() => router.push("/dashboard/owner")}>
                    Go to dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <Button variant="danger" onClick={() => setClearModalOpen(true)}>
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
                  {(resolved.companyName || user?.name || "?")[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-lg font-semibold text-text-primary">
                    {resolved.companyName || "Company name not set"}
                  </p>
                  <p className="truncate text-sm text-text-secondary">
                    {resolved.designation || "Designation not set"}
                  </p>
                </div>
              </div>

              {resolved.description && (
                <p className="mt-4 text-sm text-text-secondary">{resolved.description}</p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {resolved.industry && <Badge variant="blue">{resolved.industry}</Badge>}
                {resolved.website && (
                  <Badge variant="neutral">
                    <Globe className="h-3 w-3" />
                    {resolved.website.replace(/^https?:\/\//, "")}
                  </Badge>
                )}
              </div>

              {resolved.freelancerRequirements && (
                <div className="mt-5 border-t border-border-subtle pt-4 text-sm text-text-secondary">
                  <span className="font-medium text-text-primary">Looking for: </span>
                  {resolved.freelancerRequirements}
                </div>
              )}

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