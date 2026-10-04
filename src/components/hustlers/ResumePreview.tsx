import type { HustlerProfile, HustlerProject } from "@/types";
import { educationLabels, experienceLabels } from "@/lib/labels";

/** A resume generated from the Hustler's profile + portfolio projects. */
export function ResumePreview({
  name,
  email,
  profile,
  projects,
}: {
  name: string;
  email?: string;
  profile: HustlerProfile;
  projects: HustlerProject[];
}) {
  return (
    <article className="rounded-xl border border-border-subtle bg-white p-6 text-[13px] leading-relaxed text-text-primary sm:p-8">
      <header className="border-b border-border-subtle pb-4">
        <h3 className="font-display text-2xl font-bold">{name}</h3>
        <p className="mt-0.5 text-sm text-text-secondary">
          {profile.designation || profile.occupation}
          {email ? ` · ${email}` : ""}
        </p>
      </header>

      {profile.bio && (
        <section className="mt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-blue-soft">Summary</h4>
          <p className="mt-1 text-text-secondary">{profile.bio}</p>
        </section>
      )}

      {profile.skills.length > 0 && (
        <section className="mt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-blue-soft">Skills</h4>
          <p className="mt-1">{profile.skills.join(" · ")}</p>
        </section>
      )}

      {projects.length > 0 && (
        <section className="mt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-blue-soft">Selected projects</h4>
          <ul className="mt-1 space-y-2">
            {projects.map((p) => (
              <li key={p.id}>
                <p className="font-medium">
                  {p.title} <span className="font-normal text-text-secondary">— {p.clientName}</span>
                </p>
                {p.description && <p className="text-text-secondary">{p.description}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-blue-soft">Education</h4>
          <p className="mt-1">
            {profile.educationStatus ? educationLabels[profile.educationStatus] ?? profile.educationStatus : "Not specified"}
            {profile.cgpa ? ` · CGPA ${profile.cgpa}` : ""}
          </p>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-blue-soft">Experience</h4>
          <p className="mt-1">{experienceLabels[profile.experience] ?? (profile.experience || "Not specified")}</p>
        </div>
      </section>
    </article>
  );
}
