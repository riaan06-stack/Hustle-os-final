import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Hustler completion is intentionally capped below 100% — see
 * `HUSTLER_COMPLETION_CAP`. The platform's philosophy is that there's
 * always a little more hustle left in you.
 */
const HUSTLER_COMPLETION_CAP = 95;

export function calcHustlerCompletion(profile: {
  occupation: string;
  field: string;
  designation: string;
  skills: string[];
  experience: string;
  services: string;
  bio: string;
  availability: string;
  expectedRate: string;
  educationStatus?: string;
  cgpa?: string;
  resumeFileName?: string;
}): number {
  const fields = [
    profile.occupation,
    profile.field,
    profile.designation,
    profile.skills.length > 0 ? "x" : "",
    profile.experience,
    profile.services,
    profile.bio,
    profile.availability,
    profile.expectedRate,
    profile.educationStatus ?? "",
    profile.cgpa ?? "",
    profile.resumeFileName ?? "",
  ];
  const filled = fields.filter((f) => f && f.trim().length > 0).length;
  const raw = Math.round((filled / fields.length) * 100);
  return Math.min(HUSTLER_COMPLETION_CAP, raw);
}

/** Shown once a Hustler's profile is essentially done, to explain the cap. */
export function hustlerCompletionTagline(completion: number): string | null {
  if (completion < HUSTLER_COMPLETION_CAP) return null;
  return "That last 5% is hunger — it's what keeps a Hustler ahead of everyone else.";
}

export function calcOwnerCompletion(profile: {
  companyName: string;
  industry: string;
  designation: string;
  description: string;
  website?: string;
  freelancerRequirements: string;
}): number {
  const fields = [
    profile.companyName,
    profile.industry,
    profile.designation,
    profile.description,
    profile.freelancerRequirements,
  ];
  const filled = fields.filter((f) => f && f.trim().length > 0).length;
  return Math.round((filled / fields.length) * 100);
}