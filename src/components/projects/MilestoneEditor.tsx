"use client";

import { KeyboardEvent, useState } from "react";
import { X } from "lucide-react";
import type { ProjectMilestone } from "@/types";

export function MilestoneEditor({
  milestones,
  onChange,
}: {
  milestones: ProjectMilestone[];
  onChange: (milestones: ProjectMilestone[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function addMilestone() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([
      ...milestones,
      { id: `ms_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, title: trimmed, completed: false },
    ]);
    setDraft("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addMilestone();
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-text-primary">Milestones</label>
      {milestones.length > 0 && (
        <ul className="mb-2 space-y-1.5">
          {milestones.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-card px-3 py-2 text-sm text-text-primary"
            >
              <span className="truncate">{m.title}</span>
              <button
                type="button"
                onClick={() => onChange(milestones.filter((x) => x.id !== m.id))}
                aria-label={`Remove ${m.title}`}
                className="ml-3 shrink-0 text-text-secondary hover:text-red-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Design mockups approved"
          className="h-10 flex-1 rounded-lg border border-border-subtle bg-bg-card px-3 text-sm text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-blue-primary/40 focus:border-blue-primary"
        />
        <button
          type="button"
          onClick={addMilestone}
          className="rounded-lg border border-border-subtle bg-bg-card px-3 text-sm font-medium text-text-secondary hover:border-blue-primary/50 hover:text-blue-soft"
        >
          Add
        </button>
      </div>
      <p className="mt-1.5 text-sm text-text-secondary">Optional — break the project into checkable steps.</p>
    </div>
  );
}