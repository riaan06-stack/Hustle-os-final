export type UserRole = "hustler" | "owner";

export interface AppUser {
  id: string;
  role: UserRole;
  name: string;
  age: string;
  gender: string;
  email: string;
  /** Optional contact number (used by Owners on job posts). */
  phone?: string;
  createdAt: string;
  /** True for the pre-loaded demo accounts. */
  isDemo?: boolean;
}

export interface HustlerProfile {
  userId: string;
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
  /** Just the file name — no real upload/storage backend yet (mock phase). */
  resumeFileName?: string;
}

export interface OwnerProfile {
  userId: string;
  companyName: string;
  industry: string;
  designation: string;
  description: string;
  website?: string;
  freelancerRequirements: string;
}

export interface RegisterInput {
  name: string;
  age: string;
  gender: string;
  email: string;
  password: string;
}

export type ProjectStatus = "active" | "pending" | "completed";

export interface ProjectMilestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface HustlerProject {
  id: string;
  userId: string;
  title: string;
  clientName: string;
  status: ProjectStatus;
  /** ISO date (yyyy-mm-dd) — older records may contain free text. */
  deadline?: string;
  budget?: string;
  description?: string;
  githubUrl?: string;
  liveUrl?: string;
  progress: number;
  milestones: ProjectMilestone[];
  /** Whether the project appears on the Hustler's public portfolio. */
  inPortfolio?: boolean;
  createdAt: string;
}

export interface ProjectIdea {
  id: string;
  userId: string;
  title: string;
  description?: string;
  /** "suggested" when saved from the idea-suggestion engine. */
  source?: "manual" | "suggested";
  createdAt: string;
}

/* ---------------- Jobs / marketplace ---------------- */

export type JobType = "full-time" | "part-time" | "contract" | "internship" | "freelance";
export type WorkMode = "remote" | "onsite" | "hybrid";
export type PayType = "month" | "hour" | "project";

export interface Job {
  id: string;
  ownerId: string;
  title: string;
  field: string;
  description: string;
  skills: string[];
  type: JobType;
  mode: WorkMode;
  location?: string;
  /** Free text, e.g. "3 months". */
  duration: string;
  pay: number;
  payType: PayType;
  vacancies: number;
  /** ISO date (yyyy-mm-dd). */
  applyBy?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  showContact: boolean;
  status: "open" | "closed";
  createdAt: string;
}

export type ApplicationStatus = "invited" | "applied" | "shortlisted" | "hired" | "rejected";

export interface Application {
  id: string;
  jobId: string;
  hustlerId: string;
  status: ApplicationStatus;
  message?: string;
  createdAt: string;
}

/* ---------------- Hustler productivity ---------------- */

export interface IncomeRecord {
  id: string;
  userId: string;
  label: string;
  amount: number;
  /** ISO date. */
  date: string;
  projectId?: string;
}

export interface WorkLog {
  id: string;
  userId: string;
  projectId: string;
  /** ISO date. */
  date: string;
  hours: number;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  /** ISO date. */
  date: string;
}
