# CLAUDE.md — ParaTunisie Engineering & Product Constitution

This file is binding. Read it before any development work on this repository. When any other document conflicts with this one, this one wins. When this file conflicts with an explicit, scoped instruction from the user in a given session, the session instruction wins for that session only — record the conflict in `DECISIONS.md` if it reveals a gap here.

Project: ParaTunisie (paratunisie.com) — premium parapharmacy ecommerce for the Tunisian market.
Related reading: `ARCHITECTURE.md`, `DESIGN_SYSTEM.md`, `SEO.md`, `DATA_MODEL.md`, `SECURITY.md`, `PERFORMANCE.md`, `ACCESSIBILITY.md`.

---

## 0. Known repo situation (read first)

The working directory `C:\Users\Ala\Desktop\parapharmacie` is currently **empty** and has **no git repository of its own**. `git` commands run from inside it currently resolve to a repo rooted at the user's home directory (`C:\Users\Ala`), which tracks `node_modules` and points at an unrelated remote (`declared-as-ala/ftf.git`) with commit history belonging to a different project ("stage-pfe"). This is almost certainly accidental.

**Do not run `git init`, `git add`, or `git commit` inside `parapharmacie` until the user has explicitly decided how to handle this.** See `DECISIONS.md` §D-0001. Regular file writes (Write/Edit tools) are unaffected and safe to use in the meantime.

---

## 1. Architecture rules

- Modular monolith first. No microservices until there is a concrete scaling or team-ownership reason — see `ARCHITECTURE.md`.
- Frontend: Next.js (App Router), React, TypeScript. Backend: NestJS, TypeScript, PostgreSQL via Prisma.
- Prefer PostgreSQL over document stores for this domain: orders, inventory, batches, payments and suppliers need relational integrity and transactions.
- Monorepo layout (`apps/web`, `apps/admin`, `apps/api`, `packages/*`) is adopted once the backend sprint starts (Sprint 9). Until then, the frontend prototype can live at the repo root or in `apps/web` — decide in `DECISIONS.md` before Sprint 1 and stay consistent afterward.
- Server Components are the default. A component becomes a Client Component only when it needs interactivity, browser APIs, or local state — not by default, not "to be safe."
- No premature abstraction. Three similar call sites are fine without a shared helper; extract only when a fourth appears or the duplication is a proven maintenance risk.

## 2. Frontend standards

- TypeScript strict mode, no `any` without a comment explaining why it's unavoidable.
- Co-locate a component's styles/logic/tests; do not scatter one feature across unrelated folders.
- Component size: if a single component file exceeds ~250 lines or mixes more than one clear responsibility (e.g. data fetching + complex layout + business logic), split it.
- shadcn/ui is a foundation, not the visual identity — every shadcn component used in production must be restyled per `DESIGN_SYSTEM.md` before shipping. Default shadcn styling is not acceptable in a merged PR.
- No inline magic numbers for spacing/color/radius/duration — use design tokens (Tailwind theme extension) defined in `DESIGN_SYSTEM.md`.
- Client-side data fetching only where Server Components genuinely cannot do the job (e.g. live search-as-you-type).

## 3. Backend standards

- NestJS module boundaries follow `API.md`. A module owns its own DTOs, services, and Prisma access; cross-module calls go through the other module's public service, never through raw Prisma from outside the owning module.
- All input validated at the API boundary (`class-validator`/DTOs). Trust internal calls; validate what comes from the client or a third party (webhooks, payment callbacks).
- All mutating endpoints require an explicit auth/role check, even "obviously internal" ones.

## 4. Design standards

- Follow `DESIGN_SYSTEM.md` exactly for color, type, spacing and motion tokens. Do not invent new tokens ad hoc inside a component.
- Luxury comes from typography, composition, whitespace, photography, hierarchy and restrained motion — not from heavy shadows, gradients, glassmorphism, or excessive rounding. See `DESIGN_SYSTEM.md` §"Avoid".
- No section may be reduced to "heading + paragraph + 4 identical cards" without an explicit visual-rhythm reason (see `DESIGN_SYSTEM.md` §Composition).

## 5. Mobile-first requirement

- Every page/component is designed and implemented mobile-first, then enhanced for larger viewports — never the reverse.
- Minimum touch target 44×44px for any interactive element on mobile viewports.
- No feature may depend on `:hover` alone; always provide a tap/focus equivalent.
- No horizontal overflow at any supported viewport width.

## 6. SEO rules

- SEO is implemented as part of the feature, not retrofitted. A new page type ships with metadata, canonical, and structured data in the same PR that ships the page.
- Follow the URL, hreflang, canonical, and indexation rules in `SEO.md` exactly — especially the faceted-navigation controls. Do not let filter/sort combinations become indexable without an explicit rule allowing it.
- JSON-LD (Product, Offer, AggregateRating, Review, BreadcrumbList, Organization) is generated from the same data source that renders the visible page — never hand-duplicated content that can drift out of sync.

## 7. Performance rules

- Respect the budgets in `PERFORMANCE.md` (LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1) on mid-range mobile hardware/network, not just desktop broadband.
- Animations must never block interaction or increase LCP/INP. Prefer `transform`/`opacity`-driven animation; avoid animating layout-triggering properties.
- No third-party script is added without checking its bundle/runtime cost and documenting the tradeoff.

## 8. Accessibility

- Follow `ACCESSIBILITY.md`. Non-negotiables: visible focus states, keyboard operability, semantic HTML before ARIA, labeled form fields with accessible error messages, `prefers-reduced-motion` respected everywhere motion is used, color never the sole signal of state.

## 9. Animation standards

- Every animation must answer: what is it communicating (hierarchy, continuity, feedback)? "It looks cool" is not sufficient justification.
- Use the installed Emil Kowalski skills actively during implementation and review: `animate` when building motion, `review-animations` / `improve-animations` / `find-animation-opportunities` when auditing, `animation-vocabulary` when specifying intent precisely, `apple-design` for gesture/spring-driven interactions.
- No scroll-hijacking, no infinite/meaningless looping motion, no animation that delays a purchase-path action.

## 10. Security

- Follow `SECURITY.md`. No secrets in source control. All payment and webhook handling verifies signatures. Sessions, CSRF and CORS follow the documented policy — no ad hoc exceptions per route.

## 11. TypeScript rules

- `strict: true` repo-wide. Shared types live in `packages/types` once the monorepo exists; until then, colocate and avoid duplicating the same shape across files.
- Prefer discriminated unions over boolean flags for multi-state UI (e.g. loading/error/empty/success), since that is exactly where the app will need this pattern repeatedly (search, cart, checkout, diagnostic flow).

## 12. API standards

- REST, documented with OpenAPI (see `API.md`). Consistent envelope for errors. Versioned only when a breaking change is unavoidable — don't pre-version speculatively.

## 13. Database rules

- Prisma is the single source of schema truth. No manual out-of-band schema edits. Migrations are committed, not generated ad hoc in production.
- Money stored as integer minor units (millimes) or `Decimal`, never floating point.

## 14. Testing

- Follow `TESTING.md`. Critical ecommerce paths (search → PLP → PDP → cart → checkout) get E2E coverage before they're considered done, not "later."

## 15. Documentation & dependency policy

- `PROGRESS.md`, `TODO.md`, and `SPRINTS.md` are updated after every meaningful unit of work — this is mandatory, not optional housekeeping.
- Significant architectural/product/design decisions go into `DECISIONS.md` at the time they're made, not reconstructed later.
- New dependency = justified. Prefer the standard library, an existing dependency, or a small amount of owned code over adding a package for a trivial need. Record notable additions in `DECISIONS.md`.

## 16. State management

- Server state (data from the API) and client UI state (open/closed, selected tab, form draft) are conceptually separate. Don't put server data into a global client store "just in case" — fetch it where it's used (Server Components / route handlers) and cache at the framework level.
- No global state library is introduced until a concrete cross-cutting need appears (e.g. cart across the whole shell). When it does, document the choice in `DECISIONS.md`.

## 17. Error handling

- Handle errors at boundaries that can actually occur (network failure, invalid user input, third-party API failure). Do not add defensive handling for states that cannot occur given the code's own guarantees.
- User-facing errors are actionable and in French (or Arabic once localized) — never a raw stack trace or English default library message shown to a shopper.

## 18. Image handling

- `next/image` everywhere, explicit width/height or `fill` with a sized container to prevent CLS. AVIF/WebP preferred formats. No unoptimized `<img>` in production pages.
- No hotlinked third-party image URLs in production content without verifying they resolve and are licensed for use.

## 19. Internationalization

- French is the default and only shipped locale at launch. The route structure (`/fr/...`, future `/ar/...`) and any layout/direction-dependent CSS must be written so Arabic RTL can be added without a rewrite — no hardcoded `left`/`right`, prefer logical properties (`ms-`, `me-`, `ps-`, `pe-`) in Tailwind.

## 20. No fake data in production

- No fake countdowns, fake stock scarcity, fake review counts, or fabricated urgency. Reviews, ratings and stock levels shown to a real customer must reflect real data. Mock data is clearly scoped to development/staging and never reaches a production build path silently.

## 21. Medical/claims honesty

- Cosmetic/skincare guidance (routine diagnostic, product descriptions) must not present itself as medical diagnosis or treatment. Any diagnostic flow carries an explicit non-medical disclaimer.

## 22. Code review expectations

- Before calling any major UI implementation done, run the self-review checklist in `DESIGN_SYSTEM.md` §"Quality bar" (generic-looking? obvious hierarchy? mobile excellent? animations meaningful? fast? premium feel?). Iterate before presenting as finished.
- Don't mark a TODO complete without having verified it (build passes, page renders, interaction works) — not just "the code looks right."

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
