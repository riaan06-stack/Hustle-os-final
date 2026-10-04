export const projectQuotes = [
  "Progress, not perfection — ship it and keep going.",
  "Every deployed project is proof you can finish what you start.",
  "Small steps daily beat big leaps rarely.",
  "Done is better than perfect.",
  "Your next client judges what's live, not what's planned.",
];

export const ideaQuotes = [
  "Ideas are cheap. Execution is everything — write it down before you forget.",
  "The best idea is the one you actually start.",
  "Collect ideas like a magpie, ship them like a machine.",
  "An idea unwritten is an idea forgotten by tomorrow.",
];

export function pickQuote(list: string[]): string {
  return list[Math.floor(Math.random() * list.length)];
}

export interface DeployStep {
  title: string;
  description: string;
}

/** Minimal steps to deploy a project for free on Vercel. */
export const vercelDeploySteps: DeployStep[] = [
  {
    title: "Push your code to GitHub",
    description: "Create a repo (if you haven't already) and push your project to it. Vercel deploys straight from GitHub.",
  },
  {
    title: "Sign up at vercel.com",
    description: "Choose \"Continue with GitHub\" — it's free and takes seconds, no card required for personal projects.",
  },
  {
    title: "Click \"Add New Project\"",
    description: "Vercel will list your GitHub repos. Pick the one you want to deploy.",
  },
  {
    title: "Leave the defaults",
    description: "Vercel auto-detects most frameworks (Next.js, React, Vite, etc.) and sets the build command for you.",
  },
  {
    title: "Click Deploy",
    description: "Wait about a minute. You'll get a live URL like yourproject.vercel.app — free, with HTTPS included.",
  },
  {
    title: "Share the link",
    description: "Paste that URL into your project's \"Live URL\" field here so Owners can see it working.",
  },
];