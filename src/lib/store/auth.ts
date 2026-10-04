"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppUser,
  Application,
  ApplicationStatus,
  CalendarEvent,
  HustlerProfile,
  HustlerProject,
  IncomeRecord,
  Job,
  OwnerProfile,
  ProjectIdea,
  RegisterInput,
  UserRole,
  WorkLog,
} from "@/types";
import { hashPassword } from "@/lib/authHash";
import { buildDemoData } from "@/lib/demoData";
import { newId } from "@/lib/format";

/**
 * MOCK BACKEND LAYER
 * -----------------------------------------------------------------------
 * Frontend-only stand-in for a real backend. Every page talks to the
 * actions and selector hooks exported below — never to localStorage
 * directly — so this one file is what gets replaced when a real backend
 * (e.g. Supabase) is introduced. Credentials are kept in a separate map
 * from user records and are never exposed through any selector.
 * -----------------------------------------------------------------------
 */

type ProjectInput = Omit<HustlerProject, "id" | "userId" | "createdAt">;
type JobInput = Omit<Job, "id" | "ownerId" | "createdAt">;

interface AuthState {
  users: AppUser[];
  credentials: Record<string, string>;
  hustlerProfiles: Record<string, HustlerProfile>;
  ownerProfiles: Record<string, OwnerProfile>;
  hustlerProjects: Record<string, HustlerProject[]>;
  hustlerIdeas: Record<string, ProjectIdea[]>;
  jobs: Job[];
  applications: Application[];
  incomes: IncomeRecord[];
  workLogs: WorkLog[];
  events: CalendarEvent[];
  savedHustlers: Record<string, string[]>;
  currentUserId: string | null;
  pendingRole: UserRole | null;
  hasSeenIntro: boolean;
  demoSeeded: boolean;

  setPendingRole: (role: UserRole) => void;
  markIntroSeen: () => void;
  seedDemoData: () => void;

  register: (input: RegisterInput) => { success: true } | { success: false; error: string };
  login: (email: string, password: string) => { success: true } | { success: false; error: string };
  logout: () => void;
  updateUser: (patch: Partial<Pick<AppUser, "phone" | "name">>) => void;

  saveHustlerProfile: (data: Omit<HustlerProfile, "userId">) => void;
  saveOwnerProfile: (data: Omit<OwnerProfile, "userId">) => void;
  clearHustlerProfile: () => void;
  clearOwnerProfile: () => void;

  addHustlerProject: (data: ProjectInput) => void;
  updateHustlerProject: (id: string, data: ProjectInput) => void;
  deleteHustlerProject: (id: string) => void;
  toggleProjectMilestone: (projectId: string, milestoneId: string) => void;
  toggleProjectPortfolio: (projectId: string) => void;
  addHustlerIdea: (data: Omit<ProjectIdea, "id" | "userId" | "createdAt">) => void;
  deleteHustlerIdea: (id: string) => void;

  addJob: (data: JobInput) => void;
  updateJob: (id: string, data: JobInput) => void;
  deleteJob: (id: string) => void;
  setJobStatus: (id: string, status: Job["status"]) => void;

  applyToJob: (jobId: string, message?: string) => void;
  respondToInvite: (applicationId: string, accept: boolean) => void;
  updateApplicationStatus: (applicationId: string, status: ApplicationStatus) => void;
  inviteHustler: (jobId: string, hustlerId: string) => { success: boolean; error?: string };
  toggleSavedHustler: (hustlerId: string) => void;

  addIncome: (data: Omit<IncomeRecord, "id" | "userId">) => void;
  deleteIncome: (id: string) => void;
  addWorkLog: (projectId: string, hours: number, date: string) => void;
  addEvent: (title: string, date: string) => void;
  deleteEvent: (id: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [],
      credentials: {},
      hustlerProfiles: {},
      ownerProfiles: {},
      hustlerProjects: {},
      hustlerIdeas: {},
      jobs: [],
      applications: [],
      incomes: [],
      workLogs: [],
      events: [],
      savedHustlers: {},
      currentUserId: null,
      pendingRole: null,
      hasSeenIntro: false,
      demoSeeded: false,

      setPendingRole: (role) => set({ pendingRole: role }),
      markIntroSeen: () => set({ hasSeenIntro: true }),

      seedDemoData: () => {
        if (get().demoSeeded) return;
        const d = buildDemoData(new Date());
        set((s) => ({
          users: [...s.users, ...d.users.filter((du) => !s.users.some((u) => u.id === du.id || u.email === du.email))],
          credentials: { ...d.credentials, ...s.credentials },
          hustlerProfiles: { ...d.hustlerProfiles, ...s.hustlerProfiles },
          ownerProfiles: { ...d.ownerProfiles, ...s.ownerProfiles },
          hustlerProjects: { ...d.hustlerProjects, ...s.hustlerProjects },
          hustlerIdeas: { ...d.hustlerIdeas, ...s.hustlerIdeas },
          jobs: [...s.jobs, ...d.jobs.filter((j) => !s.jobs.some((x) => x.id === j.id))],
          applications: [...s.applications, ...d.applications.filter((a) => !s.applications.some((x) => x.id === a.id))],
          incomes: [...s.incomes, ...d.incomes.filter((i) => !s.incomes.some((x) => x.id === i.id))],
          workLogs: [...s.workLogs, ...d.workLogs.filter((w) => !s.workLogs.some((x) => x.id === w.id))],
          events: [...s.events, ...d.events.filter((e) => !s.events.some((x) => x.id === e.id))],
          demoSeeded: true,
        }));
      },

      register: (input) => {
        const { users, pendingRole } = get();
        const email = input.email.trim().toLowerCase();
        if (!pendingRole) return { success: false, error: "Choose an account type first." };
        if (users.some((u) => u.email.toLowerCase() === email)) {
          return { success: false, error: "An account with this email already exists." };
        }
        const id = newId("user");
        const newUser: AppUser = {
          id, role: pendingRole, name: input.name.trim(), age: input.age, gender: input.gender,
          email, createdAt: new Date().toISOString(),
        };
        set((s) => ({
          users: [...s.users, newUser],
          credentials: { ...s.credentials, [email]: hashPassword(input.password) },
          currentUserId: id,
        }));
        return { success: true };
      },

      login: (email, password) => {
        const normalized = email.trim().toLowerCase();
        const { users, credentials } = get();
        const user = users.find((u) => u.email.toLowerCase() === normalized);
        if (!user) return { success: false, error: "No account found with that email." };
        if (credentials[normalized] !== hashPassword(password)) {
          return { success: false, error: "Incorrect password. Try again." };
        }
        set({ currentUserId: user.id });
        return { success: true };
      },

      logout: () => set({ currentUserId: null, pendingRole: null }),

      updateUser: (patch) => {
        const { currentUserId } = get();
        if (!currentUserId) return;
        set((s) => ({ users: s.users.map((u) => (u.id === currentUserId ? { ...u, ...patch } : u)) }));
      },

      saveHustlerProfile: (data) => {
        const { currentUserId } = get();
        if (!currentUserId) return;
        set((s) => ({ hustlerProfiles: { ...s.hustlerProfiles, [currentUserId]: { userId: currentUserId, ...data } } }));
      },
      saveOwnerProfile: (data) => {
        const { currentUserId } = get();
        if (!currentUserId) return;
        set((s) => ({ ownerProfiles: { ...s.ownerProfiles, [currentUserId]: { userId: currentUserId, ...data } } }));
      },
      clearHustlerProfile: () => {
        const { currentUserId } = get();
        if (!currentUserId) return;
        set((s) => {
          const next = { ...s.hustlerProfiles };
          delete next[currentUserId];
          return { hustlerProfiles: next };
        });
      },
      clearOwnerProfile: () => {
        const { currentUserId } = get();
        if (!currentUserId) return;
        set((s) => {
          const next = { ...s.ownerProfiles };
          delete next[currentUserId];
          return { ownerProfiles: next };
        });
      },

      addHustlerProject: (data) => {
        const { currentUserId } = get();
        if (!currentUserId) return;
        const project: HustlerProject = {
          id: newId("project"), userId: currentUserId, createdAt: new Date().toISOString(),
          inPortfolio: data.status !== "pending", ...data,
        };
        set((s) => ({
          hustlerProjects: { ...s.hustlerProjects, [currentUserId]: [...(s.hustlerProjects[currentUserId] ?? []), project] },
        }));
      },
      updateHustlerProject: (id, data) => {
        const { currentUserId } = get();
        if (!currentUserId) return;
        set((s) => ({
          hustlerProjects: {
            ...s.hustlerProjects,
            [currentUserId]: (s.hustlerProjects[currentUserId] ?? []).map((p) => (p.id === id ? { ...p, ...data } : p)),
          },
        }));
      },
      deleteHustlerProject: (id) => {
        const { currentUserId } = get();
        if (!currentUserId) return;
        set((s) => ({
          hustlerProjects: {
            ...s.hustlerProjects,
            [currentUserId]: (s.hustlerProjects[currentUserId] ?? []).filter((p) => p.id !== id),
          },
          workLogs: s.workLogs.filter((w) => w.projectId !== id),
        }));
      },
      toggleProjectMilestone: (projectId, milestoneId) => {
        const { currentUserId } = get();
        if (!currentUserId) return;
        set((s) => ({
          hustlerProjects: {
            ...s.hustlerProjects,
            [currentUserId]: (s.hustlerProjects[currentUserId] ?? []).map((p) =>
              p.id !== projectId ? p : {
                ...p,
                milestones: p.milestones.map((m) => (m.id === milestoneId ? { ...m, completed: !m.completed } : m)),
              }
            ),
          },
        }));
      },
      toggleProjectPortfolio: (projectId) => {
        const { currentUserId } = get();
        if (!currentUserId) return;
        set((s) => ({
          hustlerProjects: {
            ...s.hustlerProjects,
            [currentUserId]: (s.hustlerProjects[currentUserId] ?? []).map((p) =>
              p.id === projectId ? { ...p, inPortfolio: !(p.inPortfolio ?? p.status !== "pending") } : p
            ),
          },
        }));
      },

      addHustlerIdea: (data) => {
        const { currentUserId } = get();
        if (!currentUserId) return;
        const idea: ProjectIdea = { id: newId("idea"), userId: currentUserId, createdAt: new Date().toISOString(), source: "manual", ...data };
        set((s) => ({ hustlerIdeas: { ...s.hustlerIdeas, [currentUserId]: [...(s.hustlerIdeas[currentUserId] ?? []), idea] } }));
      },
      deleteHustlerIdea: (id) => {
        const { currentUserId } = get();
        if (!currentUserId) return;
        set((s) => ({
          hustlerIdeas: { ...s.hustlerIdeas, [currentUserId]: (s.hustlerIdeas[currentUserId] ?? []).filter((i) => i.id !== id) },
        }));
      },

      addJob: (data) => {
        const { currentUserId } = get();
        if (!currentUserId) return;
        const job: Job = { id: newId("job"), ownerId: currentUserId, createdAt: new Date().toISOString(), ...data };
        set((s) => ({ jobs: [job, ...s.jobs] }));
      },
      updateJob: (id, data) => set((s) => ({ jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...data } : j)) })),
      deleteJob: (id) => set((s) => ({
        jobs: s.jobs.filter((j) => j.id !== id),
        applications: s.applications.filter((a) => a.jobId !== id),
      })),
      setJobStatus: (id, status) => set((s) => ({ jobs: s.jobs.map((j) => (j.id === id ? { ...j, status } : j)) })),

      applyToJob: (jobId, message) => {
        const { currentUserId, applications } = get();
        if (!currentUserId) return;
        const existing = applications.find((a) => a.jobId === jobId && a.hustlerId === currentUserId);
        if (existing) {
          if (existing.status === "invited") {
            set((s) => ({
              applications: s.applications.map((a) => (a.id === existing.id ? { ...a, status: "applied", message } : a)),
            }));
          }
          return;
        }
        const app: Application = {
          id: newId("app"), jobId, hustlerId: currentUserId, status: "applied", message, createdAt: new Date().toISOString(),
        };
        set((s) => ({ applications: [app, ...s.applications] }));
      },
      respondToInvite: (applicationId, accept) => set((s) => ({
        applications: accept
          ? s.applications.map((a) => (a.id === applicationId ? { ...a, status: "applied" as ApplicationStatus } : a))
          : s.applications.filter((a) => a.id !== applicationId),
      })),
      updateApplicationStatus: (applicationId, status) => set((s) => ({
        applications: s.applications.map((a) => (a.id === applicationId ? { ...a, status } : a)),
      })),
      inviteHustler: (jobId, hustlerId) => {
        const { applications } = get();
        if (applications.some((a) => a.jobId === jobId && a.hustlerId === hustlerId)) {
          return { success: false, error: "This Hustler has already applied or been invited." };
        }
        const app: Application = {
          id: newId("app"), jobId, hustlerId, status: "invited", createdAt: new Date().toISOString(),
        };
        set((s) => ({ applications: [app, ...s.applications] }));
        return { success: true };
      },
      toggleSavedHustler: (hustlerId) => {
        const { currentUserId } = get();
        if (!currentUserId) return;
        set((s) => {
          const list = s.savedHustlers[currentUserId] ?? [];
          return {
            savedHustlers: {
              ...s.savedHustlers,
              [currentUserId]: list.includes(hustlerId) ? list.filter((x) => x !== hustlerId) : [...list, hustlerId],
            },
          };
        });
      },

      addIncome: (data) => {
        const { currentUserId } = get();
        if (!currentUserId) return;
        set((s) => ({ incomes: [...s.incomes, { id: newId("inc"), userId: currentUserId, ...data }] }));
      },
      deleteIncome: (id) => set((s) => ({ incomes: s.incomes.filter((i) => i.id !== id) })),
      addWorkLog: (projectId, hours, date) => {
        const { currentUserId } = get();
        if (!currentUserId) return;
        set((s) => ({ workLogs: [...s.workLogs, { id: newId("log"), userId: currentUserId, projectId, date, hours }] }));
      },
      addEvent: (title, date) => {
        const { currentUserId } = get();
        if (!currentUserId) return;
        set((s) => ({ events: [...s.events, { id: newId("evt"), userId: currentUserId, title, date }] }));
      },
      deleteEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
    }),
    {
      name: "hustleos-auth",
      partialize: (s) => ({
        users: s.users, credentials: s.credentials, hustlerProfiles: s.hustlerProfiles,
        ownerProfiles: s.ownerProfiles, hustlerProjects: s.hustlerProjects, hustlerIdeas: s.hustlerIdeas,
        jobs: s.jobs, applications: s.applications, incomes: s.incomes, workLogs: s.workLogs,
        events: s.events, savedHustlers: s.savedHustlers, currentUserId: s.currentUserId,
        hasSeenIntro: s.hasSeenIntro, demoSeeded: s.demoSeeded,
      }),
    }
  )
);

/* ------------------------------ selectors ------------------------------ */

const EMPTY: never[] = [];

export function useCurrentUser(): AppUser | null {
  const currentUserId = useAuthStore((s) => s.currentUserId);
  const users = useAuthStore((s) => s.users);
  return users.find((u) => u.id === currentUserId) ?? null;
}

export function useHustlerProfile(): HustlerProfile | null {
  const id = useAuthStore((s) => s.currentUserId);
  const profiles = useAuthStore((s) => s.hustlerProfiles);
  return id ? profiles[id] ?? null : null;
}

export function useOwnerProfile(): OwnerProfile | null {
  const id = useAuthStore((s) => s.currentUserId);
  const profiles = useAuthStore((s) => s.ownerProfiles);
  return id ? profiles[id] ?? null : null;
}

export function useHustlerProjects(): HustlerProject[] {
  const id = useAuthStore((s) => s.currentUserId);
  const projects = useAuthStore((s) => s.hustlerProjects);
  return (id ? projects[id] : undefined) ?? EMPTY;
}

export function useHustlerIdeas(): ProjectIdea[] {
  const id = useAuthStore((s) => s.currentUserId);
  const ideas = useAuthStore((s) => s.hustlerIdeas);
  return (id ? ideas[id] : undefined) ?? EMPTY;
}

export function useMyIncomes(): IncomeRecord[] {
  const id = useAuthStore((s) => s.currentUserId);
  const all = useAuthStore((s) => s.incomes);
  return useMemo(() => all.filter((i) => i.userId === id), [all, id]);
}

export function useMyWorkLogs(): WorkLog[] {
  const id = useAuthStore((s) => s.currentUserId);
  const all = useAuthStore((s) => s.workLogs);
  return useMemo(() => all.filter((w) => w.userId === id), [all, id]);
}

export function useMyEvents(): CalendarEvent[] {
  const id = useAuthStore((s) => s.currentUserId);
  const all = useAuthStore((s) => s.events);
  return useMemo(() => all.filter((e) => e.userId === id), [all, id]);
}

export function useMyApplications(): Application[] {
  const id = useAuthStore((s) => s.currentUserId);
  const all = useAuthStore((s) => s.applications);
  return useMemo(() => all.filter((a) => a.hustlerId === id), [all, id]);
}

export function useOwnerJobs(): Job[] {
  const id = useAuthStore((s) => s.currentUserId);
  const all = useAuthStore((s) => s.jobs);
  return useMemo(() => all.filter((j) => j.ownerId === id), [all, id]);
}

export function useOwnerApplications(): Application[] {
  const id = useAuthStore((s) => s.currentUserId);
  const jobs = useAuthStore((s) => s.jobs);
  const apps = useAuthStore((s) => s.applications);
  return useMemo(() => {
    const mine = new Set(jobs.filter((j) => j.ownerId === id).map((j) => j.id));
    return apps.filter((a) => mine.has(a.jobId));
  }, [jobs, apps, id]);
}

export function useSavedHustlerIds(): string[] {
  const id = useAuthStore((s) => s.currentUserId);
  const saved = useAuthStore((s) => s.savedHustlers);
  return (id ? saved[id] : undefined) ?? EMPTY;
}
