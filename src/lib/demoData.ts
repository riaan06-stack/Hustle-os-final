import type {
  AppUser,
  Application,
  CalendarEvent,
  HustlerProfile,
  HustlerProject,
  IncomeRecord,
  Job,
  OwnerProfile,
  ProjectIdea,
  ProjectStatus,
  WorkLog,
} from "@/types";
import { hashPassword } from "./authHash";
import { toISODate } from "./format";

/* ---- Demo logins (shown on the login screen) ---- */
export const DEMO_HUSTLER_EMAIL = "aarav@hustleos.demo";
export const DEMO_HUSTLER_PASSWORD = "Hustle@123";
export const DEMO_OWNER_EMAIL = "meera@hustleos.demo";
export const DEMO_OWNER_PASSWORD = "Owner@123";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface DemoProject {
  title: string;
  client: string;
  status: ProjectStatus;
  budget?: string;
  description: string;
  github?: string;
  live?: string;
  progress: number;
  milestones: [string, boolean][];
  deadlineInDays?: number;
  /** months-ago → total hours that month */
  hours: Record<number, number>;
}

interface DemoHustler {
  id: string;
  name: string;
  age: string;
  gender: string;
  email: string;
  occupation: string;
  field: string;
  designation: string;
  skills: string[];
  experience: string;
  services: string;
  bio: string;
  availability: string;
  expectedRate: string;
  educationStatus: string;
  cgpa?: string;
  resume: string;
  projects: DemoProject[];
}

const hustlers: DemoHustler[] = [
  {
    id: "demo_h1", name: "Aarav Mehta", age: "21", gender: "male", email: DEMO_HUSTLER_EMAIL,
    occupation: "Web Developer", field: "Software & Web Development", designation: "Full-Stack Developer",
    skills: ["React", "Next.js", "TypeScript", "Node.js", "Figma", "Tailwind CSS"],
    experience: "intermediate", services: "Landing pages, dashboards, small business web apps",
    bio: "Final-year student who ships clean, fast web apps for small businesses. I like turning messy requirements into simple interfaces people actually enjoy using.",
    availability: "part-time", expectedRate: "₹800/hr", educationStatus: "student", cgpa: "8.6/10",
    resume: "Aarav_Mehta_Resume.pdf",
    projects: [
      { title: "Inventory Dashboard", client: "Kirana Kart", status: "active", budget: "₹40,000", progress: 65, deadlineInDays: 12,
        description: "Stock tracking dashboard with low-stock alerts and weekly sales reports for a grocery chain.",
        github: "https://github.com/aarav-mehta/inventory-dashboard",
        milestones: [["Requirements signed off", true], ["Data model & API", true], ["Dashboard UI", true], ["Reports module", false], ["Deployment & handover", false]],
        hours: { 0: 22, 1: 41, 2: 36, 3: 12 } },
      { title: "Portfolio Website Redesign", client: "Studio Nine", status: "completed", budget: "₹25,000", progress: 100,
        description: "Complete redesign and rebuild of a photography studio portfolio with a fast gallery and booking form.",
        github: "https://github.com/aarav-mehta/studio-nine", live: "https://studionine.example.com",
        milestones: [["Design approved", true], ["Gallery built", true], ["Booking form", true], ["Launch", true]],
        hours: { 6: 18, 7: 34, 8: 20 } },
      { title: "Café Ordering App", client: "Brew & Co", status: "completed", budget: "₹32,000", progress: 100,
        description: "Table-side ordering web app so customers can order from their phones without installing anything.",
        github: "https://github.com/aarav-mehta/brew-orders", live: "https://brewandco.example.com",
        milestones: [["Menu management", true], ["Cart & checkout", true], ["Kitchen display", true]],
        hours: { 9: 25, 10: 38, 11: 14 } },
      { title: "FitNest Landing Page", client: "FitNest Gym", status: "completed", budget: "₹18,000", progress: 100,
        description: "High-converting landing page with membership calculator.",
        live: "https://fitnest.example.com",
        milestones: [["Wireframes", true], ["Build", true], ["Launch", true]],
        hours: { 4: 16, 5: 22 } },
      { title: "Habit Tracker PWA", client: "Personal project", status: "pending", progress: 15, deadlineInDays: 30,
        description: "Offline-first habit tracker with streak sharing.",
        milestones: [["Idea validation", true], ["UI kit", false], ["Offline sync", false]],
        hours: { 0: 4, 1: 6 } },
    ],
  },
  {
    id: "demo_h2", name: "Diya Sharma", age: "22", gender: "female", email: "diya@hustleos.demo",
    occupation: "Graphic Designer", field: "Graphic Design", designation: "Brand & Graphic Designer",
    skills: ["Logo Design", "Branding", "Illustrator", "Photoshop", "Canva", "Typography"],
    experience: "experienced", services: "Logos, brand identity kits, social media creatives, packaging",
    bio: "I design brands that look memorable and feel honest. Three years of freelance work with cafés, startups and local D2C brands.",
    availability: "flexible", expectedRate: "₹15,000/project", educationStatus: "graduate", cgpa: "9.1/10",
    resume: "Diya_Sharma_Resume.pdf",
    projects: [
      { title: "Chai Tapri Brand Identity", client: "Chai Tapri", status: "completed", budget: "₹22,000", progress: 100,
        description: "Logo, colour system, menu and packaging for a street-style chai brand.", live: "https://behance.example.com/chai-tapri",
        milestones: [["Moodboard", true], ["Logo concepts", true], ["Brand guide", true]], hours: { 2: 26, 3: 31 } },
      { title: "Bloom Skincare Packaging", client: "Bloom Naturals", status: "completed", budget: "₹28,000", progress: 100,
        description: "Packaging system for a 6-product skincare line.", live: "https://behance.example.com/bloom",
        milestones: [["Research", true], ["Dielines", true], ["Final art", true]], hours: { 5: 22, 6: 28 } },
      { title: "Festival Campaign Creatives", client: "Northbeam Studio", status: "active", budget: "₹14,000", progress: 50, deadlineInDays: 9,
        description: "A set of 30 social creatives for the festive season.",
        milestones: [["Concepts", true], ["Static posts", false], ["Stories & reels covers", false]], hours: { 0: 18, 1: 9 } },
    ],
  },
  {
    id: "demo_h3", name: "Kabir Nair", age: "23", gender: "male", email: "kabir@hustleos.demo",
    occupation: "Video Editor", field: "Video Editing & Animation", designation: "Video Editor & Motion Designer",
    skills: ["Premiere Pro", "After Effects", "DaVinci Resolve", "Motion Graphics", "Reels", "Colour Grading"],
    experience: "experienced", services: "Reels, YouTube edits, ad films, motion graphics",
    bio: "Fast turnarounds, clean cuts and scroll-stopping hooks. I edit for creators, restaurants and D2C brands.",
    availability: "full-time", expectedRate: "₹12,000/project", educationStatus: "graduate", resume: "Kabir_Nair_Resume.pdf",
    projects: [
      { title: "YouTube Channel Revamp", client: "Tech with Tanmay", status: "completed", budget: "₹30,000", progress: 100,
        description: "Edited 12 long-form videos with new intro/outro package.", live: "https://youtube.example.com/techwithtanmay",
        milestones: [["Style guide", true], ["Batch 1", true], ["Batch 2", true]], hours: { 3: 40, 4: 36 } },
      { title: "Restaurant Reels Pack", client: "Spice Route", status: "active", budget: "₹16,000", progress: 70, deadlineInDays: 6,
        description: "20 short-form reels for a restaurant launch.",
        milestones: [["Shoot review", true], ["Edits 1–10", true], ["Edits 11–20", false]], hours: { 0: 24, 1: 12 } },
    ],
  },
  {
    id: "demo_h4", name: "Ananya Iyer", age: "22", gender: "female", email: "ananya@hustleos.demo",
    occupation: "UI/UX Designer", field: "UI/UX Design", designation: "Product Designer",
    skills: ["Figma", "Prototyping", "User Research", "Design Systems", "Wireframing", "Accessibility"],
    experience: "experienced", services: "App & web UI, design systems, usability audits",
    bio: "I make complicated products feel obvious. Strong on research, accessibility and handing developers files they love.",
    availability: "part-time", expectedRate: "₹1,000/hr", educationStatus: "postgraduate", cgpa: "8.9/10", resume: "Ananya_Iyer_Resume.pdf",
    projects: [
      { title: "FinTrack Mobile App UI", client: "FinTrack", status: "completed", budget: "₹55,000", progress: 100,
        description: "End-to-end UX and UI for a personal finance app, tested with 12 users.", live: "https://figma.example.com/fintrack",
        milestones: [["Research", true], ["Wireframes", true], ["Hi-fi prototype", true]], hours: { 4: 30, 5: 42, 6: 25 } },
      { title: "Clinic Booking Redesign", client: "CareFirst Clinics", status: "active", budget: "₹35,000", progress: 40, deadlineInDays: 20,
        description: "Simplifying appointment booking for a 5-branch clinic network.",
        milestones: [["Audit", true], ["Flows", false], ["Prototype", false]], hours: { 0: 14, 1: 20 } },
    ],
  },
  {
    id: "demo_h5", name: "Rohan Desai", age: "23", gender: "male", email: "rohan@hustleos.demo",
    occupation: "Data Analyst", field: "Data & Analytics", designation: "Data Analyst",
    skills: ["Python", "SQL", "Power BI", "Excel", "Pandas", "Data Visualization"],
    experience: "intermediate", services: "Sales dashboards, data cleaning, KPI reporting, analysis write-ups",
    bio: "I turn spreadsheets nobody trusts into dashboards everybody uses. Comfortable with messy retail and e-commerce data.",
    availability: "weekends", expectedRate: "₹700/hr", educationStatus: "graduate", cgpa: "8.2/10", resume: "Rohan_Desai_Resume.pdf",
    projects: [
      { title: "Retail Sales Dashboard", client: "MegaMart", status: "completed", budget: "₹28,000", progress: 100,
        description: "Power BI dashboard covering 40 stores with weekly refresh.", live: "https://powerbi.example.com/megamart",
        milestones: [["Data audit", true], ["Model", true], ["Dashboard", true]], hours: { 3: 22, 4: 28 } },
      { title: "Customer Churn Analysis", client: "StreamBox", status: "active", budget: "₹20,000", progress: 55, deadlineInDays: 15,
        description: "Cohort and churn analysis with recommendations.", github: "https://github.com/rohan-desai/churn",
        milestones: [["Cleaning", true], ["Cohorts", true], ["Report", false]], hours: { 0: 12, 1: 18 } },
    ],
  },
  {
    id: "demo_h6", name: "Sneha Kulkarni", age: "21", gender: "female", email: "sneha@hustleos.demo",
    occupation: "Content Writer", field: "Content Writing", designation: "SEO Content Writer",
    skills: ["SEO", "Copywriting", "Blogging", "Email Marketing", "Research", "Editing"],
    experience: "intermediate", services: "Blog posts, website copy, product descriptions, newsletters",
    bio: "I write clear, search-friendly content that sounds like a human wrote it, because one did.",
    availability: "flexible", expectedRate: "₹1.5/word", educationStatus: "student", resume: "Sneha_Kulkarni_Resume.pdf",
    projects: [
      { title: "Organic Food Blog Series", client: "GreenLeaf Organics", status: "completed", budget: "₹15,000", progress: 100,
        description: "24 SEO blog posts that grew organic traffic month over month.",
        milestones: [["Keyword plan", true], ["Drafts", true], ["Published", true]], hours: { 2: 20, 3: 24 } },
    ],
  },
  {
    id: "demo_h7", name: "Vihaan Patil", age: "24", gender: "male", email: "vihaan@hustleos.demo",
    occupation: "Digital Marketer", field: "Digital Marketing", designation: "Performance Marketer",
    skills: ["Google Ads", "Meta Ads", "SEO", "Analytics", "Social Media", "Email Marketing"],
    experience: "experienced", services: "Ad campaigns, social media growth, funnel audits",
    bio: "Data-led marketer who has managed ₹10L+ in ad spend for local brands. I care about cost per customer, not likes.",
    availability: "full-time", expectedRate: "₹25,000/month", educationStatus: "graduate", resume: "Vihaan_Patil_Resume.pdf",
    projects: [
      { title: "Local Cafe Ads Funnel", client: "Brew & Co", status: "completed", budget: "₹24,000", progress: 100,
        description: "Meta ads funnel that doubled weekday footfall in 8 weeks.",
        milestones: [["Audit", true], ["Creatives", true], ["Optimisation", true]], hours: { 2: 28, 3: 30 } },
    ],
  },
  {
    id: "demo_h8", name: "Ishita Reddy", age: "22", gender: "female", email: "ishita@hustleos.demo",
    occupation: "Mobile App Developer", field: "Mobile App Development", designation: "Flutter Developer",
    skills: ["Flutter", "React Native", "Firebase", "Dart", "REST APIs", "Git"],
    experience: "intermediate", services: "Cross-platform apps, MVPs, Firebase back ends",
    bio: "I build MVPs that are ready for real users. Two apps live on the Play Store.",
    availability: "part-time", expectedRate: "₹900/hr", educationStatus: "student", cgpa: "8.4/10", resume: "Ishita_Reddy_Resume.pdf",
    projects: [
      { title: "Study Buddy App", client: "Personal project", status: "completed", progress: 100,
        description: "Flashcard app with spaced repetition. 1.2k downloads.", live: "https://play.google.example.com/studybuddy",
        github: "https://github.com/ishita-reddy/study-buddy",
        milestones: [["MVP", true], ["Play Store launch", true]], hours: { 5: 30, 6: 36 } },
      { title: "Delivery Tracker MVP", client: "QuickDrop", status: "active", budget: "₹45,000", progress: 30, deadlineInDays: 25,
        description: "Driver and customer apps for a hyperlocal delivery startup.",
        milestones: [["Auth", true], ["Maps", false], ["Orders", false]], hours: { 0: 16, 1: 14 } },
    ],
  },
];

interface DemoOwner {
  id: string; name: string; age: string; gender: string; email: string; phone: string;
  companyName: string; industry: string; designation: string; description: string; website: string; needs: string;
}

const owners: DemoOwner[] = [
  { id: "demo_o1", name: "Meera Kapoor", age: "34", gender: "female", email: DEMO_OWNER_EMAIL, phone: "+91 98200 11223",
    companyName: "Northbeam Studio", industry: "Marketing & Advertising Agency", designation: "Founder & Creative Director",
    description: "A boutique creative agency helping D2C and hospitality brands tell better stories.", website: "https://northbeam.example.com",
    needs: "Graphic designers, video editors and copywriters with a strong portfolio." },
  { id: "demo_o2", name: "Arjun Rao", age: "31", gender: "male", email: "arjun@hustleos.demo", phone: "+91 98765 43210",
    companyName: "PixelForge Games", industry: "Gaming", designation: "Co-founder",
    description: "Indie studio building casual mobile games for India and Southeast Asia.", website: "https://pixelforge.example.com",
    needs: "UI/UX designers, frontend developers and 2D artists." },
  { id: "demo_o3", name: "Neha Joshi", age: "29", gender: "female", email: "neha@hustleos.demo", phone: "+91 91234 56780",
    companyName: "GreenLeaf Organics", industry: "E-commerce & Retail", designation: "Operations Head",
    description: "An organic grocery brand selling across India through its own store.", website: "https://greenleaf.example.com",
    needs: "Shopify developers, product photographers, content writers and data analysts." },
];

interface DemoJob {
  id: string; ownerId: string; title: string; field: string; description: string; skills: string[];
  type: Job["type"]; mode: Job["mode"]; location?: string; duration: string; pay: number; payType: Job["payType"];
  vacancies: number; applyInDays: number; postedDaysAgo: number; showContact: boolean;
}

const jobs: DemoJob[] = [
  { id: "demo_job1", ownerId: "demo_o1", title: "Logo & Brand Identity Designer", field: "Graphic Design",
    description: "We need a graphic designer to create a logo, colour palette and mini brand guide for a new café chain. You'll work directly with our creative director and present two concepts.",
    skills: ["Logo Design", "Branding", "Illustrator"], type: "contract", mode: "remote", duration: "1 month", pay: 30000, payType: "project",
    vacancies: 1, applyInDays: 14, postedDaysAgo: 3, showContact: true },
  { id: "demo_job2", ownerId: "demo_o1", title: "Social Media Video Editor", field: "Video Editing & Animation",
    description: "Edit 12–16 short-form videos every month for our hospitality clients. Strong hooks, clean captions and quick turnarounds matter more than fancy effects.",
    skills: ["Premiere Pro", "Reels", "Motion Graphics"], type: "part-time", mode: "remote", duration: "3 months", pay: 18000, payType: "month",
    vacancies: 2, applyInDays: 10, postedDaysAgo: 5, showContact: true },
  { id: "demo_job3", ownerId: "demo_o2", title: "UI/UX Designer — Mobile Game HUD", field: "UI/UX Design",
    description: "Design the in-game HUD, menus and store screens for our upcoming casual puzzle game. Experience with game or gamified UI is a big plus.",
    skills: ["Figma", "Prototyping", "Design Systems"], type: "contract", mode: "hybrid", location: "Pune", duration: "2 months", pay: 60000, payType: "project",
    vacancies: 1, applyInDays: 21, postedDaysAgo: 2, showContact: true },
  { id: "demo_job4", ownerId: "demo_o2", title: "Frontend Developer Intern (React)", field: "Software & Web Development",
    description: "Build our studio website and internal tools in React and Next.js. Great for a student who wants real shipped work for their portfolio.",
    skills: ["React", "Next.js", "TypeScript"], type: "internship", mode: "remote", duration: "3 months", pay: 15000, payType: "month",
    vacancies: 2, applyInDays: 18, postedDaysAgo: 6, showContact: false },
  { id: "demo_job5", ownerId: "demo_o3", title: "Shopify Developer", field: "Software & Web Development",
    description: "Customise our Shopify theme, add subscription boxes and improve checkout speed. You should be comfortable with Liquid and basic performance tuning.",
    skills: ["Shopify", "Liquid", "JavaScript"], type: "freelance", mode: "remote", duration: "6 weeks", pay: 45000, payType: "project",
    vacancies: 1, applyInDays: 12, postedDaysAgo: 4, showContact: true },
  { id: "demo_job6", ownerId: "demo_o3", title: "SEO Content Writer", field: "Content Writing",
    description: "Write 8 SEO-optimised articles a month about organic food, recipes and healthy living. Include keyword research and internal linking.",
    skills: ["SEO", "Copywriting", "Blogging"], type: "part-time", mode: "remote", duration: "6 months", pay: 12000, payType: "month",
    vacancies: 1, applyInDays: 25, postedDaysAgo: 8, showContact: true },
  { id: "demo_job7", ownerId: "demo_o3", title: "Product Photographer", field: "Photography",
    description: "Shoot 60 SKUs for our new catalogue in our Pune warehouse studio. Lighting kit provided.",
    skills: ["Product Photography", "Lightroom", "Photoshop"], type: "contract", mode: "onsite", location: "Pune", duration: "2 weeks", pay: 25000, payType: "project",
    vacancies: 1, applyInDays: 8, postedDaysAgo: 1, showContact: true },
  { id: "demo_job8", ownerId: "demo_o1", title: "Data Analyst — Campaign Dashboard", field: "Data & Analytics",
    description: "Build a dashboard that consolidates ad spend, reach and conversions from five platforms so our team can report to clients weekly.",
    skills: ["Power BI", "SQL", "Excel"], type: "contract", mode: "remote", duration: "1 month", pay: 35000, payType: "project",
    vacancies: 1, applyInDays: 16, postedDaysAgo: 7, showContact: true },
];

const applicationSeeds: { id: string; jobId: string; hustlerId: string; status: Application["status"]; message?: string; daysAgo: number }[] = [
  { id: "demo_app1", jobId: "demo_job4", hustlerId: "demo_h1", status: "shortlisted", daysAgo: 4,
    message: "I've built three client sites in Next.js and would love to help with your studio website." },
  { id: "demo_app2", jobId: "demo_job5", hustlerId: "demo_h1", status: "invited", daysAgo: 1 },
  { id: "demo_app3", jobId: "demo_job1", hustlerId: "demo_h2", status: "applied", daysAgo: 2,
    message: "Brand identity is my favourite kind of work. Happy to share my Chai Tapri process document." },
  { id: "demo_app4", jobId: "demo_job2", hustlerId: "demo_h3", status: "applied", daysAgo: 3,
    message: "I can start immediately and turn around reels within 24 hours." },
  { id: "demo_app5", jobId: "demo_job3", hustlerId: "demo_h4", status: "shortlisted", daysAgo: 1,
    message: "I have shipped a gamified finance app and would love to bring that thinking to your HUD." },
  { id: "demo_app6", jobId: "demo_job8", hustlerId: "demo_h5", status: "applied", daysAgo: 2 },
  { id: "demo_app7", jobId: "demo_job6", hustlerId: "demo_h6", status: "hired", daysAgo: 6 },
  { id: "demo_app8", jobId: "demo_job4", hustlerId: "demo_h8", status: "applied", daysAgo: 3,
    message: "I know React Native well and I'm picking up Next.js quickly." },
];

function addDays(base: Date, n: number): Date {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + n);
}

function isoTimestamp(base: Date, daysAgo: number): string {
  return new Date(base.getTime() - daysAgo * 86400000).toISOString();
}

export interface DemoData {
  users: AppUser[];
  credentials: Record<string, string>;
  hustlerProfiles: Record<string, HustlerProfile>;
  ownerProfiles: Record<string, OwnerProfile>;
  hustlerProjects: Record<string, HustlerProject[]>;
  hustlerIdeas: Record<string, ProjectIdea[]>;
  jobs: Job[];
  applications: Application[];
  incomes: IncomeRecord[];
  workLogs: WorkLog[];
  events: CalendarEvent[];
}

export function buildDemoData(now: Date = new Date()): DemoData {
  const users: AppUser[] = [];
  const credentials: Record<string, string> = {};
  const hustlerProfiles: Record<string, HustlerProfile> = {};
  const ownerProfiles: Record<string, OwnerProfile> = {};
  const hustlerProjects: Record<string, HustlerProject[]> = {};
  const hustlerIdeas: Record<string, ProjectIdea[]> = {};
  const workLogs: WorkLog[] = [];
  const incomes: IncomeRecord[] = [];

  hustlers.forEach((h, hi) => {
    users.push({ id: h.id, role: "hustler", name: h.name, age: h.age, gender: h.gender, email: h.email,
      createdAt: isoTimestamp(now, 200 - hi * 10), isDemo: true });
    credentials[h.email] = hashPassword(DEMO_HUSTLER_PASSWORD);
    hustlerProfiles[h.id] = {
      userId: h.id, occupation: h.occupation, field: h.field, designation: h.designation, skills: h.skills,
      experience: h.experience, services: h.services, bio: h.bio, availability: h.availability,
      expectedRate: h.expectedRate, educationStatus: h.educationStatus, cgpa: h.cgpa, resumeFileName: h.resume,
    };

    const projects: HustlerProject[] = [];
    h.projects.forEach((p, pi) => {
      const pid = `${h.id}_p${pi + 1}`;
      projects.push({
        id: pid, userId: h.id, title: p.title, clientName: p.client, status: p.status, budget: p.budget,
        description: p.description, githubUrl: p.github, liveUrl: p.live, progress: p.progress,
        deadline: p.deadlineInDays !== undefined ? toISODate(addDays(now, p.deadlineInDays)) : undefined,
        milestones: p.milestones.map(([title, completed], mi) => ({ id: `${pid}_m${mi + 1}`, title, completed })),
        inPortfolio: p.status !== "pending", createdAt: isoTimestamp(now, 300 - pi * 20),
      });

      // Spread each month's hours over several days (never in the future).
      const rand = mulberry32(hi * 100 + pi + 7);
      Object.entries(p.hours).forEach(([monthsAgoStr, total]) => {
        const monthsAgo = Number(monthsAgoStr);
        const monthStart = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
        const lastDay = monthsAgo === 0
          ? now.getDate()
          : new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0).getDate();
        const sessions = Math.max(3, Math.min(9, Math.round(total / 4)));
        let remaining = total;
        for (let s = 0; s < sessions; s++) {
          const hours = s === sessions - 1 ? remaining : Math.max(1, Math.round(total / sessions + (rand() - 0.5) * 2));
          const used = Math.min(hours, remaining);
          if (used <= 0) break;
          remaining -= used;
          const day = 1 + Math.floor(rand() * Math.max(1, lastDay - 1));
          workLogs.push({ id: `${pid}_log_${monthsAgo}_${s}`, userId: h.id, projectId: pid,
            date: toISODate(new Date(monthStart.getFullYear(), monthStart.getMonth(), day)), hours: used });
        }
        if (remaining > 0) {
          workLogs.push({ id: `${pid}_log_${monthsAgo}_x`, userId: h.id, projectId: pid,
            date: toISODate(new Date(monthStart.getFullYear(), monthStart.getMonth(), Math.max(1, lastDay - 1))), hours: remaining });
        }
      });

      // Income for completed and part-paid work.
      const amount = Number((p.budget ?? "").replace(/[^0-9]/g, ""));
      if (amount && p.status !== "pending") {
        const activeMonths = Object.keys(p.hours).map(Number);
        const latest = Math.min(...activeMonths);
        const earliest = Math.max(...activeMonths);
        if (p.status === "completed") {
          incomes.push({ id: `${pid}_inc1`, userId: h.id, label: `${p.title} — advance`, amount: Math.round(amount * 0.4),
            date: toISODate(new Date(now.getFullYear(), now.getMonth() - earliest, 5)), projectId: pid });
          incomes.push({ id: `${pid}_inc2`, userId: h.id, label: `${p.title} — final payment`, amount: Math.round(amount * 0.6),
            date: toISODate(new Date(now.getFullYear(), now.getMonth() - latest, 20)), projectId: pid });
        } else {
          incomes.push({ id: `${pid}_inc1`, userId: h.id, label: `${p.title} — advance`, amount: Math.round(amount * 0.3),
            date: toISODate(new Date(now.getFullYear(), now.getMonth() - Math.min(earliest, 2), 8)), projectId: pid });
        }
      }
    });
    hustlerProjects[h.id] = projects;
  });

  // A few extra income lines for the primary demo Hustler so the chart is richer.
  incomes.push(
    { id: "demo_h1_inc_x1", userId: "demo_h1", label: "Logo animation (one-off)", amount: 6500, date: toISODate(addDays(now, -50)) },
    { id: "demo_h1_inc_x2", userId: "demo_h1", label: "Website maintenance retainer", amount: 4000, date: toISODate(addDays(now, -20)) },
    { id: "demo_h1_inc_x3", userId: "demo_h1", label: "Bug-fix sprint — Brew & Co", amount: 5500, date: toISODate(addDays(now, -9)) },
    { id: "demo_h1_inc_x4", userId: "demo_h1", label: "Landing page tweaks — FitNest", amount: 8500, date: toISODate(new Date(now.getFullYear(), now.getMonth(), 1)) },
    { id: "demo_h1_inc_x5", userId: "demo_h1", label: "Maintenance retainer — Studio Nine", amount: 4000, date: toISODate(new Date(now.getFullYear(), now.getMonth() - 3, 12)) },
    { id: "demo_h1_inc_x6", userId: "demo_h1", label: "Freelance bug fixes", amount: 6000, date: toISODate(new Date(now.getFullYear(), now.getMonth() - 7, 18)) },
    { id: "demo_h1_inc_x7", userId: "demo_h1", label: "Logo animation — Spice Route", amount: 3500, date: toISODate(new Date(now.getFullYear(), now.getMonth() - 10, 9)) },
  );

  hustlerIdeas["demo_h1"] = [
    { id: "demo_h1_i1", userId: "demo_h1", title: "Freelancer invoice generator",
      description: "Tiny web app that makes GST-ready invoices in two clicks and tracks who has paid.", source: "manual", createdAt: isoTimestamp(now, 12) },
    { id: "demo_h1_i2", userId: "demo_h1", title: "Local business review widget",
      description: "Embeddable widget showing Google reviews on small-business sites.", source: "manual", createdAt: isoTimestamp(now, 5) },
  ];

  const events: CalendarEvent[] = [
    { id: "demo_h1_e1", userId: "demo_h1", title: "Client call — Kirana Kart", date: toISODate(addDays(now, 3)) },
    { id: "demo_h1_e2", userId: "demo_h1", title: "Portfolio review with mentor", date: toISODate(addDays(now, 8)) },
    { id: "demo_h1_e3", userId: "demo_h1", title: "Hackathon registration closes", date: toISODate(addDays(now, 15)) },
  ];

  owners.forEach((o, oi) => {
    users.push({ id: o.id, role: "owner", name: o.name, age: o.age, gender: o.gender, email: o.email, phone: o.phone,
      createdAt: isoTimestamp(now, 240 - oi * 15), isDemo: true });
    credentials[o.email] = hashPassword(DEMO_OWNER_PASSWORD);
    ownerProfiles[o.id] = {
      userId: o.id, companyName: o.companyName, industry: o.industry, designation: o.designation,
      description: o.description, website: o.website, freelancerRequirements: o.needs,
    };
  });

  const jobList: Job[] = jobs.map((j) => {
    const owner = owners.find((o) => o.id === j.ownerId)!;
    return {
      id: j.id, ownerId: j.ownerId, title: j.title, field: j.field, description: j.description, skills: j.skills,
      type: j.type, mode: j.mode, location: j.location, duration: j.duration, pay: j.pay, payType: j.payType,
      vacancies: j.vacancies, applyBy: toISODate(addDays(now, j.applyInDays)),
      contactName: owner.name, contactEmail: owner.email, contactPhone: owner.phone,
      showContact: j.showContact, status: "open", createdAt: isoTimestamp(now, j.postedDaysAgo),
    };
  });

  const applications: Application[] = applicationSeeds.map((a) => ({
    id: a.id, jobId: a.jobId, hustlerId: a.hustlerId, status: a.status, message: a.message,
    createdAt: isoTimestamp(now, a.daysAgo),
  }));

  return { users, credentials, hustlerProfiles, ownerProfiles, hustlerProjects, hustlerIdeas,
    jobs: jobList, applications, incomes, workLogs, events };
}
