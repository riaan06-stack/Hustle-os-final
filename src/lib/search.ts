import type { AppUser, HustlerProfile, HustlerProject, Job, OwnerProfile } from "@/types";

const STOPWORDS = new Set(["a", "an", "the", "and", "or", "for", "with", "in", "of", "to", "need", "needed", "looking", "hire", "find", "i", "we", "who", "can"]);

/** Light stemming so "designer" matches "design", "editor" matches "editing". */
export function stem(word: string): string {
  for (const suffix of ["ers", "ors", "ing", "er", "or", "s"]) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 3) return word.slice(0, -suffix.length);
  }
  return word;
}

export function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter((t) => t && !STOPWORDS.has(t))
    .map(stem);
}

interface Field {
  label: string;
  text: string;
  weight: number;
}

function scoreFields(tokens: string[], fields: Field[]): { score: number; matched: string[] } {
  let score = 0;
  const matched = new Set<string>();
  for (const token of tokens) {
    for (const f of fields) {
      if (f.text.toLowerCase().includes(token)) {
        score += f.weight;
        matched.add(f.label);
      }
    }
  }
  return { score, matched: [...matched] };
}

export interface HustlerEntry {
  user: AppUser;
  profile: HustlerProfile;
  projects: HustlerProject[];
}

export interface HustlerResult extends HustlerEntry {
  score: number;
  matched: string[];
}

export function searchHustlers(entries: HustlerEntry[], query: string): HustlerResult[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return entries.map((e) => ({ ...e, score: 0, matched: [] }));
  return entries
    .map((e) => {
      const { score, matched } = scoreFields(tokens, [
        { label: "Occupation", text: e.profile.occupation, weight: 6 },
        { label: "Designation", text: e.profile.designation, weight: 5 },
        { label: "Field", text: e.profile.field, weight: 4 },
        { label: "Skills", text: e.profile.skills.join(" "), weight: 5 },
        { label: "Services", text: e.profile.services, weight: 2 },
        { label: "Projects", text: e.projects.map((p) => `${p.title} ${p.description ?? ""}`).join(" "), weight: 2 },
        { label: "Bio", text: e.profile.bio, weight: 1 },
        { label: "Name", text: e.user.name, weight: 3 },
      ]);
      return { ...e, score, matched };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

export interface JobResult {
  job: Job;
  company?: OwnerProfile;
  score: number;
  matched: string[];
}

export function searchJobs(
  jobs: Job[],
  companyOf: (ownerId: string) => OwnerProfile | undefined,
  query: string
): JobResult[] {
  const tokens = tokenize(query);
  const rows = jobs.map((job) => ({ job, company: companyOf(job.ownerId) }));
  if (tokens.length === 0) return rows.map((r) => ({ ...r, score: 0, matched: [] }));
  return rows
    .map((r) => {
      const { score, matched } = scoreFields(tokens, [
        { label: "Title", text: r.job.title, weight: 6 },
        { label: "Field", text: r.job.field, weight: 4 },
        { label: "Skills", text: r.job.skills.join(" "), weight: 5 },
        { label: "Company", text: r.company?.companyName ?? "", weight: 3 },
        { label: "Type", text: `${r.job.type} ${r.job.mode}`, weight: 2 },
        { label: "Description", text: r.job.description, weight: 1 },
      ]);
      return { ...r, score, matched };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

/** Skill overlap between a job and a Hustler (0–1). */
export function skillMatch(jobSkills: string[], profile: HustlerProfile): number {
  if (jobSkills.length === 0) return 0;
  const mine = profile.skills.map((s) => s.toLowerCase());
  const hits = jobSkills.filter((s) => mine.some((m) => m.includes(s.toLowerCase()) || s.toLowerCase().includes(m)));
  return hits.length / jobSkills.length;
}
