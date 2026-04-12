
# The Page Gallery

A living digital garden for literary editions, submissions, and collector communities.  
Built as React + Vite + Supabase. The Garden is the money maker — editorial workflow SaaS for journals + membership + scarcity editions.

## Core Philosophy
Everything orbits **The Garden**: submissions → editorial → rights tracking → licensed journals (£2k/yr) → collector circle → pre-order editions (zero print risk until funded).

## Tech
- React 18 + TypeScript + Vite
- Tailwind + custom warm-beige/burgundy palette
- Supabase (auth, postgres, storage, edge functions)
- Framer Motion for that silky cool-girl micro-interactions
- Zustand for light state (Garden dashboard)

## Quick Start
```bash
npm install
cp .env.example .env.local   # add your Supabase keys
npm run dev
```

## What we're building next (prioritised)
1. **/garden** — The dashboard (submissions Kanban + rights)
2. **Collector Circle** membership flow
3. Refined hero with the new abstract illustration (particles + dissolve)
4. Editions shop with dynamic pricing + stock counters
5. B2B journal licensing onboarding

Pull requests welcome. Let's make something dangerous.
A cultural company. A publishing house. A platform owner.

We publish. We build infrastructure. We create opportunity.
We connect writers, artists, journals, and production.

---

## What's here

- **The Garden** — the writer/artist platform. Create, publish, collaborate, earn.
- **Editions** — the publishing imprint. Chapbooks, poetry, printed works.
- **Collector Circle** — membership tiers supporting independent literary publishing.
- **Programs** — residencies, workshops, labs, prizes.

---

## Running locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## GitHub Pages deployment

- This repository is deployed as a **project site** at `/Fontofintentcommunity/`.
- The build base path is set automatically in CI from the repository name.
- SPA deep-link fallback uses `public/404.html` and redirects back through `/Fontofintentcommunity/`.

### Required repository settings

Set these before deploying:

- Repository variable: `VITE_SUPABASE_URL`
- Repository secret: `VITE_SUPABASE_ANON_KEY`
- Repository variable (optional if payments disabled): `VITE_PAYPAL_CLIENT_ID`

### Pre-deploy checklist

- Confirm GitHub Pages source is configured for Actions.
- Confirm the required `VITE_*` repository variables/secrets are set.
- Run `npm run build` locally and verify there are no new errors.

## Stack

React 18 · TypeScript · Vite · Tailwind · Supabase · Radix UI · framer-motion (motion) · zustand

---

*Published when the work demands it. Not before.*
  
