# ARCHITECTURE.md — ParaTunisie System Architecture

## Guiding principle

Modular monolith first. No microservices until there's a concrete scaling or team-ownership reason (`CLAUDE.md` §1). Optimize for shipping a polished storefront fast (Sprints 1-8) on mock data, then attach a real backend (Sprint 9+) without a frontend rewrite — data-access is isolated behind typed repository interfaces from day one specifically to make that swap clean.

## Repository layout

Adopted at the start of Sprint 9 (backend sprint). The storefront currently lives at the repo root (`apps/web` placement deferred — see `DECISIONS.md` D-0004).

```
apps/
  web/      Next.js storefront (App Router) — currently at repo root
  admin/    Admin panel (Next.js, port 3002)
  api/      NestJS backend

packages/
  ui/              Shared design-system components (SPRINT A, D-0019)
  types/           Shared TypeScript types/interfaces
  shared/          Shared utilities (formatPrice, slugify, GOUVERNORATS)
  validation/      Shared zod/class-validator schemas (planned)
  config/          Shared config (eslint base, tsconfig base, tailwind preset) (planned)
  seo/             Shared SEO helpers (metadata builders, JSON-LD builders) (planned)
  eslint-config/
  tsconfig/
```

## Frontend

- Next.js App Router, Server Components by default, TypeScript, Tailwind CSS, shadcn/ui as a restyled foundation, Motion (Framer Motion) for animation where the CSS-only path isn't enough, Lucide icons.
- **Shared design system** (`packages/ui`, D-0019): the storefront and admin consume the same design primitives (Button, Input, Select, Badge, Dialog, Drawer, Toast, Skeleton, EmptyState, DataTable, Field, Tooltip, Tabs). Domain components remain app-specific (ProductCard/MegaMenu/CartDrawer in storefront; OrderTable/MarginCard/OrderTimeline in admin).
- Data access behind a repository interface (`ProductRepository`, `CartRepository`, etc.) with a mock implementation now and a real API-backed implementation in Phase 2 — same interface, swapped implementation, no component rewrites.

## Backend (Phase 2 / Sprint 9+)

- NestJS, TypeScript, modular structure per `API.md`.
- PostgreSQL as system of record, via Prisma ORM (migrations committed to repo). Local dev: Docker Compose Postgres (SPRINT B) — SQLite was the Sprint 9 local-dev shortcut, superseded by the containerized stack.
- Redis for caching and session/queue backing.
- BullMQ for background jobs (email/SMS notifications, sitemap regeneration, search index sync, order-processing side effects).
- Meilisearch for product/content search (typo tolerance, facets).
- **MinIO (S3-compatible object storage)** for all media — product images, brand/category/article images, homepage banners, campaign assets. Database stores metadata only (object key, URL, mime, width, height, size, alt, ordering, entity relationship, timestamps) — never binaries. Object naming strategy and safe-deletion flow in `DECISIONS.md` D-0018. Media served from MinIO directly (or CDN/reverse-proxy in prod); signed URLs available for private assets.
- REST API, documented with OpenAPI (`API.md`), consumed by `apps/web` and `apps/admin`.

## Docker / local infrastructure (SPRINT B)

Full stack containerized via Docker Compose (`docker compose up -d`):

- `paratunisie-web` — storefront (edge network)
- `paratunisie-admin` — admin (edge network)
- `paratunisie-api` — NestJS (edge + internal)
- `paratunisie-postgres`, `paratunisie-redis`, `paratunisie-meilisearch`, `paratunisie-minio` — internal network only

Networking decision (D-0020): two intentional networks — `edge` (web, admin) and `internal` (api + all data services). Data services are not reachable from the edge; the API is the only internal tenant that also serves edge traffic. Multi-stage Dockerfiles, health checks, non-root runtime users, persistent volumes for Postgres/MinIO, `.dockerignore` per app. Details in `DEPLOYMENT.md`.

## Caching

- Next.js route/data caching + ISR for catalogue pages (revalidate on publish/webhook rather than pure time-based staleness once real data exists).
- Redis cache for expensive/shared backend reads (search facet counts, homepage curated collections).
- CDN in front of static/image assets.

## Authentication (Phase 2)

- Session-based or JWT — decided and recorded in `DECISIONS.md` at Sprint 9 start based on the chosen hosting/infra; guest checkout does not require auth regardless of the choice.
- Admin auth is separate from customer auth (different session scope, RBAC — see `SECURITY.md`).

## Payment Flow (Phase 2)

- Cash on Delivery only — the dominant payment method in the Tunisian ecommerce market, and the sole payment method by explicit product decision (`DECISIONS.md` D-0014). No online payment gateway (card, e-Dinar, wallet) will be integrated, so there is no external payment provider dependency, no webhook intake for payment callbacks, and no PCI/tokenization surface to design for.

## Order Flow (Phase 2)

Cart → checkout submission → order created (pending) → payment/COD confirmation → fulfillment status updates (processing → shipped → delivered) surfaced to the customer account and, later, to admin/ERP.

## Future Integrations

Google Merchant Center feed, WhatsApp Business API (beyond click-to-chat), SMS/email transactional provider, analytics (GA4), Search Console API, loyalty engine.

## Deployment

See `DEPLOYMENT.md` for environment/pipeline detail. Summary: frontend deployable to a Next.js-friendly host (Vercel or equivalent) independent of backend readiness — the mock-data storefront can ship and iterate before the backend exists. Backend deploys as containerized NestJS + managed Postgres + managed Redis once Sprint 9 starts. Full local stack: `docker compose up -d` (Postgres, Redis, Meilisearch, MinIO, API, web, admin).

## Observability (Phase 2+)

Structured logging from the API, error tracking (e.g. Sentry-class tool) on both frontend and backend, uptime monitoring on critical paths (checkout, payment webhook endpoint), CWV field monitoring per `PERFORMANCE.md`/`SEO.md`.
