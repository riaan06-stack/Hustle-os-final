"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/States";
import { hustlerNav } from "@/components/layout/navConfig";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthStore, useHustlerProjects, useMyEvents } from "@/lib/store/auth";
import { formatDate, toISODate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Item {
  id: string;
  title: string;
  kind: "deadline" | "event";
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const { ready } = useRequireAuth("hustler");
  const projects = useHustlerProjects();
  const events = useMyEvents();
  const addEvent = useAuthStore((s) => s.addEvent);
  const deleteEvent = useAuthStore((s) => s.deleteEvent);

  const today = toISODate(new Date());
  const [cursor, setCursor] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selected, setSelected] = useState(today);
  const [title, setTitle] = useState("");

  const byDate = useMemo(() => {
    const map = new Map<string, Item[]>();
    const push = (date: string, item: Item) => map.set(date, [...(map.get(date) ?? []), item]);
    projects.forEach((p) => {
      if (p.deadline && /^\d{4}-\d{2}-\d{2}$/.test(p.deadline) && p.status !== "completed") {
        push(p.deadline, { id: p.id, title: `${p.title} due`, kind: "deadline" });
      }
    });
    events.forEach((e) => push(e.date, { id: e.id, title: e.title, kind: "event" }));
    return map;
  }, [projects, events]);

  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = new Date(first.getFullYear(), first.getMonth(), 1 - first.getDay());
    return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }, [cursor]);

  const monthTitle = cursor.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const dayItems = byDate.get(selected) ?? [];

  if (!ready) return <LoadingState label="Loading your calendar…" />;

  function shift(delta: number) {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  }

  return (
    <AppShell items={hustlerNav}>
      <PageContainer className="py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          <div className="flex items-center gap-2 text-sm font-medium text-blue-soft"><CalendarDays className="h-4 w-4" />Stay on schedule</div>
          <h1 className="mt-2 font-display text-2xl font-bold text-text-primary sm:text-3xl">Calendar</h1>
          <p className="mt-1 text-text-secondary">Project deadlines appear automatically. Add your own events too.</p>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-text-primary">{monthTitle}</h2>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => shift(-1)} aria-label="Previous month"><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="secondary" size="sm" onClick={() => { setCursor(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); setSelected(today); }}>Today</Button>
                  <Button variant="ghost" size="sm" onClick={() => shift(1)} aria-label="Next month"><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                {WEEKDAYS.map((d) => <div key={d} className="py-1">{d}</div>)}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {cells.map((d) => {
                  const iso = toISODate(d);
                  const inMonth = d.getMonth() === cursor.getMonth();
                  const items = byDate.get(iso) ?? [];
                  const isToday = iso === today;
                  const isSel = iso === selected;
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => setSelected(iso)}
                      aria-label={`${formatDate(iso)}${items.length ? `, ${items.length} item(s)` : ""}`}
                      className={cn(
                        "flex aspect-square min-h-[44px] flex-col items-center justify-start rounded-xl border p-1 text-sm transition-colors sm:min-h-[64px] sm:p-1.5",
                        inMonth ? "text-text-primary" : "text-text-secondary/40",
                        isSel ? "border-blue-primary bg-blue-primary/10" : "border-transparent hover:bg-black/5",
                        isToday && !isSel && "border-blue-primary/40"
                      )}
                    >
                      <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium", isToday && "bg-blue-primary text-white")}>{d.getDate()}</span>
                      <span className="mt-1 flex gap-0.5">
                        {items.slice(0, 3).map((it, i) => (
                          <span key={i} className={cn("h-1.5 w-1.5 rounded-full", it.kind === "deadline" ? "bg-blue-primary" : "bg-yellow")} />
                        ))}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex gap-4 text-xs text-text-secondary">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-primary" />Project deadline</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-yellow" />Your event</span>
              </div>
            </Card>

            <Card>
              <h2 className="font-display font-semibold text-text-primary">{formatDate(selected)}</h2>
              {dayItems.length === 0 ? (
                <p className="mt-3 text-sm text-text-secondary">Nothing scheduled.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {dayItems.map((it) => (
                    <li key={it.id} className="flex items-center justify-between gap-2 rounded-xl border border-border-subtle p-3">
                      <span className="flex min-w-0 items-center gap-2 text-sm text-text-primary">
                        <span className={cn("h-2 w-2 shrink-0 rounded-full", it.kind === "deadline" ? "bg-blue-primary" : "bg-yellow")} />
                        <span className="truncate">{it.title}</span>
                      </span>
                      {it.kind === "event" && (
                        <button type="button" onClick={() => deleteEvent(it.id)} aria-label={`Delete ${it.title}`} className="rounded-lg p-1 text-text-secondary hover:bg-black/5 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <form
                className="mt-5 space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!title.trim()) return;
                  addEvent(title.trim(), selected);
                  setTitle("");
                }}
              >
                <Input label="Add an event on this day" placeholder="e.g. Client call at 4 pm" value={title} onChange={(e) => setTitle(e.target.value)} />
                <Button type="submit" fullWidth disabled={!title.trim()}><Plus className="h-4 w-4" />Add event</Button>
              </form>
            </Card>
          </div>
        </motion.div>
      </PageContainer>
    </AppShell>
  );
}
