import type { HustlerProject, IncomeRecord, WorkLog } from "@/types";
import { lastMonthKeys, monthKey, monthLabel, parseDate } from "./format";

export interface WrappedStats {
  hasData: boolean;
  totalHours: number;
  sessions: number;
  activeDays: number;
  projectCount: number;
  avgSession: number;
  longestStreak: number;
  topProject: { id: string; title: string; hours: number; share: number } | null;
  ranking: { id: string; title: string; hours: number }[];
  monthly: { key: string; label: string; hours: number }[];
  peakMonth: { key: string; label: string; hours: number } | null;
  busiestWeekday: { name: string; hours: number } | null;
  personality: { title: string; blurb: string };
  income: { total: number; bestMonth: { label: string; amount: number } | null };
}

const WEEKDAYS = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];

export function computeWrapped(
  logs: WorkLog[],
  projects: HustlerProject[],
  incomes: IncomeRecord[],
  now = new Date()
): WrappedStats {
  const months = lastMonthKeys(12, now);
  const inRange = logs.filter((l) => {
    const d = parseDate(l.date);
    return d && months.includes(monthKey(d));
  });

  const monthly = months.map((key) => ({
    key,
    label: monthLabel(key),
    hours: inRange.filter((l) => monthKey(parseDate(l.date)!) === key).reduce((s, l) => s + l.hours, 0),
  }));

  const totalHours = inRange.reduce((s, l) => s + l.hours, 0);
  const byProject = new Map<string, number>();
  inRange.forEach((l) => byProject.set(l.projectId, (byProject.get(l.projectId) ?? 0) + l.hours));
  const ranking = [...byProject.entries()]
    .map(([id, hours]) => ({ id, title: projects.find((p) => p.id === id)?.title ?? "Deleted project", hours }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 5);
  const topProject = ranking[0]
    ? { ...ranking[0], share: totalHours ? Math.round((ranking[0].hours / totalHours) * 100) : 0 }
    : null;

  const peak = monthly.reduce((best, m) => (m.hours > (best?.hours ?? 0) ? m : best), null as (typeof monthly)[number] | null);
  const peakMonth = peak && peak.hours > 0 ? { ...peak, label: monthLabel(peak.key, true) } : null;

  const dayHours = new Map<number, number>();
  const dates = new Set<string>();
  inRange.forEach((l) => {
    const d = parseDate(l.date)!;
    dayHours.set(d.getDay(), (dayHours.get(d.getDay()) ?? 0) + l.hours);
    dates.add(l.date);
  });
  const bestDay = [...dayHours.entries()].sort((a, b) => b[1] - a[1])[0];
  const busiestWeekday = bestDay ? { name: WEEKDAYS[bestDay[0]], hours: bestDay[1] } : null;

  const sorted = [...dates].sort();
  let longest = sorted.length ? 1 : 0;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = (parseDate(sorted[i])!.getTime() - parseDate(sorted[i - 1])!.getTime()) / 86400000;
    run = diff === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  const sessions = inRange.length;
  const avgSession = sessions ? totalHours / sessions : 0;
  const peakShare = peakMonth && totalHours ? peakMonth.hours / totalHours : 0;

  let personality = { title: "The Steady Builder", blurb: "You show up, you ship, and you keep a calm, reliable rhythm." };
  if (peakShare > 0.28) personality = { title: "The Sprinter", blurb: "You do your best work in intense bursts, and when you lock in, nothing stops you." };
  else if (avgSession >= 4.5) personality = { title: "The Deep Diver", blurb: "Long, focused sessions are your thing. You go deep before you come up for air." };
  else if (longest >= 3) personality = { title: "The Consistent One", blurb: "Day after day you keep the momentum going. Consistency is your superpower." };

  const incomeInRange = incomes.filter((i) => {
    const d = parseDate(i.date);
    return d && months.includes(monthKey(d));
  });
  const incomeByMonth = new Map<string, number>();
  incomeInRange.forEach((i) => {
    const k = monthKey(parseDate(i.date)!);
    incomeByMonth.set(k, (incomeByMonth.get(k) ?? 0) + i.amount);
  });
  const bestIncome = [...incomeByMonth.entries()].sort((a, b) => b[1] - a[1])[0];

  return {
    hasData: totalHours > 0,
    totalHours,
    sessions,
    activeDays: dates.size,
    projectCount: byProject.size,
    avgSession,
    longestStreak: longest,
    topProject,
    ranking,
    monthly,
    peakMonth,
    busiestWeekday,
    personality,
    income: {
      total: incomeInRange.reduce((s, i) => s + i.amount, 0),
      bestMonth: bestIncome ? { label: monthLabel(bestIncome[0], true), amount: bestIncome[1] } : null,
    },
  };
}
