"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Plus, RefreshCw, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { generateIdeaSuggestions, type IdeaSuggestion } from "@/lib/ideas";
import type { HustlerProfile } from "@/types";

const PROMPT_CHIPS = ["fitness", "local cafés", "students", "sustainability", "finance", "travel"];

export function IdeaSuggestions({
  profile,
  existingTitles,
  onSave,
}: {
  profile: HustlerProfile | null;
  existingTitles: string[];
  onSave: (title: string, description: string) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<IdeaSuggestion[]>([]);
  const [round, setRound] = useState(0);
  const [saved, setSaved] = useState<string[]>([]);

  async function run(nextRound: number, text = prompt) {
    setLoading(true);
    const out = await generateIdeaSuggestions({ prompt: text, profile, existingTitles, round: nextRound });
    setResults(out);
    setRound(nextRound);
    setLoading(false);
  }

  return (
    <div className="rounded-2xl border border-blue-primary/25 bg-blue-primary/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-soft" />
          <h3 className="font-display font-semibold text-text-primary">Idea engine</h3>
          <Badge variant="blue">Beta</Badge>
        </div>
        <p className="text-xs text-text-secondary">Built-in suggestion engine. A real AI model plugs in here in a later phase.</p>
      </div>
      <p className="mt-2 text-sm text-text-secondary">
        Tell it what you&apos;re curious about. It combines that with your skills to suggest projects worth building.
      </p>

      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => { e.preventDefault(); void run(0); }}
      >
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='e.g. "fitness", "local cafés", "students"'
          aria-label="What are you interested in?"
          className="h-12 flex-1 rounded-xl border border-border-subtle bg-bg-card px-4 text-[15px] text-text-primary placeholder:text-text-secondary/70 focus:border-blue-primary focus:outline-none focus:ring-2 focus:ring-blue-primary/40"
        />
        <Button type="submit" size="lg" loading={loading}>
          <Sparkles className="h-4 w-4" />
          Suggest ideas
        </Button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {PROMPT_CHIPS.map((c) => (
          <button key={c} type="button" onClick={() => { setPrompt(c); void run(0, c); }}
            className="rounded-full border border-border-subtle bg-bg-card px-3 py-1 text-xs font-medium text-text-secondary hover:border-blue-primary/50 hover:text-blue-soft">
            {c}
          </button>
        ))}
      </div>

      {loading && (
        <p className="mt-5 flex items-center gap-2 text-sm text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin text-blue-soft" />
          Thinking up ideas for you…
        </p>
      )}

      {!loading && results.length > 0 && (
        <div className="mt-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {results.map((idea, i) => {
                const isSaved = saved.includes(idea.id);
                return (
                  <motion.div
                    key={idea.id}
                    initial={{ opacity: 0, y: 14, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.08, type: "spring", stiffness: 260, damping: 22 }}
                    className="flex flex-col rounded-xl border border-border-subtle bg-bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-display font-semibold text-text-primary">{idea.title}</p>
                      <Badge>{idea.effort}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-text-secondary">{idea.pitch}</p>
                    <p className="mt-2 text-xs italic text-text-secondary">{idea.why}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {idea.tags.map((t) => <span key={t} className="rounded-full bg-black/5 px-2.5 py-0.5 text-[11px] text-text-secondary">{t}</span>)}
                    </div>
                    <div className="mt-auto pt-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={isSaved}
                        onClick={() => { onSave(idea.title, idea.pitch); setSaved((s) => [...s, idea.id]); }}
                      >
                        {isSaved ? <><Check className="h-4 w-4" />Saved to my ideas</> : <><Plus className="h-4 w-4" />Save to my ideas</>}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="secondary" size="sm" onClick={() => void run(round + 1)}>
              <RefreshCw className="h-4 w-4" />
              More ideas
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
