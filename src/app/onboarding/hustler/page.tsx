"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, SkipForward } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PageContainer } from "@/components/layout/PageContainer";
import { FormSection } from "@/components/onboarding/FormSection";
import { SkillsInput } from "@/components/onboarding/SkillsInput";
import { SelectWithOther, OTHER_VALUE } from "@/components/onboarding/SelectWithOther";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthStore } from "@/lib/store/auth";
import { calcHustlerCompletion } from "@/lib/utils";
import { occupationOptions, fieldOptions, trendingSkills } from "@/lib/onboardingOptions";

interface FormState {
  occupation: string;
  occupationOther: string;
  field: string;
  fieldOther: string;
  designation: string;
  skills: string[];
  experience: string;
  services: string;
  bio: string;
  availability: string;
  expectedRate: string;
}

const initialState: FormState = {
  occupation: "", occupationOther: "", field: "", fieldOther: "", designation: "",
  skills: [], experience: "", services: "", bio: "", availability: "", expectedRate: "",
};

const TOTAL_STEPS = 3;

function resolveLabel(value: string, otherValue: string, options: { value: string; label: string }[]) {
  if (!value) return "";
  if (value === OTHER_VALUE) return otherValue.trim();
  return options.find((o) => o.value === value)?.label ?? value;
}

export default function HustlerOnboardingPage() {
  const { ready } = useRequireAuth("hustler");
  const router = useRouter();
  const saveHustlerProfile = useAuthStore((s) => s.saveHustlerProfile);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialState);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  const resolved = useMemo(
    () => ({
      ...form,
      occupation: resolveLabel(form.occupation, form.occupationOther, occupationOptions),
      field: resolveLabel(form.field, form.fieldOther, fieldOptions),
    }),
    [form]
  );
  const completion = useMemo(() => calcHustlerCompletion(resolved), [resolved]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function buildProfile() {
    return {
      occupation: resolved.occupation, field: resolved.field, designation: form.designation,
      skills: form.skills, experience: form.experience, services: form.services, bio: form.bio,
      availability: form.availability, expectedRate: form.expectedRate,
    };
  }

  function validateStep(): boolean {
    const errors: Record<string, string> = {};
    if (step === 1) {
      if (!form.occupation) errors.occupation = "Required";
      else if (form.occupation === OTHER_VALUE && !form.occupationOther.trim()) errors.occupation = "Tell us what you do";
      if (!form.field) errors.field = "Required";
      else if (form.field === OTHER_VALUE && !form.fieldOther.trim()) errors.field = "Tell us your field";
      if (!form.designation.trim()) errors.designation = "Required";
    } else if (step === 2) {
      if (form.skills.length === 0) errors.skills = "Add at least one skill";
      if (!form.experience) errors.experience = "Required";
      if (!form.services.trim()) errors.services = "Required";
    } else {
      if (!form.bio.trim()) errors.bio = "Required";
      if (!form.availability) errors.availability = "Required";
      if (!form.expectedRate.trim()) errors.expectedRate = "Required";
    }
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function finish() {
    saveHustlerProfile(buildProfile());
    router.push("/dashboard/hustler");
  }

  function handleNext() {
    if (!validateStep()) return;
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
    else finish();
  }

  if (!ready) return null;

  return (
    <div className="min-h-screen glow-bg py-14">
      <PageContainer className="max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-soft">
            <Sparkles className="h-4 w-4" />
            Hustler profile
          </div>
          <h1 className="font-display text-3xl font-bold text-text-primary">Let&apos;s build your Hustle Profile.</h1>
          <p className="mt-2 text-text-secondary">You can complete this now or skip it and come back later.</p>

          <div className="mt-6"><ProgressBar value={completion} label="Your Hustle Profile" /></div>

          <div className="mt-2 flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i + 1 <= step ? "bg-blue-primary" : "bg-border-subtle"}`} />
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-border-subtle bg-bg-card/60 p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                {step === 1 && (
                  <FormSection title="The basics" description="What do you do, and where do you specialize?">
                    <SelectWithOther label="Occupation" required placeholder="Select your occupation"
                      options={occupationOptions} value={form.occupation} otherValue={form.occupationOther}
                      onValueChange={(v) => update("occupation", v)} onOtherChange={(v) => update("occupationOther", v)}
                      error={stepErrors.occupation} />
                    <SelectWithOther label="Field" required placeholder="Select your field"
                      options={fieldOptions} value={form.field} otherValue={form.fieldOther}
                      onValueChange={(v) => update("field", v)} onOtherChange={(v) => update("fieldOther", v)}
                      error={stepErrors.field} />
                    <Input label="Designation" required placeholder="e.g. Junior React Developer"
                      value={form.designation} onChange={(e) => update("designation", e.target.value)}
                      error={stepErrors.designation} className="sm:col-span-2" />
                  </FormSection>
                )}
                {step === 2 && (
                  <FormSection title="Skills & services" description="Show what you bring to the table.">
                    <SkillsInput value={form.skills} onChange={(skills) => update("skills", skills)}
                      error={stepErrors.skills} suggestions={trendingSkills} />
                    <Select label="Experience level" required placeholder="Select level" value={form.experience}
                      onChange={(e) => update("experience", e.target.value)} error={stepErrors.experience}
                      options={[
                        { value: "beginner", label: "Just starting out" },
                        { value: "intermediate", label: "1–3 years" },
                        { value: "experienced", label: "3–6 years" },
                        { value: "expert", label: "6+ years" },
                      ]} />
                    <Input label="Services offered" required placeholder="e.g. Landing pages, dashboards"
                      value={form.services} onChange={(e) => update("services", e.target.value)}
                      error={stepErrors.services} />
                  </FormSection>
                )}
                {step === 3 && (
                  <FormSection title="Availability & rate" description="Help owners know when and how to reach you.">
                    <Textarea label="Short bio" required rows={3}
                      placeholder="A couple of sentences about who you are and what you're great at."
                      value={form.bio} onChange={(e) => update("bio", e.target.value)} error={stepErrors.bio}
                      className="sm:col-span-2" />
                    <Select label="Availability" required placeholder="Select availability" value={form.availability}
                      onChange={(e) => update("availability", e.target.value)} error={stepErrors.availability}
                      options={[
                        { value: "full-time", label: "Full-time" },
                        { value: "part-time", label: "Part-time" },
                        { value: "weekends", label: "Weekends only" },
                        { value: "flexible", label: "Flexible" },
                      ]} />
                    <Input label="Expected rate" required placeholder="e.g. ₹800/hr or ₹15,000/project"
                      value={form.expectedRate} onChange={(e) => update("expectedRate", e.target.value)}
                      error={stepErrors.expectedRate} />
                  </FormSection>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <Button variant="secondary" onClick={() => step > 1 && setStep((s) => s - 1)} disabled={step === 1}
              className={step === 1 ? "invisible" : ""}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={finish}>
                <SkipForward className="h-4 w-4" />
                Skip for now
              </Button>
              <Button onClick={handleNext}>
                {step === TOTAL_STEPS ? "Finish setup" : "Next"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </PageContainer>
    </div>
  );
}
