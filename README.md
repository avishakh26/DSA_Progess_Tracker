# DSA Journey

A premium tracker for Data Structures, Algorithms and Competitive Programming
progress — 14 phases, unlimited problem tracking, markdown notes, streaks and
statistics.

Dark, glassmorphic UI in the spirit of Linear; GitHub-style contribution
heatmap; LeetCode-style progress tracking; Notion-style notes.

---

## Quick start

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Then open <http://localhost:3000> and sign in with the seeded demo account:

```
demo@dsajourney.dev / demo1234
```

The demo account ships with ~280 problems across five months of history so the
dashboard, heatmap and statistics pages have something real to render. Signing
up creates an empty account with the full curriculum provisioned.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| Styling | Tailwind CSS v4, hand-rolled shadcn/ui-style primitives on Radix |
| Motion | Motion (Framer Motion) — page transitions, expandable cards |
| Icons | Lucide |
| Charts | Recharts |
| Data | Prisma 7 + SQLite via the `better-sqlite3` driver adapter |
| Auth | Auth.js v5 (credentials provider, JWT sessions, bcrypt hashes) |

### Why SQLite

Zero setup — no Docker, no hosted instance. The schema deliberately avoids
Postgres-only features (native arrays, `@db.Text`), so switching is two edits:

1. `prisma/schema.prisma` → `provider = "postgresql"`
2. `src/lib/prisma.ts` → swap `PrismaBetterSqlite3` for
   `new PrismaPg({ connectionString: process.env.DATABASE_URL })`

Point `DATABASE_URL` at the new database and run `npm run db:push`.

---

## Features

**Dashboard** — KPI cards (topics, completion %, problems, current/longest
streak), a full-year contribution heatmap, 14-day and 6-month activity charts,
today's goal, difficulty split, phase progress rail and recently solved.

**DSA Roadmap** — 14 expandable phase cards covering C++/STL through network
flow and FFT (96 sub-topics). Each topic has a Done/Pending/Skip selector, a
progress bar, a favourite toggle and a link into its detail view.

**Topic detail** — description, curated learning resources, a draggable
progress slider, an unlimited problem tracker (name, platform, problem link,
solution link, difficulty, date solved, tags, status, notes) and an autosaving
markdown notes editor with live preview.

**Monthly Goals** — a six-month vertical timeline from STL/Math to DP/Advanced,
with per-month progress and a live count of problems actually logged that month.

**Codeforces Rating Roadmap** — an alternating node graph from 800 to 1800+,
each band listing the skills to master, with per-band notes.

**Statistics** — problems per month by difficulty, cumulative total, last 30
days, platform distribution, difficulty/status breakdown and problems per phase.

**Revision Needed** — every problem flagged for revision, grouped by phase,
with a one-click "Revised" action.

**Favorites** — starred topics and problems in one place.

**Notes** — free-standing markdown notes plus every note attached to a topic.

**Global search (⌘K / Ctrl+K)** — searches topics and problems by title, tag,
platform and note body, with platform / difficulty / status filters.

**Settings** — display name, daily problem goal, CF and LeetCode handles, and a
confirm-guarded progress reset.

---

## Project layout

```
prisma/
  schema.prisma      Data model (User, Topic, Problem, MonthlyGoal,
                     RatingNode, Note, Activity)
  seed.ts            Demo account with five months of generated history
prisma.config.ts     Prisma 7 config — datasource URL lives here, not in the schema
src/
  actions/           Server actions (all mutations; every one re-checks ownership)
  app/
    (auth)/          Login and signup
    (app)/           Authenticated shell and all nine pages
  components/
    ui/              Button, Card, Badge, Dialog, Tabs, … (shadcn-style, Radix)
    layout/          Collapsible sidebar shell, page header
    charts/          Recharts wrappers
    dashboard/ roadmap/ problems/ goals/ rating/ notes/ search/ settings/
  lib/
    roadmap-data.ts  The 14 phases, 96 topics, 6 goals and 10 rating bands
    queries.ts       Server-side aggregations (streaks, KPIs, time series)
    viz.ts           Chart palette — validated, see below
    constants.ts     Status/difficulty/platform metadata
  auth.ts            Auth.js (Node half — Prisma + bcrypt)
  auth.config.ts     Auth.js (edge-safe half — imported by the proxy)
  proxy.ts           Route protection (Next 16's renamed middleware)
```

### A few decisions worth knowing

- **Curriculum is copied, not shared.** `provisionUser()` clones the 96 topics,
  6 goals and 10 rating bands into each new account, so every row is
  independently editable.
- **Ownership is in the where-clause.** Mutations filter on
  `{ id, userId }` rather than fetching then checking — a wrong user matches
  zero rows instead of leaking one.
- **The heatmap is maintained, not derived.** `Activity` rows are bumped ±1 as
  problems are added, edited (date changes move the contribution) and deleted,
  so streaks stay O(1) to read.
- **Chart colours were validated, not chosen by eye.** Difficulty uses a
  single-hue ordinal blue ramp rather than green/amber/red — that trio fails
  colour-blind separation (red↔green ΔE 5.6) once the marks sit adjacent in a
  stacked bar. The badge colours elsewhere keep green/amber/rose because they
  always carry a text label. See the note at the top of `src/lib/viz.ts`.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Generate Prisma client + production build |
| `npm run db:push` | Sync the schema to the database |
| `npm run db:seed` | (Re)create the demo account |
| `npm run db:reset` | Wipe the database and re-seed |
| `npm run db:studio` | Prisma Studio |
| `npm run lint` | ESLint |

---

## Deploying

The app builds cleanly for Vercel, but **SQLite won't work on serverless** —
the filesystem is ephemeral. Before deploying, switch to Postgres (Neon,
Supabase, Vercel Postgres) using the two edits under *Why SQLite* above, and
set `DATABASE_URL` and `AUTH_SECRET` as environment variables.

Generate a real secret with:

```bash
npx auth secret
```

## Known notes

- `npm audit` reports three high-severity advisories in `postcss` and `sharp`.
  Both are transitive dependencies of Next.js itself; the only "fix" npm offers
  is downgrading Next to 9.3.3. Wait for an upstream Next release instead.
