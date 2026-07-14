# MarketFlip AI

An AI-powered tool for discovering undervalued marketplace listings and estimating resale potential. Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, and a source-agnostic data layer designed for Supabase + a real LLM.

## Current scope (MVP)

This build is fully functional end-to-end, with three deliberate scoping decisions made for speed:

| Area | Current state | Upgrade path |
|---|---|---|
| **Listing data** | Realistic seed data in `src/lib/data/mock-listings.ts`, shaped exactly like the Supabase `listings` table | Point ingestion (scraper, API, manual entry) at `supabase/schema.sql`'s `listings` table; source-agnostic (`facebook_marketplace`, `craigslist`, `ebay`, `offerup`) |
| **AI scoring** | Deterministic scoring engine in `src/lib/ai/scoring-engine.ts` — same output shape a real LLM call would return | Swap the body of `analyzeListing()` / `generateAIReport()` for an OpenAI call; every caller already expects the final `DealAnalysis` / `AIReport` shape |
| **Auth & persistence** | Client-side Zustand store (`src/store/dashboard-store.ts`), persisted to localStorage, standing in for a logged-in user | Schema in `supabase/schema.sql` already has RLS-protected `user_listing_records`; swap the store's actions for Supabase queries once Supabase Auth is wired up |

Nothing in the UI, routing, or component layer needs to change when you flip these — the contracts were designed for it up front.

## Tech stack

- **Next.js 16** (App Router, Turbopack, Server + Client Components)
- **TypeScript** (strict, fully typed domain model in `src/types`)
- **Tailwind CSS v4** (CSS-variable-based design tokens, dark mode by default)
- **Supabase** (`@supabase/supabase-js`, `@supabase/ssr` — client ready, schema included, not required to run)
- **Zustand** (client-side dashboard/watchlist state)
- **Recharts** (profile category breakdown chart)
- **Framer Motion**, **Lucide icons**

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. The app runs entirely on mock data out of the box — no environment variables required.

### Enabling Supabase (optional)

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Copy `.env.example` to `.env.local` and fill in your project URL + anon key.
4. Replace the mock-data calls in the API routes (`src/app/api/**/route.ts`) with Supabase queries.

### Enabling real AI scoring (optional)

1. Add `OPENAI_API_KEY` to `.env.local`.
2. Implement a real call inside `analyzeListing()` in `src/lib/ai/scoring-engine.ts`, keeping the same return type (`DealAnalysis`). Keep the deterministic version as a fallback if the API call fails.

> **Note on fonts:** the build environment used to generate this project had no network access, so `layout.tsx` and `globals.css` use system font stacks (`-apple-system`, `Segoe UI`, etc.) instead of `next/font/google`. Once deployed somewhere with network access, you can swap in Geist + Inter via `next/font/google` for pixel-exact match to the original design intent — the CSS variables (`--font-sans`, `--font-display`) are already wired up to accept them.

## Folder structure

```
src/
  app/                    # Routes (App Router)
    api/                  # API routes: search, listings, analyze/[id]
    search/               # Search page
    reseller/             # Reseller tools page
    listing/[id]/         # Listing detail + AI report
    dashboard/            # Saved / favorited / watchlist / viewed
    profile/              # Stats + category breakdown chart
  components/
    ui/                   # Button, Badge, Card primitives
    layout/                # Navbar, Footer
    home/                  # Hero, TrendingDeals, Categories, HowItWorks
    listings/              # ListingCard, ResellerCard, ListingDetailClient, skeletons
    search/                # Search + Reseller page clients, filter bars
    dashboard/             # Dashboard + Profile clients
    charts/                # DealScoreGauge (signature visual element)
  lib/
    ai/scoring-engine.ts   # Deal scoring + AI report generation (swap point for real LLM)
    data/mock-listings.ts  # Seed listing data
    supabase/client.ts     # Supabase client factory + config check
    utils/format.ts        # cn(), currency/date formatting
  store/dashboard-store.ts # Zustand store for saved/favorited/viewed/watchlist
  types/index.ts           # Full domain model (Listing, DealAnalysis, AIReport, etc.)
supabase/schema.sql        # Full Postgres schema with RLS, ready for real auth
```

## Design system

Dark-mode-first, inspired by Linear and Apple's product marketing pages:

- **Signature element:** the Deal Score gauge (`src/components/charts/deal-score-gauge.tsx`) — a radial arc that appears on every card, the hero, and the analysis page, so a score always reads the same way at a glance.
- **Palette:** near-black background, mint/teal accent (`#5eead4`) for the AI/deal-score identity, violet (`#a78bfa`) for secondary AI moments, semantic green/amber/red for profit/risk/danger.
- **Type:** a display face for headlines with tight tracking, a body face for everything else, tabular numerals throughout so prices and percentages don't jitter.
- All interactive states respect `prefers-reduced-motion`, and focus rings are visible for keyboard navigation.

## Pages
 
- **Home** — hero with live search, an example "deal reveal" card, trending deals, category grid, how-it-works.
- **Search** — query + category filtering, AI-scored results sorted by Deal Score.
- **Reseller** — sort by profit/ROI/newest/easiest resale, min profit + max buy price filters, demand/risk badges.
- **Listing detail** — full AI report: worth-buying verdict, resale price range, best platforms, risks, negotiation suggestions, suggested max offer, similar sold items.
- **Dashboard** — tabs for saved, favorited, watchlist, and recently viewed.
- **Profile** — money saved, profit found, deals viewed, favorite category breakdown (pie chart).
