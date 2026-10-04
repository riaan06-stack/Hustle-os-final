"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, TrendingUp, Wallet } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState, LoadingState } from "@/components/ui/States";
import { hustlerNav } from "@/components/layout/navConfig";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthStore, useHustlerProjects, useMyIncomes } from "@/lib/store/auth";
import { formatDate, formatINR, lastMonthKeys, monthKey, monthLabel, parseDate, toISODate } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function IncomePage() {
  const { ready } = useRequireAuth("hustler");
  const incomes = useMyIncomes();
  const projects = useHustlerProjects();
  const addIncome = useAuthStore((s) => s.addIncome);
  const deleteIncome = useAuthStore((s) => s.deleteIncome);

  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => toISODate(new Date()));
  const [projectId, setProjectId] = useState("");

  const months = useMemo(() => lastMonthKeys(12), []);
  const data = useMemo(() => {
    const totals = months.map((key) => ({
      key,
      amount: incomes.filter((i) => parseDate(i.date) && monthKey(parseDate(i.date)!) === key).reduce((s, i) => s + i.amount, 0),
    }));
    const total = totals.reduce((s, m) => s + m.amount, 0);
    const best = totals.reduce((b, m) => (m.amount > b.amount ? m : b), totals[0]);
    const earning = totals.filter((m) => m.amount > 0).length;
    const byProject = new Map<string, number>();
    incomes.forEach((i) => {
      const name = projects.find((p) => p.id === i.projectId)?.title ?? "Other income";
      byProject.set(name, (byProject.get(name) ?? 0) + i.amount);
    });
    return {
      totals,
      total,
      best,
      avg: earning ? Math.round(total / earning) : 0,
      thisMonth: totals[totals.length - 1].amount,
      max: Math.max(1, ...totals.map((t) => t.amount)),
      breakdown: [...byProject.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6),
    };
  }, [months, incomes, projects]);

  const sorted = useMemo(() => [...incomes].sort((a, b) => b.date.localeCompare(a.date)), [incomes]);

  if (!ready) return <LoadingState label="Loading your income…" />;

  function save() {
    if (!label.trim() || !(Number(amount) > 0) || !date) return;
    addIncome({ label: label.trim(), amount: Number(amount), date, projectId: projectId || undefined });
    setOpen(false);
    setLabel("");
    setAmount("");
    setProjectId("");
  }

  return (
    <AppShell items={hustlerNav}>
      <PageContainer className="py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-blue-soft"><Wallet className="h-4 w-4" />Track what you earn</div>
              <h1 className="mt-2 font-display text-2xl font-bold text-text-primary sm:text-3xl">Income</h1>
              <p className="mt-1 text-text-secondary">Log payments as they arrive and see your last 12 months at a glance.</p>
            </div>
            <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Add income</Button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Last 12 months" value={formatINR(data.total)} icon={<TrendingUp className="h-4 w-4" />} />
            <StatCard label="This month" value={formatINR(data.thisMonth)} />
            <StatCard label="Best month" value={data.best && data.best.amount > 0 ? formatINR(data.best.amount) : "—"} hint={data.best && data.best.amount > 0 ? monthLabel(data.best.key, true) : undefined} />
            <StatCard label="Average / earning month" value={formatINR(data.avg)} />
          </div>

          <Card className="mt-4">
            <h2 className="font-display font-semibold text-text-primary">Monthly income</h2>
            <div className="mt-6 flex h-52 items-end gap-1.5 sm:gap-3" role="img" aria-label="Bar chart of monthly income">
              {data.totals.map((m, i) => {
                const isBest = data.best?.key === m.key && m.amount > 0;
                return (
                  <div key={m.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                    <motion.div
                      title={`${monthLabel(m.key, true)}: ${formatINR(m.amount)}`}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(m.amount > 0 ? 4 : 0, (m.amount / data.max) * 100)}%` }}
                      transition={{ duration: 0.6, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                      className={cn("w-full rounded-t-lg", isBest ? "bg-blue-primary" : "bg-blue-primary/35")}
                    />
                    <span className="text-[10px] text-text-secondary sm:text-xs">{monthLabel(m.key)}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card>
              <h2 className="font-display font-semibold text-text-primary">By project</h2>
              {data.breakdown.length === 0 ? (
                <p className="mt-3 text-sm text-text-secondary">No income yet.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {data.breakdown.map(([name, value]) => (
                    <li key={name}>
                      <div className="flex justify-between gap-3 text-sm">
                        <span className="truncate text-text-primary">{name}</span>
                        <span className="shrink-0 font-medium text-text-primary">{formatINR(value)}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg-secondary">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(value / data.breakdown[0][1]) * 100}%` }} transition={{ duration: 0.6 }} className="h-full rounded-full bg-blue-primary" />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="lg:col-span-2">
              <h2 className="font-display font-semibold text-text-primary">All payments</h2>
              {sorted.length === 0 ? (
                <div className="mt-4"><EmptyState icon={<Wallet className="h-5 w-5" />} title="No income logged" description="Add your first payment to start tracking." /></div>
              ) : (
                <ul className="mt-4 divide-y divide-border-subtle">
                  {sorted.map((i) => (
                    <li key={i.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-primary">{i.label}</p>
                        <p className="text-xs text-text-secondary">{formatDate(i.date)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-text-primary">{formatINR(i.amount)}</span>
                        <button type="button" onClick={() => deleteIncome(i.id)} aria-label={`Delete ${i.label}`} className="rounded-lg p-1.5 text-text-secondary hover:bg-black/5 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </motion.div>
      </PageContainer>

      <Modal open={open} onClose={() => setOpen(false)} title="Add income">
        <div className="space-y-4">
          <Input label="What was it for?" required placeholder="e.g. Final payment — Kirana Kart" value={label} onChange={(e) => setLabel(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Amount (₹)" required type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Input label="Date" required type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <Select label="Project (optional)" placeholder="Not linked to a project" value={projectId} onChange={(e) => setProjectId(e.target.value)}
            options={projects.map((p) => ({ value: p.id, label: p.title }))} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!label.trim() || !(Number(amount) > 0) || !date}>Save</Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
