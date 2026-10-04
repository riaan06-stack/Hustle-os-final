"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, BookmarkCheck, Clock, FolderKanban, Search, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SearchBar } from "@/components/ui/SearchBar";
import { Select } from "@/components/ui/Select";
import { EmptyState, LoadingState } from "@/components/ui/States";
import { HustlerProfileView } from "@/components/hustlers/HustlerProfileView";
import { ownerNav } from "@/components/layout/navConfig";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthStore, useSavedHustlerIds } from "@/lib/store/auth";
import { useHustlerEntries } from "@/lib/useHustlers";
import { searchHustlers, type HustlerEntry } from "@/lib/search";
import { availabilityLabels, experienceLabels } from "@/lib/labels";
import { displayName } from "@/lib/format";
import { calcHustlerCompletion, cn } from "@/lib/utils";

const POPULAR = ["graphic designer", "video editor", "React developer", "data analyst", "content writer", "UI/UX designer", "SEO"];

export default function FindHustlersPage() {
  const { ready } = useRequireAuth("owner");
  const entries = useHustlerEntries();
  const savedIds = useSavedHustlerIds();
  const toggleSaved = useAuthStore((s) => s.toggleSavedHustler);

  const [query, setQuery] = useState(() =>
    typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("q") ?? ""
  );
  const [availability, setAvailability] = useState("");
  const [experience, setExperience] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [viewing, setViewing] = useState<HustlerEntry | null>(null);

  const results = useMemo(() => {
    let rows = searchHustlers(entries, query);
    if (availability) rows = rows.filter((r) => r.profile.availability === availability);
    if (experience) rows = rows.filter((r) => r.profile.experience === experience);
    if (savedOnly) rows = rows.filter((r) => savedIds.includes(r.user.id));
    if (!query.trim()) rows = [...rows].sort((a, b) => calcHustlerCompletion(b.profile) - calcHustlerCompletion(a.profile));
    return rows;
  }, [entries, query, availability, experience, savedOnly, savedIds]);

  if (!ready) return <LoadingState label="Loading Hustlers…" />;

  return (
    <AppShell items={ownerNav}>
      <PageContainer className="py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          <div className="flex items-center gap-2 text-sm font-medium text-blue-soft"><Users className="h-4 w-4" />Talent directory</div>
          <h1 className="mt-2 font-display text-2xl font-bold text-text-primary sm:text-3xl">Find Hustlers</h1>
          <p className="mt-1 text-text-secondary">Search by role, skill or project. Profiles show professional details only. Contact details stay private.</p>

          <SearchBar className="mt-6" value={query} onChange={setQuery} autoFocus
            placeholder='Try "graphic designer", "React", "video editor"…' />
          <div className="mt-3 flex flex-wrap gap-2">
            {POPULAR.map((p) => (
              <button key={p} type="button" onClick={() => setQuery(p)}
                className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  query.toLowerCase() === p.toLowerCase() ? "border-blue-primary bg-blue-primary/12 text-blue-soft" : "border-border-subtle bg-bg-card text-text-secondary hover:border-blue-primary/50 hover:text-blue-soft")}>
                {p}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Select label="Availability" placeholder="Any availability" value={availability} onChange={(e) => setAvailability(e.target.value)}
              options={Object.entries(availabilityLabels).map(([value, label]) => ({ value, label }))} />
            <Select label="Experience" placeholder="Any experience" value={experience} onChange={(e) => setExperience(e.target.value)}
              options={Object.entries(experienceLabels).map(([value, label]) => ({ value, label }))} />
            <div className="flex items-end gap-2">
              <Button variant={savedOnly ? "primary" : "secondary"} onClick={() => setSavedOnly((v) => !v)} className="flex-1">
                <Bookmark className="h-4 w-4" />Saved only ({savedIds.length})
              </Button>
              {(availability || experience || savedOnly || query) && (
                <Button variant="ghost" onClick={() => { setAvailability(""); setExperience(""); setSavedOnly(false); setQuery(""); }}>Clear</Button>
              )}
            </div>
          </div>

          <p className="mt-5 text-sm text-text-secondary">
            {results.length} Hustler{results.length === 1 ? "" : "s"}{query.trim() ? ` matching “${query.trim()}”` : " on HustleOS"}
          </p>

          <div className="mt-3">
            {results.length === 0 ? (
              <EmptyState icon={<Search className="h-5 w-5" />} title="No Hustlers found"
                description="Try a broader search such as “design” or “developer”, or clear the filters." />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {results.map((r, i) => {
                  const isSaved = savedIds.includes(r.user.id);
                  const shown = r.projects.filter((p) => p.inPortfolio ?? p.status !== "pending").length;
                  return (
                    <motion.div key={r.user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.03, duration: 0.3 }}>
                      <Card interactive onClick={() => setViewing(r)} className="flex h-full flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-primary to-blue-dark font-bold text-white">
                              {r.user.name[0]?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-display font-semibold text-text-primary">{displayName(r.user.name)}</p>
                              <p className="truncate text-sm text-text-secondary">{r.profile.designation || r.profile.occupation}</p>
                            </div>
                          </div>
                          <button type="button" aria-label={isSaved ? "Remove from saved" : "Save Hustler"}
                            onClick={(e) => { e.stopPropagation(); toggleSaved(r.user.id); }}
                            className="rounded-lg p-1.5 text-text-secondary hover:bg-black/5 hover:text-blue-soft">
                            {isSaved ? <BookmarkCheck className="h-5 w-5 text-blue-soft" /> : <Bookmark className="h-5 w-5" />}
                          </button>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {r.profile.occupation && <Badge variant="blue">{r.profile.occupation}</Badge>}
                          {r.profile.field && <Badge>{r.profile.field}</Badge>}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {r.profile.skills.slice(0, 4).map((s) => <span key={s} className="rounded-full bg-black/5 px-2.5 py-1 text-xs text-text-secondary">{s}</span>)}
                          {r.profile.skills.length > 4 && <span className="px-1 py-1 text-xs text-text-secondary">+{r.profile.skills.length - 4}</span>}
                        </div>
                        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4 text-xs text-text-secondary">
                          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{availabilityLabels[r.profile.availability] ?? r.profile.availability}</span>
                          <span className="flex items-center gap-1.5"><FolderKanban className="h-3.5 w-3.5" />{shown} project{shown === 1 ? "" : "s"}</span>
                          <span className="font-medium text-text-primary">{r.profile.expectedRate}</span>
                        </div>
                        {query.trim() && r.matched.length > 0 && <p className="mt-2 text-[11px] text-text-secondary">Matched on: {r.matched.join(", ")}</p>}
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </PageContainer>
      <HustlerProfileView entry={viewing} onClose={() => setViewing(null)} />
    </AppShell>
  );
}
