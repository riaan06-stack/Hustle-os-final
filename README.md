# HustleOS

HustleOS connects **Hustlers** (students and freelancers) with **Owners** (founders, businesses, clients).
This build is a complete, demo-ready frontend running on a **mock backend** (browser localStorage), so every
screen works without any server. A real backend (Supabase) can replace the mock layer later without changing the pages.

## Run it

Requires Node.js 20+.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint
```

## Demo accounts (loaded automatically on first open)

| Role    | Email                     | Password     |
|---------|---------------------------|--------------|
| Hustler | `aarav@hustleos.demo`     | `Hustle@123` |
| Owner   | `meera@hustleos.demo`     | `Owner@123`  |

The login page also has **Demo Hustler / Demo Owner** buttons that fill these in.
Other demo Hustlers (same password): `diya@`, `kabir@`, `ananya@`, `rohan@`, `sneha@`, `vihaan@`, `ishita@hustleos.demo`.
Other demo Owners (same password): `arjun@`, `neha@hustleos.demo`.

## What's inside

**Everyone:** cinematic intro, account-type selection, registration, login, onboarding wizards (skippable).

**Hustler**
- Dashboard: stats, deadlines, recommended jobs, profile completion (capped at 95%)
- Discover Work: search jobs, filters, skill-match %, apply, accept/decline invitations, track applications
- My Projects: milestones, progress, GitHub/live links, time logging, portfolio toggle, **Idea engine**
- Portfolio: choose which projects Owners see, auto-generated resume preview
- Calendar: deadlines + your own events
- Income: log payments, 12-month chart, breakdown by project
- Hustle Wrapped: Spotify-style recap (top project, peak month, rhythm, personality)
- Profile: full editable profile with preview

**Owner**
- Dashboard: search bar, stats, recent applications, suggested Hustlers
- Find Hustlers: search by role/skill/project, filters, save, view profile (email/age/gender are never shown), invite to a job
- Post a Project: time period, pay, vacancies, apply-by date, optional contact details
- My Projects: edit / close / delete openings
- Applications: shortlist, hire, reject
- Profile (with optional phone number)

## Architecture

```
src/
  app/            routes (one folder per page, each containing page.tsx)
  components/     ui/ (Button, Card, Modal…), layout/, hustlers/, jobs/, projects/, onboarding/
  hooks/          useRequireAuth (route guard), useHydrated
  lib/
    store/auth.ts mock backend (Zustand + localStorage) — the ONLY file that touches storage
    demoData.ts   demo dataset + demo logins
    search.ts     search/ranking for Hustlers and jobs
    wrapped.ts    Hustle Wrapped statistics
    ideas.ts      idea suggestion engine (rule-based, async so a real model can replace it)
  types/          shared TypeScript types
```

Pages only call the store's exported actions and selector hooks, never `localStorage`.
To move to Supabase, re-implement `src/lib/store/auth.ts` (and `authHash.ts`, which is a **non-secure placeholder**)
against the real API — the pages stay the same.

## Known limits (by design, for now)
- Data lives in each browser's localStorage: not shared across devices or users, lost if site data is cleared.
- Passwords use a placeholder hash. Never use real passwords.
- Resume "upload" stores only a file name; Owners see an auto-generated resume.
- Idea suggestions are rule-based (no external AI yet). Owner **Messages** is not built.
