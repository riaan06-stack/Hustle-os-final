/**
 * Manually curated lists (not user-generated), so Occupation and Field
 * stay consistent and filterable once the real marketplace ships.
 * Each list intentionally spans multiple broad categories — creative,
 * technical, analytical, written, and support work — per the brief.
 */

export const occupationOptions = [
  { value: "video-editor", label: "Video Editor" },
  { value: "graphic-designer", label: "Graphic Designer" },
  { value: "ui-ux-designer", label: "UI/UX Designer" },
  { value: "web-developer", label: "Web Developer" },
  { value: "software-developer", label: "Software Developer" },
  { value: "mobile-app-developer", label: "Mobile App Developer" },
  { value: "data-analyst", label: "Data Analyst" },
  { value: "data-scientist", label: "Data Scientist" },
  { value: "content-writer", label: "Content Writer" },
  { value: "copywriter", label: "Copywriter" },
  { value: "digital-marketer", label: "Digital Marketer" },
  { value: "social-media-manager", label: "Social Media Manager" },
  { value: "seo-specialist", label: "SEO Specialist" },
  { value: "virtual-assistant", label: "Virtual Assistant" },
  { value: "photographer", label: "Photographer" },
];

export const fieldOptions = [
  { value: "software-web-development", label: "Software & Web Development" },
  { value: "mobile-app-development", label: "Mobile App Development" },
  { value: "data-analytics", label: "Data & Analytics" },
  { value: "graphic-design", label: "Graphic Design" },
  { value: "ui-ux-design", label: "UI/UX Design" },
  { value: "video-animation", label: "Video Editing & Animation" },
  { value: "content-writing", label: "Content Writing" },
  { value: "copywriting-marketing", label: "Copywriting & Marketing Content" },
  { value: "digital-marketing", label: "Digital Marketing" },
  { value: "social-media", label: "Social Media Management" },
  { value: "seo-sem", label: "SEO & SEM" },
  { value: "photography", label: "Photography" },
  { value: "virtual-assistance", label: "Virtual Assistance & Admin Support" },
  { value: "business-finance", label: "Business & Finance Consulting" },
  { value: "teaching-tutoring", label: "Teaching & Tutoring" },
];

export const industryOptions = [
  { value: "ecommerce", label: "E-commerce & Retail" },
  { value: "saas", label: "SaaS & Software" },
  { value: "fintech", label: "Fintech & Finance" },
  { value: "healthcare", label: "Healthcare & Wellness" },
  { value: "education", label: "Education & EdTech" },
  { value: "media", label: "Media & Entertainment" },
  { value: "marketing-agency", label: "Marketing & Advertising Agency" },
  { value: "real-estate", label: "Real Estate" },
  { value: "hospitality", label: "Hospitality & Travel" },
  { value: "logistics", label: "Logistics & Supply Chain" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "nonprofit", label: "Nonprofit & NGO" },
  { value: "gaming", label: "Gaming" },
  { value: "consulting", label: "Consulting & Professional Services" },
  { value: "food-beverage", label: "Food & Beverage" },
];

export const educationStatusOptions = [
  { value: "student", label: "Currently a student" },
  { value: "graduate", label: "Completed graduation" },
  { value: "postgraduate", label: "Pursuing / completed postgraduate studies" },
  { value: "self-taught", label: "Self-taught, no formal degree" },
];

/**
 * A manually curated "what's trending" list — shown as quick-add chips on
 * top of the free-text skill tagger so people can build a profile fast.
 * Swap this for a real trending-skills feed once the backend exists.
 */
export const trendingSkills = [
  "ChatGPT / AI Prompting",
  "React",
  "Next.js",
  "Python",
  "TypeScript",
  "Figma",
  "Generative AI Tools",
  "Video Editing (Premiere Pro)",
  "Canva",
  "SEO",
  "Excel / Data Analysis",
  "Notion",
  "Copywriting",
  "Shopify",
  "Public Speaking",
];