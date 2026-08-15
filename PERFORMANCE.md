# PERFORMANCE.md — ParaTunisie Performance Budgets

## Core Web Vitals targets (engineering targets, not aspirations)

- LCP ≤ 2.5s
- INP ≤ 200ms
- CLS ≤ 0.1

Measured on mid-range mobile hardware over a throttled/representative mobile network — Tunisian mobile connectivity is not equivalent to desktop broadband, and design/testing must account for that (`CLAUDE.md` §7).

## Images

- `next/image` everywhere; explicit dimensions or a sized `fill` container to prevent CLS.
- AVIF/WebP preferred; responsive `sizes` set per breakpoint, not one oversized asset served everywhere.
- Hero/LCP images preloaded/prioritized (`priority` prop) on the page where they are the LCP element; everything below the fold lazy-loaded.

## Fonts

- Self-hosted or `next/font` with subsetting; `font-display: swap` (or equivalent) to avoid invisible-text flashes; no more than two font families loaded (serif for editorial, sans for UI).

## Scripts

- No third-party script added without checking bundle/runtime cost (`CLAUDE.md` §7); analytics/marketing scripts loaded non-blocking (`next/script` with an appropriate strategy) and deferred off the critical path.

## Animation cost

- Animate `transform`/`opacity` only wherever possible; avoid animating properties that trigger layout (width/height/top/left) — use `transform: translate/scale` instead.
- No animation may delay a purchase-path action (`CLAUDE.md` §7, `DESIGN_SYSTEM.md` §Motion timing scale).
- Large animation libraries are not pulled in for small effects — prefer CSS transitions/Tailwind utilities first, Motion/Framer only where genuinely needed (spring/gesture-driven interactions).

## Hydration

- Server Components by default; Client Components scoped as narrowly as possible (leaf interactive elements, not whole page trees) to minimize hydration cost (`CLAUDE.md` §2).

## Bundle size

- Route-level code splitting via the App Router by default; heavy, rarely-used UI (e.g. a complex diagnostic-flow step, a rich editor in admin) dynamically imported.
- Periodic bundle-size check before major releases; no dependency added without weighing its cost (`CLAUDE.md` §15).

## Lazy loading

- Below-the-fold imagery and non-critical sections (editorial rails, brand marquee) lazy-loaded/deferred; above-the-fold content never lazy-loaded (would hurt LCP).

## Server Components / caching

- Catalogue and content pages use ISR/route caching, revalidated on publish rather than pure time-based staleness once real data exists (`ARCHITECTURE.md` §Caching).

## API calls

- No client-side waterfall of sequential API calls for a single page — data fetched in Server Components/parallel where possible; client-side fetching reserved for genuinely dynamic, post-load interactions (live search, cart updates).

## Verification workflow

- Use `tsc`/build checks for correctness rather than repeated full `next build` cycles during iteration (per user's established preference); reserve full production builds + Lighthouse/CWV checks for pre-merge verification of significant pages.
