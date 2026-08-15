# TESTING.md — ParaTunisie Test Strategy

## Unit tests

Pure logic (pricing calculations, promo/coupon rules, routine-recommendation logic, filter/facet URL state) — framework-agnostic where possible, fast, run on every commit.

## Integration tests

Backend module boundaries (Sprint 9+): e.g. checkout module correctly reads cart + applies promotion + creates order via Prisma against a test database.

## Frontend component tests

Key reusable components (product card, cart drawer, filter sheet, diagnostic step) tested for correct rendering of states (loading/empty/error/success) — not exhaustive snapshot testing of every component.

## Backend tests

Service-level tests per module (`API.md`); webhook signature verification explicitly tested with both valid and tampered payloads.

`apps/api` uses jest + ts-jest (`*.spec.ts` co-located with the file under test). First real example: `profitability-calc.spec.ts`/`profitability.service.spec.ts`/`orders.service.spec.ts` (D-0027/D-0028) — pure calculation functions get full unit coverage (no DB needed); service-level tests stub `PrismaService` directly rather than standing up a test database, since none exists yet in this repo. Financial/aggregate calculations must have an explicit regression test asserting the "unknown input never silently becomes zero" case (D-0027) — a missing cost, price, or quantity must produce `null`/an error/an excluded row, never a number computed as if the missing value were 0.

`apps/api/src/diagnostic/diagnostic-rules/*.spec.ts` (D-0029) — pure, DB-free unit tests for the recommendation engine's building blocks: `build-need-profile.spec.ts` (raw answers → normalized profile never fabricates a budget/pregnancy flag the user didn't state), `keyword-fallback.spec.ts` (the AI-unavailable fallback ranker — asserts name/category matches outrank incidental description mentions, e.g. a hair dye's "rincer au shampooing" instructions must not outrank a real shampoo), `assemble-routine.spec.ts` (every AI/fallback pick whose `productId` isn't in the real candidate set is dropped — defense-in-depth against a hallucinated id ever reaching the response). Real-data verification for this module was also run manually against the live dev DB (5 scenarios: skin dry/sensitive, skin combination/imperfections, hair dry/frizz, hair oily scalp, budget-constrained) with every returned `productId` cross-checked against Postgres — see `PROGRESS.md`.

## Ecommerce critical-path tests (mandatory, not optional — `CLAUDE.md` §14)

E2E coverage for: search → PLP → PDP → add to cart → cart drawer → checkout → order confirmation, before this path is considered "done" in any sprint that touches it. Also: wishlist add/remove, routine diagnostic → recommendation → add-all-to-cart, empty-search state, out-of-stock PDP state.

## E2E tests

Playwright (or equivalent) against a running app with mock/test data; run on the critical paths above plus any newly shipped major flow.

## Accessibility testing

Automated axe checks integrated into component/E2E tests; manual keyboard + screen-reader spot check before major releases (`ACCESSIBILITY.md`).

## Responsive testing

Every shipped page/component verified at minimum: 375px (mobile baseline), 768px (tablet), 1440px (desktop) — mobile is the primary target and gets the most scrutiny (`CLAUDE.md` §5).

## What NOT to over-test

Don't write tests for framework guarantees (Next.js routing itself, Prisma's generated client) or for trivial prop-passthrough components — focus effort on business logic and the critical commerce path, per the project's general "don't add validation/tests for scenarios that can't happen" principle.
