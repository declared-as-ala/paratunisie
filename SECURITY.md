# SECURITY.md — ParaTunisie Security Requirements

## Authentication

- Passwords hashed with a modern adaptive algorithm (argon2/bcrypt), never reversible encryption.
- OTP/phone-based auth (if adopted) rate-limited and time-boxed.
- Guest checkout never requires an account — auth is additive, not a gate (`REQUIREMENTS.md`).

## Authorization / RBAC

- Admin roles distinct from customer accounts, least-privilege by default (e.g. content-editor role cannot touch payments/orders unless explicitly granted).
- Every mutating admin endpoint checks role, not just "is authenticated" (`API.md`).

## Sessions

- HttpOnly, Secure, SameSite cookies for session/auth tokens — never accessible to client JS.
- Session invalidation on password change and explicit logout; reasonable idle/absolute expiry.

## CSRF

- State-changing requests protected (double-submit token or SameSite=Strict/Lax cookie strategy appropriate to the chosen auth model) — decided concretely at Sprint 9 kickoff and recorded in `DECISIONS.md`.

## CORS

- Storefront/admin origins explicitly allow-listed; no wildcard `*` origin on any endpoint that reads authenticated data.

## Rate Limiting

- Login, OTP, checkout submission, and search endpoints rate-limited per IP/session to prevent brute force and scraping abuse.

## API Validation

- All external input (client requests, third-party webhooks) validated at the boundary; internal service-to-service calls trust their own guarantees (`CLAUDE.md` §17).

## Payment Security

- Cash on Delivery only — no online payment gateway is planned (`DECISIONS.md` D-0014), so no card data, tokenization flow, or PCI scope applies to this project.
- COD flow still validates order integrity (price/stock at order time) server-side, never trusting client-submitted totals.
- If this decision is ever revisited, webhook signature verification and hosted/tokenized card handling (never touching raw card data on ParaTunisie servers) would need to be designed then — not scoped today.

## Webhook Verification

- Every inbound webhook (payment provider, future integrations) verifies a cryptographic signature before acting on the payload; replay protection via idempotency keys.

## Secrets

- No secrets in source control, ever. Environment variables managed via the hosting platform's secret store; `.env.example` documents required keys with placeholder values only.

## Logging

- No PII (full card numbers, passwords, raw auth tokens) ever written to logs.
- Structured logs for auth events, payment events, and admin mutations for audit purposes.

## Personal Data

- Customer PII (addresses, phone numbers) scoped to the modules that need it; export/delete-on-request capability planned before any GDPR/local-equivalent obligation applies to real customer data.

## Backups

- Automated Postgres backups once real customer/order data exists (Sprint 9+), tested restore process — a backup that's never been restored isn't verified.

## Admin Security

- Admin panel behind its own auth, ideally on a distinct subdomain/path with additional protection (IP allow-list or MFA) once real order/customer data is at stake.

## Dependency Hygiene

- No dependency added without justification (`CLAUDE.md` §15); periodic `npm audit`/equivalent review before major releases.
