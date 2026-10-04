"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, animate, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Pause, Play, RotateCcw, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { EmptyState, LoadingState } from "@/components/ui/States";
import { hustlerNav } from "@/components/layout/navConfig";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useHustlerProjects, useMyIncomes, useMyWorkLogs } from "@/lib/store/auth";
import { computeWrapped, type WrappedStats } from "@/lib/wrapped";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

const SLIDE_MS = 7000;

function CountUp({ value, format = (n: number) => String(n) }: { value: number; format?: (n: number) => string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, { duration: 1.3, ease: "easeOut", onUpdate: (v) => setN(Math.round(v)) });
    return () => controls.stop();
  }, [value]);
  return <>{format(n)}</>;
}

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

interface Slide {
  key: string;
  bg: string;
  fg: string;
  content: ReactNode;
}

function buildSlides(s: WrappedStats): Slide[] {
  const slides: Slide[] = [
    {
      key: "intro", bg: "from-blue-dark via-blue-bright to-blue-primary", fg: "text-white",
      content: (
        <div className="flex h-full flex-col justify-center">
          <motion.div {...rise(0)}><Sparkles className="h-8 w-8" /></motion.div>
          <motion.p {...rise(0.15)} className="mt-6 text-sm font-medium uppercase tracking-[0.2em] opacity-80">Last 12 months</motion.p>
          <motion.h2 {...rise(0.3)} className="mt-3 font-display text-5xl font-extrabold leading-[1.05]">Your Hustle<br />Wrapped</motion.h2>
          <motion.p {...rise(0.5)} className="mt-6 text-lg opacity-90">Let&apos;s look at what you built.</motion.p>
        </div>
      ),
    },
    {
      key: "hours", bg: "from-yellow via-yellow to-blue-primary", fg: "text-text-primary",
      content: (
        <div className="flex h-full flex-col justify-center">
          <motion.p {...rise(0)} className="text-lg font-medium">You put in</motion.p>
          <motion.p {...rise(0.15)} className="font-display text-8xl font-extrabold leading-none"><CountUp value={s.totalHours} /></motion.p>
          <motion.p {...rise(0.3)} className="mt-1 font-display text-3xl font-bold">hours of hustle</motion.p>
          <motion.p {...rise(0.6)} className="mt-6 text-base opacity-85">
            across {s.sessions} sessions and {s.activeDays} different days. That&apos;s about {Math.max(1, Math.round(s.totalHours / 8))} full working days.
          </motion.p>
        </div>
      ),
    },
  ];

  if (s.topProject) {
    slides.push({
      key: "top", bg: "from-text-primary to-blue-dark", fg: "text-white",
      content: (
        <div className="flex h-full flex-col justify-center">
          <motion.p {...rise(0)} className="text-sm font-medium uppercase tracking-[0.2em] opacity-80">Your #1 project</motion.p>
          <motion.h2 {...rise(0.2)} className="mt-4 font-display text-4xl font-extrabold leading-tight">{s.topProject.title}</motion.h2>
          <motion.p {...rise(0.5)} className="mt-6 text-lg opacity-90">
            <span className="font-display text-5xl font-bold text-yellow"><CountUp value={s.topProject.hours} />h</span>
            <br />
            That&apos;s {s.topProject.share}% of all your hustle time.
          </motion.p>
        </div>
      ),
    });
    slides.push({
      key: "ranking", bg: "from-blue-primary to-blue-dark", fg: "text-white",
      content: (
        <div className="flex h-full flex-col justify-center">
          <motion.h2 {...rise(0)} className="font-display text-3xl font-extrabold">Your top projects</motion.h2>
          <ol className="mt-6 space-y-4">
            {s.ranking.map((p, i) => (
              <motion.li key={p.id} {...rise(0.2 + i * 0.12)}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-medium"><span className="mr-2 font-display text-lg font-bold opacity-70">{i + 1}</span>{p.title}</span>
                  <span className="shrink-0 font-semibold">{p.hours}h</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/20">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(p.hours / s.ranking[0].hours) * 100}%` }}
                    transition={{ delay: 0.5 + i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="h-full rounded-full bg-yellow" />
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      ),
    });
  }

  if (s.peakMonth) {
    const max = Math.max(1, ...s.monthly.map((m) => m.hours));
    slides.push({
      key: "peak", bg: "from-yellow to-blue-bright", fg: "text-text-primary",
      content: (
        <div className="flex h-full flex-col justify-center">
          <motion.p {...rise(0)} className="text-sm font-medium uppercase tracking-[0.2em] opacity-80">Your peak month</motion.p>
          <motion.h2 {...rise(0.15)} className="mt-2 font-display text-4xl font-extrabold leading-tight">{s.peakMonth.label}</motion.h2>
          <motion.p {...rise(0.3)} className="mt-1 text-lg">{s.peakMonth.hours} hours. Nothing could stop you.</motion.p>
          <div className="mt-8 flex h-44 items-end gap-1.5">
            {s.monthly.map((m, i) => (
              <div key={m.key} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(m.hours ? 4 : 0, (m.hours / max) * 100)}%` }}
                  transition={{ delay: 0.4 + i * 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className={cn("w-full rounded-t-md", m.key === s.peakMonth!.key ? "bg-text-primary" : "bg-text-primary/30")} />
                <span className="text-[9px] font-medium opacity-75">{m.label[0]}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    });
  }

  slides.push({
    key: "rhythm", bg: "from-text-primary to-blue-bright", fg: "text-white",
    content: (
      <div className="flex h-full flex-col justify-center gap-6">
        <motion.h2 {...rise(0)} className="font-display text-3xl font-extrabold">Your rhythm</motion.h2>
        {[
          ["Busiest day", s.busiestWeekday ? s.busiestWeekday.name : "—"],
          ["Longest streak", `${s.longestStreak} day${s.longestStreak === 1 ? "" : "s"} in a row`],
          ["Average session", `${s.avgSession.toFixed(1)} hours`],
        ].map(([k, v], i) => (
          <motion.div key={k} {...rise(0.2 + i * 0.15)}>
            <p className="text-sm uppercase tracking-[0.15em] opacity-70">{k}</p>
            <p className="font-display text-3xl font-bold text-yellow">{v}</p>
          </motion.div>
        ))}
      </div>
    ),
  });

  slides.push({
    key: "personality", bg: "from-blue-primary via-blue-bright to-blue-dark", fg: "text-white",
    content: (
      <div className="flex h-full flex-col justify-center">
        <motion.p {...rise(0)} className="text-sm font-medium uppercase tracking-[0.2em] opacity-80">You are</motion.p>
        <motion.h2 {...rise(0.2)} className="mt-3 font-display text-5xl font-extrabold leading-[1.05]">{s.personality.title}</motion.h2>
        <motion.p {...rise(0.5)} className="mt-6 text-lg opacity-90">{s.personality.blurb}</motion.p>
      </div>
    ),
  });

  if (s.income.total > 0) {
    slides.push({
      key: "income", bg: "from-yellow to-blue-primary", fg: "text-text-primary",
      content: (
        <div className="flex h-full flex-col justify-center">
          <motion.p {...rise(0)} className="text-lg font-medium">Your hustle earned</motion.p>
          <motion.p {...rise(0.15)} className="font-display text-5xl font-extrabold leading-tight"><CountUp value={s.income.total} format={formatINR} /></motion.p>
          {s.income.bestMonth && (
            <motion.p {...rise(0.5)} className="mt-6 text-base opacity-90">
              Your best month was <strong>{s.income.bestMonth.label}</strong> with {formatINR(s.income.bestMonth.amount)}.
            </motion.p>
          )}
        </div>
      ),
    });
  }

  slides.push({
    key: "outro", bg: "from-blue-dark via-text-primary to-text-primary", fg: "text-white",
    content: (
      <div className="flex h-full flex-col justify-center">
        <motion.p {...rise(0)} className="text-sm font-medium uppercase tracking-[0.2em] opacity-80">That&apos;s a wrap</motion.p>
        <motion.h2 {...rise(0.15)} className="mt-3 font-display text-4xl font-extrabold leading-tight">
          {s.totalHours}h · {s.projectCount} projects{s.topProject ? ` · #1 ${s.topProject.title}` : ""}
        </motion.h2>
        <motion.p {...rise(0.4)} className="mt-6 text-lg opacity-90">Keep going. The best month is the next one.</motion.p>
      </div>
    ),
  });

  return slides;
}

export default function WrappedPage() {
  const { ready } = useRequireAuth("hustler");
  const logs = useMyWorkLogs();
  const projects = useHustlerProjects();
  const incomes = useMyIncomes();
  const stats = useMemo(() => computeWrapped(logs, projects, incomes), [logs, projects, incomes]);
  const slides = useMemo(() => buildSlides(stats), [stats]);

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const last = slides.length - 1;

  useEffect(() => {
    if (!playing || index >= last) return;
    const t = setTimeout(() => setIndex((i) => Math.min(i + 1, last)), SLIDE_MS);
    return () => clearTimeout(t);
  }, [index, playing, last]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, last));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [last]);

  if (!ready) return <LoadingState label="Loading your Wrapped…" />;

  const slide = slides[index];

  return (
    <AppShell items={hustlerNav}>
      <PageContainer className="py-8">
        <div className="flex items-center gap-2 text-sm font-medium text-blue-soft"><Sparkles className="h-4 w-4" />Your year in hustle</div>
        <h1 className="mt-2 font-display text-2xl font-bold text-text-primary sm:text-3xl">Hustle Wrapped</h1>
        <p className="mt-1 text-text-secondary">Built from the hours you log on projects. Tap the sides or use the arrows.</p>

        {!stats.hasData ? (
          <div className="mt-8">
            <EmptyState icon={<Sparkles className="h-5 w-5" />} title="Nothing to wrap yet"
              description="Log time on your projects and your recap will appear here."
              action={<Link href="/projects/hustler"><Button size="sm">Go to My Projects</Button></Link>} />
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center">
            <div
              className={cn("relative w-full max-w-sm overflow-hidden rounded-3xl bg-gradient-to-br shadow-xl", slide.bg, slide.fg)}
              style={{ height: "min(660px, calc(100svh - 340px))", minHeight: 440 }}
            >
              <div className="absolute inset-x-4 top-4 z-20 flex gap-1.5">
                {slides.map((s, i) => (
                  <div key={s.key} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
                    {i < index || (i === index && index === last) ? (
                      <div className="h-full w-full rounded-full bg-white" />
                    ) : i === index ? (
                      <div
                        key={index}
                        className="story-fill h-full rounded-full bg-white"
                        style={{ animationDuration: `${SLIDE_MS}ms`, animationPlayState: playing ? "running" : "paused" }}
                      />
                    ) : null}
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={slide.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="absolute inset-0 px-7 pb-8 pt-14">
                  {slide.content}
                </motion.div>
              </AnimatePresence>

              <button type="button" aria-label="Previous slide" className="absolute inset-y-0 left-0 z-10 w-1/3" onClick={() => setIndex((i) => Math.max(i - 1, 0))} />
              <button type="button" aria-label="Next slide" className="absolute inset-y-0 right-0 z-10 w-2/3" onClick={() => setIndex((i) => Math.min(i + 1, last))} />
            </div>

            <div className="mt-5 flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={() => setIndex((i) => Math.max(i - 1, 0))} disabled={index === 0}><ArrowLeft className="h-4 w-4" />Back</Button>
              <Button variant="secondary" size="sm" onClick={() => setPlaying((p) => !p)}>
                {playing ? <><Pause className="h-4 w-4" />Pause</> : <><Play className="h-4 w-4" />Play</>}
              </Button>
              {index === last ? (
                <Button size="sm" onClick={() => { setIndex(0); setPlaying(true); }}><RotateCcw className="h-4 w-4" />Replay</Button>
              ) : (
                <Button size="sm" onClick={() => setIndex((i) => Math.min(i + 1, last))}>Next<ArrowRight className="h-4 w-4" /></Button>
              )}
            </div>
            <p className="mt-3 text-xs text-text-secondary">{index + 1} / {slides.length}</p>
          </div>
        )}
      </PageContainer>
    </AppShell>
  );
}
