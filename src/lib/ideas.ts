import type { HustlerProfile } from "@/types";

export interface IdeaSuggestion {
  id: string;
  title: string;
  pitch: string;
  why: string;
  effort: string;
  tags: string[];
}

type Category = "web" | "mobile" | "design" | "video" | "data" | "writing" | "marketing" | "general";

interface Template {
  title: string;
  pitch: string;
  effort: string;
  tags: string[];
}

const KEYWORDS: Record<Exclude<Category, "general">, string[]> = {
  web: ["react", "next", "web", "frontend", "backend", "node", "javascript", "typescript", "software", "developer", "shopify"],
  mobile: ["mobile", "flutter", "android", "ios", "app", "react native"],
  design: ["design", "figma", "logo", "brand", "illustrator", "ui", "ux", "canva", "photoshop", "graphic"],
  video: ["video", "edit", "premiere", "reel", "motion", "animation", "after effects", "film"],
  data: ["data", "python", "sql", "analytics", "power bi", "excel", "dashboard", "machine learning"],
  writing: ["writ", "content", "blog", "copy", "seo", "editor"],
  marketing: ["market", "ads", "social", "growth", "campaign", "funnel"],
};

/**
 * Template library for the built-in idea engine. This is deliberately
 * rule-based (no external AI service in Phase 1): `generateIdeaSuggestions`
 * has an async signature so a real model can be swapped in later without
 * changing any page that uses it.
 */
const TEMPLATES: Record<Category, Template[]> = {
  web: [
    { title: "{T} booking & reminders web app", pitch: "A simple booking flow with email reminders for local {t} businesses who still take bookings on WhatsApp.", effort: "1–2 weeks", tags: ["Next.js", "Forms", "Email"] },
    { title: "Mini CRM for {t} freelancers", pitch: "Track leads, follow-ups and invoices in one lightweight dashboard built for {t} freelancers.", effort: "1 month", tags: ["Dashboard", "Auth"] },
    { title: "{T} price comparison dashboard", pitch: "Scrape or import prices and show a clean comparison table with alerts for {t} products.", effort: "1–2 weeks", tags: ["Data", "Charts"] },
    { title: "Browser extension for {t} research", pitch: "A one-click extension that saves, tags and summarises pages while you research {t}.", effort: "Weekend", tags: ["Extension", "JavaScript"] },
    { title: "{T} community board with upvotes", pitch: "A small community site where people share and upvote the best {t} resources.", effort: "1–2 weeks", tags: ["Community", "Database"] },
  ],
  mobile: [
    { title: "{T} habit tracker with streaks", pitch: "A calm mobile app that turns {t} goals into daily streaks with gentle reminders.", effort: "1–2 weeks", tags: ["Mobile", "Notifications"] },
    { title: "Offline-first {t} notes app", pitch: "Capture {t} notes with voice and photos that sync when you're back online.", effort: "1 month", tags: ["Offline", "Sync"] },
    { title: "QR check-in app for {t} events", pitch: "Organisers scan a QR code to check in attendees at {t} meetups in seconds.", effort: "1–2 weeks", tags: ["QR", "Events"] },
    { title: "{T} flashcards with spaced repetition", pitch: "Learn {t} faster with a flashcard app that schedules reviews for you.", effort: "1–2 weeks", tags: ["Learning", "Mobile"] },
  ],
  design: [
    { title: "Rebrand case study: a {t} brand that doesn't exist yet", pitch: "Invent a {t} brand and design everything: logo, colour system, social kit and packaging. Perfect portfolio piece.", effort: "1–2 weeks", tags: ["Branding", "Case study"] },
    { title: "{T} app redesign teardown", pitch: "Pick a popular {t} app, document its UX problems and publish a redesigned flow with reasoning.", effort: "1–2 weeks", tags: ["UX", "Prototype"] },
    { title: "Design system starter kit for {t} startups", pitch: "A Figma kit with tokens, components and a usage guide that {t} startups can adopt in a day.", effort: "1 month", tags: ["Design system", "Figma"] },
    { title: "30-day {t} poster challenge", pitch: "Design one {t} poster a day for 30 days and publish the series as a mini exhibition.", effort: "1 month", tags: ["Posters", "Consistency"] },
  ],
  video: [
    { title: "60-second explainer series about {t}", pitch: "A six-part vertical series that explains {t} concepts with punchy hooks and captions.", effort: "1–2 weeks", tags: ["Reels", "Storytelling"] },
    { title: "{T} reel template pack", pitch: "Sell or share editable reel templates for {t} creators with built-in captions and transitions.", effort: "1–2 weeks", tags: ["Templates", "Motion"] },
    { title: "Mini-documentary: a day at a local {t} business", pitch: "A 4-minute behind-the-scenes film that doubles as a showreel piece.", effort: "1–2 weeks", tags: ["Documentary", "Colour"] },
    { title: "Before/after edit breakdowns for {t}", pitch: "Short videos that show raw footage vs final cut for {t} content, with commentary.", effort: "Weekend", tags: ["Breakdown", "Education"] },
  ],
  data: [
    { title: "{T} public data dashboard", pitch: "Turn an open {t} dataset into an interactive dashboard that tells one clear story.", effort: "1–2 weeks", tags: ["Dashboard", "Open data"] },
    { title: "What the data says: {t} trends report", pitch: "A short, visual report on the biggest {t} trends this year, with every chart reproducible.", effort: "1–2 weeks", tags: ["Analysis", "Report"] },
    { title: "Automated weekly {t} KPI email", pitch: "A script that pulls numbers, builds charts and emails a one-page {t} KPI summary every Monday.", effort: "Weekend", tags: ["Automation", "Python"] },
    { title: "Churn & retention template for {t} apps", pitch: "A reusable notebook that calculates cohorts and churn for any {t} subscription business.", effort: "1 month", tags: ["Cohorts", "SQL"] },
  ],
  writing: [
    { title: "Beginner's guide to {t}, as a newsletter", pitch: "A 6-issue email course that takes a complete beginner through {t} step by step.", effort: "1–2 weeks", tags: ["Newsletter", "Education"] },
    { title: "10 case studies on {t} businesses", pitch: "Interview small {t} businesses and publish tidy case studies with real numbers.", effort: "1 month", tags: ["Interviews", "SEO"] },
    { title: "SEO content calendar for {t} brands", pitch: "A 90-day keyword-led editorial plan that {t} brands can copy and use.", effort: "1–2 weeks", tags: ["SEO", "Planning"] },
    { title: "Product description templates for {t} stores", pitch: "A pack of fill-in-the-blank templates that make {t} product pages convert.", effort: "Weekend", tags: ["Copywriting", "E-commerce"] },
  ],
  marketing: [
    { title: "Ad funnel teardown for a local {t} business", pitch: "Audit a real {t} business's funnel and publish a before/after improvement plan.", effort: "1–2 weeks", tags: ["Ads", "Funnel"] },
    { title: "30-day {t} social growth experiment", pitch: "Grow a new {t} page from zero in public, logging every tactic and number.", effort: "1 month", tags: ["Social", "Experiment"] },
    { title: "Welcome email sequence for {t} brands", pitch: "A five-email onboarding sequence template tested on a {t} newsletter.", effort: "Weekend", tags: ["Email", "Copy"] },
  ],
  general: [
    { title: "{T} idea validation sprint", pitch: "Talk to ten potential users about {t} this week and publish what you learned.", effort: "Weekend", tags: ["Research", "Validation"] },
    { title: "Build-in-public log for a {t} product", pitch: "Start a tiny {t} product and share progress weekly. Great for attracting clients.", effort: "1 month", tags: ["Public", "Portfolio"] },
    { title: "{T} resource directory", pitch: "Curate the best tools, templates and people in {t} into a clean, searchable page.", effort: "Weekend", tags: ["Curation", "SEO"] },
  ],
};

const STOP = new Set(["i", "a", "an", "the", "and", "or", "for", "with", "to", "of", "in", "on", "want", "like", "make", "build", "create", "something", "about", "idea", "ideas", "app", "project", "my", "me", "some", "that", "is", "it"]);

function detectCategories(text: string): Category[] {
  const lower = text.toLowerCase();
  const scored = (Object.keys(KEYWORDS) as Exclude<Category, "general">[])
    .map((c) => ({ c, n: KEYWORDS[c].filter((k) => lower.includes(k)).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .map((x) => x.c);
  return scored.length ? scored : ["general"];
}

function extractTopic(prompt: string, profile: HustlerProfile | null): string {
  const words = prompt
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w && !STOP.has(w));
  if (words.length) return words.slice(0, 3).join(" ");
  if (profile?.field) return profile.field.toLowerCase().split("&")[0].trim();
  return "local business";
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function fill(text: string, topic: string): string {
  return text.replaceAll("{T}", cap(topic)).replaceAll("{t}", topic);
}

export async function generateIdeaSuggestions(input: {
  prompt: string;
  profile: HustlerProfile | null;
  existingTitles: string[];
  round?: number;
}): Promise<IdeaSuggestion[]> {
  const { prompt, profile, existingTitles, round = 0 } = input;
  const context = `${prompt} ${profile?.skills.join(" ") ?? ""} ${profile?.occupation ?? ""} ${profile?.field ?? ""}`;
  const cats = detectCategories(context);
  const topic = extractTopic(prompt, profile);

  const pool: { t: Template; cat: Category }[] = [];
  const order = [...cats, "general" as Category];
  order.forEach((cat) => TEMPLATES[cat].forEach((t) => pool.push({ t, cat })));

  const taken = new Set(existingTitles.map((x) => x.toLowerCase()));
  const picks: IdeaSuggestion[] = [];
  const start = pool.length ? (round * 3) % pool.length : 0;
  for (let i = 0; i < pool.length && picks.length < 4; i++) {
    const { t, cat } = pool[(start + i) % pool.length];
    const title = fill(t.title, topic);
    if (taken.has(title.toLowerCase())) continue;
    taken.add(title.toLowerCase());
    const skills = profile?.skills.slice(0, 2).join(" & ");
    picks.push({
      id: `sugg_${round}_${i}_${title.length}`,
      title,
      pitch: fill(t.pitch, topic),
      effort: t.effort,
      tags: t.tags,
      why: skills
        ? `Matches your ${skills} skills${prompt.trim() ? ` and your interest in "${topic}"` : ""}.`
        : `Fits your interest in "${topic}".`,
    });
    void cat;
  }

  // Small delay so the UI can show a "thinking" state, like a real model call would.
  await new Promise((r) => setTimeout(r, 900));
  return picks;
}
