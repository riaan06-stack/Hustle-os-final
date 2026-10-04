"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { SkillsInput } from "@/components/onboarding/SkillsInput";
import { fieldOptions } from "@/lib/onboardingOptions";
import { jobTypeLabels, workModeLabels } from "@/lib/labels";
import type { AppUser, Job, JobType, PayType, WorkMode } from "@/types";

export type JobInput = Omit<Job, "id" | "ownerId" | "createdAt">;

export function JobForm({
  user,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  user: AppUser;
  initial?: Job;
  submitLabel: string;
  onSubmit: (data: JobInput) => void;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [field, setField] = useState(initial?.field ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [skills, setSkills] = useState<string[]>(initial?.skills ?? []);
  const [type, setType] = useState<JobType>(initial?.type ?? "contract");
  const [mode, setMode] = useState<WorkMode>(initial?.mode ?? "remote");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [duration, setDuration] = useState(initial?.duration ?? "");
  const [pay, setPay] = useState(initial ? String(initial.pay) : "");
  const [payType, setPayType] = useState<PayType>(initial?.payType ?? "month");
  const [vacancies, setVacancies] = useState(initial ? String(initial.vacancies) : "1");
  const [applyBy, setApplyBy] = useState(initial?.applyBy ?? "");
  const [showContact, setShowContact] = useState(initial?.showContact ?? true);
  const [contactName, setContactName] = useState(initial?.contactName ?? user.name);
  const [contactEmail, setContactEmail] = useState(initial?.contactEmail ?? user.email);
  const [contactPhone, setContactPhone] = useState(initial?.contactPhone ?? user.phone ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Required";
    if (!field) e.field = "Choose a category";
    if (!description.trim()) e.description = "Describe the work";
    if (skills.length === 0) e.skills = "Add at least one required skill";
    if (!duration.trim()) e.duration = "e.g. 3 months";
    if (!(Number(pay) > 0)) e.pay = "Enter an amount";
    if (!(Number(vacancies) >= 1)) e.vacancies = "At least 1";
    if (mode !== "remote" && !location.trim()) e.location = "Add a location";
    if (showContact && !contactEmail.trim()) e.contactEmail = "Add an email or hide contact details";
    setErrors(e);
    if (Object.keys(e).length) return;
    onSubmit({
      title: title.trim(), field, description: description.trim(), skills, type, mode,
      location: mode === "remote" ? undefined : location.trim(), duration: duration.trim(),
      pay: Number(pay), payType, vacancies: Math.floor(Number(vacancies)), applyBy: applyBy || undefined,
      showContact, contactName: contactName.trim() || undefined, contactEmail: contactEmail.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined, status: initial?.status ?? "open",
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Job title" required placeholder="e.g. Logo & Brand Identity Designer" value={title}
          onChange={(e) => setTitle(e.target.value)} error={errors.title} className="sm:col-span-2" />
        <Select label="Category" required placeholder="Select a category" value={field}
          onChange={(e) => setField(e.target.value)} error={errors.field}
          options={fieldOptions.map((o) => ({ value: o.label, label: o.label }))} />
        <Select label="Job type" value={type} onChange={(e) => setType(e.target.value as JobType)}
          options={Object.entries(jobTypeLabels).map(([value, label]) => ({ value, label }))} />
        <Textarea label="Description" required rows={4} placeholder="What will the Hustler do? What does success look like?"
          value={description} onChange={(e) => setDescription(e.target.value)} error={errors.description}
          className="sm:col-span-2" />
        <div className="sm:col-span-2">
          <SkillsInput value={skills} onChange={setSkills} error={errors.skills} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select label="Work mode" value={mode} onChange={(e) => setMode(e.target.value as WorkMode)}
          options={Object.entries(workModeLabels).map(([value, label]) => ({ value, label }))} />
        {mode !== "remote" ? (
          <Input label="Location" required placeholder="e.g. Pune" value={location}
            onChange={(e) => setLocation(e.target.value)} error={errors.location} />
        ) : (
          <div className="hidden sm:block" />
        )}
        <Input label="Time period" required placeholder="e.g. 3 months" value={duration}
          onChange={(e) => setDuration(e.target.value)} error={errors.duration} />
        <Input label="Vacancies" required type="number" min={1} value={vacancies}
          onChange={(e) => setVacancies(e.target.value)} error={errors.vacancies} />
        <Input label="Pay (₹)" required type="number" min={0} placeholder="e.g. 25000" value={pay}
          onChange={(e) => setPay(e.target.value)} error={errors.pay} />
        <Select label="Pay type" value={payType} onChange={(e) => setPayType(e.target.value as PayType)}
          options={[
            { value: "month", label: "Per month" },
            { value: "hour", label: "Per hour" },
            { value: "project", label: "Per project (fixed)" },
          ]} />
        <Input label="Apply by" type="date" value={applyBy} onChange={(e) => setApplyBy(e.target.value)}
          hint="Optional — last date to apply." />
      </div>

      <div className="rounded-2xl border border-border-subtle bg-bg-secondary/50 p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" checked={showContact} onChange={(e) => setShowContact(e.target.checked)}
            className="mt-1 h-4 w-4 accent-[var(--blue-primary)]" />
          <span>
            <span className="block text-sm font-medium text-text-primary">Show my contact details on this job</span>
            <span className="block text-xs text-text-secondary">
              Applicants can see these. If off, they can only apply through HustleOS.
            </span>
          </span>
        </label>
        {showContact && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input label="Contact name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
            <Input label="Email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
              error={errors.contactEmail} />
            <Input label="Phone (optional)" type="tel" placeholder="+91 …" value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)} />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && <Button variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button onClick={submit}>{submitLabel}</Button>
      </div>
    </div>
  );
}
