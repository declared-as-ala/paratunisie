# DEPLOYMENT.md — ParaTunisie Deployment Plan

## Local infrastructure — Docker Compose (SPRINT B)

The entire stack runs locally with one command:

```bash
docker compose up -d
```

Services (networking per `DECISIONS.md` D-0020):

| Service | Port (host) | Network | Notes |
|---------|-------------|---------|-------|
| `paratunisie-web` | 3000 | edge | Storefront Next.js |
| `paratunisie-admin` | 3002 | edge | Admin Next.js |
| `paratunisie-api` | 3001 | edge + internal | NestJS; the only service on both networks |
| `paratunisie-postgres` | 5432 | internal | Data of record. Host port exposed **only** for local tooling (`npm run dev`, Prisma Studio) — D-0020 |
| `paratunisie-redis` | — (internal) | internal | Cache/queue backing |
| `paratunisie-meilisearch` | — (internal) | internal | Search (SPRINT 10+) |
| `paratunisie-minio` | — (internal) | internal | S3-compatible object storage for media (SPRINT C) |

- Data services (Redis, Meilisearch, MinIO) are **not** exposed on host ports — the API is their only tenant. Postgres maps `5432` for local tooling (documented dev-only mapping, `DECISIONS.md` D-0020). A `docker-compose.override.yml` may add more dev-only ports (e.g. MinIO console `9001`).
- Persistent volumes: `postgres-data`, `minio-data`, `meilisearch-data`.
- API container runs `prisma migrate deploy && prisma db seed` on start (idempotent seed).
- Environment: `.env` at repo root (compose variables) + `apps/api/.env`, `apps/admin/.env` per app; `.env.example` files committed, real `.env` files gitignored. No secrets baked into images.

Health checks: every service exposes one (HTTP or TCP); `docker compose ps` shows `healthy` when the stack is up.

## Phase 1 (Sprints 1-8): frontend-only, mock data

- `apps/web` (or repo-root Next.js app) deployed to a Next.js-friendly host (Vercel or equivalent) — independent of backend readiness, since it runs entirely on mock data through this phase.
- Preview deployments per branch/PR for design review.
- Custom domain `paratunisie.com` pointed at the frontend once the team is ready to make the in-progress site visible; staging subdomain used until then.

## Phase 2 (Sprint 9+): backend attached

- NestJS API containerized (Docker), deployed alongside managed PostgreSQL and managed Redis (provider chosen at Sprint 9 kickoff, recorded in `DECISIONS.md`).
- Environment separation: local → staging → production, with distinct databases and secrets per environment (`SECURITY.md` — no secrets in source control).
- Database migrations run as an explicit deploy step (Prisma migrate deploy), never ad hoc against production.
- Meilisearch and object storage (S3-compatible/MinIO) provisioned per environment; search index rebuilt/synced as part of the catalogue-data pipeline.

## CI

- Type-check, lint, unit/integration tests, and critical-path E2E tests run on every PR before merge (`TESTING.md`).
- Build verification (production build succeeds) required before deploy.

## Rollback

- Frontend: revert to previous deployment (platform-native instant rollback).
- Backend: previous container image redeployed; database migrations designed to be backward-compatible for at least one release where feasible (avoid destructive migrations that block rollback).

## Domain / DNS

- `paratunisie.com` DNS managed with clear ownership; SSL via the hosting platform's managed certificates.

## Monitoring post-deploy

- CWV field data, error tracking, and uptime checks on checkout/payment-webhook endpoints reviewed after each production deploy (`ARCHITECTURE.md` §Observability, `PERFORMANCE.md`).
