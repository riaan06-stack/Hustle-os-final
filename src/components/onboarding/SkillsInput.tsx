"use client";

import { KeyboardEvent, useState } from "react";
import { X, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function SkillsInput({
  value,
  onChange,
  error,
  suggestions,
}: {
  value: string[];
  onChange: (skills: string[]) => void;
  error?: string;
  /** Optional "trending" skills shown as quick-add chips below the input. */
  suggestions?: string[];
}) {
  const [draft, setDraft] = useState("");

  function addSkill(skill?: string) {
    const trimmed = (skill ?? draft).trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    if (!skill) setDraft("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  const unusedSuggestions = (suggestions ?? []).filter((s) => !value.includes(s));

  return (
    <div className="w-full sm:col-span-2">
      <label className="mb-1.5 block text-sm font-medium text-text-primary">
        Skills <span className="ml-1 text-blue-bright">*</span>
      </label>
      <div
        className={cn(
          "flex min-h-12 w-full flex-wrap items-center gap-2 rounded-xl border bg-bg-card px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-primary/40 focus-within:border-blue-primary",
          error ? "border-red-500/60" : "border-border-subtle"
        )}
      >
        {value.map((skill) => (
          <span
            key={skill}
            className="flex items-center gap-1.5 rounded-full bg-blue-primary/12 px-3 py-1 text-sm text-blue-soft"
          >
            {skill}
            <button
              type="button"
              onClick={() => onChange(value.filter((s) => s !== skill))}
              aria-label={`Remove ${skill}`}
              className="hover:text-blue-dark"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addSkill()}
          placeholder={value.length === 0 ? "e.g. UI Design, React, Copywriting" : "Add another…"}
          className="min-w-[120px] flex-1 bg-transparent text-[15px] text-text-primary placeholder:text-text-secondary/70 focus:outline-none"
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      ) : (
        <p className="mt-1.5 text-sm text-text-secondary">
          Press Enter or comma to add a skill.
        </p>
      )}

      {unusedSuggestions.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
            <TrendingUp className="h-3.5 w-3.5 text-blue-soft" />
            Trending right now
          </p>
          <div className="flex flex-wrap gap-2">
            {unusedSuggestions.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => addSkill(skill)}
                className="rounded-full border border-border-subtle bg-bg-secondary px-3 py-1 text-xs font-medium text-text-secondary transition-colors hover:border-blue-primary/50 hover:text-blue-soft"
              >
                + {skill}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}