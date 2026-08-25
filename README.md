# PokéStats

Live statistics for [Pokémon Auto Chess](https://pokemon-auto-chess.com) — an auto-battler game. PokéStats surfaces per-Pokémon performance: stats by rank tier and best items.

**Production:** https://pokestats.gg

## Tech Stack

| Tool | Purpose |
| --- | --- |
| [Next.js](https://nextjs.org) 16 (App Router) | Framework, routing, API routes |
| React 19 | UI |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| Vercel Analytics | Usage tracking |
| pnpm | Package manager |

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
pnpm build        # production build
pnpm start        # serve production build
pnpm lint         # eslint
pnpm test         # vitest (unit tests)
pnpm sync:assets  # re-sync sprites + pkm-index.json from the game source
```

## Architecture

### Data flow

```
pokemon-auto-chess.com (upstream API)
        │  fetched at build/ISR time via src/lib/api.ts
        │  two cache layers: in-memory Map (1h TTL, per instance)
        │  + disk cache in node_modules/.cache (shared across build workers;
        │     upstream payloads exceed Next.js's 2MB Data Cache limit)
        ▼
src/lib/api.ts ── reshapes raw payloads into typed models
        │
        ▼
Server Components (async pages) ── statically prerendered, ISR revalidate 3600
        │  props
        ▼
Small client components ── filters, sorting, search (interactivity only)
```

- **Upstream client** (`src/lib/api.ts`): single entry point for upstream calls (`/meta/pokemons`, `/meta/items`). Caches responses in memory for one hour per server instance, plus a disk cache under `node_modules/.cache` so parallel build workers don't each re-download the large payloads. Maps raw JSON into typed interfaces (`PokemonStat`, `ItemEntry`).
- **Pages** are async Server Components that call `api.ts` directly and export `revalidate = 3600` (ISR). They render full HTML with data baked in — no client-side fetch waterfall.
- **Error handling**: root `error.tsx` boundary with retry and `not-found.tsx`.

### Assets

Pokémon portraits and item sprites are **self-hosted** under `public/assets/` instead of proxied from the game's website:

```bash
pnpm sync:assets            # incremental; add --force to re-download everything
```

The script:
1. Regenerates `public/assets/pkm-index.json` (name → sprite ID) from [`pokemons-data.csv`](https://github.com/keldaanCommunity/pokemonAutoChess/blob/master/app/models/precomputed/pokemons-data.csv) in the game repo — run it when new Pokémon are released.
2. Downloads every portrait (`Normal` emotion) and item sprite used by the site into `public/assets/portraits|item/`.

A handful of sprites legitimately 404 upstream (some regional variants, HM items); `PkmImg`'s `onError` falls back to the MissingNo placeholder, and Pokémon missing from a not-yet-synced index render the same placeholder instead of disappearing.

**Automation:** game stats are always live (fetched from the upstream API on each hourly revalidation), so they never go stale. Sprites only change when the game ships new content — a scheduled GitHub Action (`.github/workflows/sync-assets.yml`) runs `sync:assets` daily and auto-commits when there are changes, which also triggers a fresh Vercel deployment. You can also run it manually anytime:

```bash
pnpm sync:assets            # incremental; add --force to re-download everything
```

### Pages

| Route | Description |
| --- | --- |
| `/` | Redirects to `/pokemon` |
| `/pokemon` | Searchable per-Pokémon stats grouped by tier |
| `/pokemon/[name]` | Detail page per Pokémon: tier stats + best items (on-demand rendering, listed in sitemap) |
| `/contact` | Contact form (Formspree) |

### Shared components & utilities

- `src/components/pkm-img.tsx` — Pokémon/item portraits resolved via `public/assets/pkm-index.json` (name → sprite ID), with `onError` fallbacks.
- `src/components/sort.tsx` — `useSort` hook plus a `<SortTh>` sortable table header.
- `src/app/nav-client.tsx` — sticky nav shell with mobile menu and trilingual (EN/ES/PT) help modal.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # root layout + global SEO metadata
│   ├── page.tsx                # redirects to /pokemon
│   ├── error.tsx               # global error boundary (retry)
│   ├── not-found.tsx           # 404 UI
│   ├── nav-client.tsx          # nav / mobile menu / help modal
│   ├── sitemap.ts              # sitemap incl. per-Pokémon URLs
│   ├── robots.ts               # robots.txt
│   ├── pokemon/                # search + [name] detail pages
│   └── contact/                # contact form
├── components/                 # shared UI components
└── lib/                        # api.ts (upstream client), pkm-index.ts
scripts/
└── sync-assets.mjs             # sprite + index sync from the game repo
```

## Testing & CI

Unit tests (Vitest) cover the upstream response shaping in `src/lib/api.test.ts`. GitHub Actions runs lint + tests + build on every push/PR (`.github/workflows/ci.yml`).

## Deployment

Deployed on Vercel. Pushing to the main branch triggers a deployment; pages are prerendered and revalidated hourly (ISR).

## Notes for Contributors

> ⚠️ This project uses a recent Next.js release with breaking changes relative to older versions. Consult the bundled docs in `node_modules/next/dist/docs/` before writing code against Next.js APIs.
