# Infrastructure comparison — where should ParaTunisie be served from?

Status: **analysis only. No DNS change, migration or global cache has been made. Every option below needs explicit approval.**
Measured on 2026-11-15 from a Tunisian connection (Cloudflare reports `loc=TN`, nearest edge `colo=MXP` = Milan).

## 1. What is actually deployed today (verified)

| Item | Finding | How verified |
|---|---|---|
| Hosting location | **Kuala Lumpur, Malaysia**, Hostinger International (AS47583), IP 187.53.136.225 | `ipinfo.io` + ping |
| DNS | Nameservers are Cloudflare (`venkat.ns.cloudflare.com`, `kara.ns.cloudflare.com`) | `nslookup -type=NS` |
| Cloudflare proxy | **OFF (DNS-only, "grey cloud")**. `A` records for `paratunisie.com`, `www`, `admin` resolve to the VPS IP itself, not a Cloudflare range; responses carry `Server: nginx/1.24.0 (Ubuntu)` and no `cf-*` headers | `nslookup`, `curl -I` |
| So Cloudflare today gives | DNS only. No CDN, no edge TLS, no HTTP/3, no Brotli, no DDoS shield, no asset caching | – |
| HTTP features at origin | gzip only (no Brotli). `/_next/static/*` has `Cache-Control: public, max-age=31536000, immutable` (good). `/assets/*.webp` has `public, max-age=0` (not cached by browsers: quick win) | `curl -I` |
| Dashboard access | Not checked: no Cloudflare API token or login was provided, so zone settings (SSL mode, Bot Fight Mode, rules) are **unknown** and must be reviewed in the dashboard before any change | – |

## 2. Measured network latency (this machine → target)

| Target | Round trip (ping avg) |
|---|---|
| Current VPS, Kuala Lumpur | **202 ms** |
| Cloudflare 1.1.1.1 (edge in Milan) | **29 ms** |
| Vultr Frankfurt | 38 ms |
| Vultr Amsterdam | 44 ms |
| OVH Strasbourg | 45 ms |
| Vultr Paris | 47 ms |
| OVH Gravelines | 48 ms |

`robots.txt` (static, no rendering) from the current server, 3 runs: connect 0.20 s, TLS done 0.41–0.43 s, first byte 0.61–0.63 s. So **0.6 s is spent before any page code runs**; the app itself renders in about 85–213 ms.
Same test against a Cloudflare-fronted site from here: connect 0.05 s, TLS 0.10 s, first byte 0.28 s.

## 3. The three options

All "expected" numbers are **estimates derived from the RTTs above** (first-byte ≈ 3 round trips + render time). Real results must be re-measured after any change.

| | A. Current VPS + Cloudflare proxy | B. EU VPS (Frankfurt/Paris/Amsterdam) | C. EU VPS + Cloudflare |
|---|---|---|---|
| What changes | Orange-cloud the records; origin stays in Malaysia | New server in Europe, full migration | B + A |
| Connect + TLS for the visitor | ~0.1 s (Milan edge, 29 ms RTT) | ~0.18 s (≈45 ms RTT × 4) | ~0.1 s |
| Static assets (JS, CSS, images) | **served from edge cache**, ~30–60 ms after the first hit | origin, 45 ms RTT each | edge cache |
| HTML first byte, public page not cached | ~0.45 s (edge→Malaysia leg ≈ 0.15–0.2 s + render) | **~0.3 s** | ~0.25 s |
| HTML first byte, public page cached | ~0.06–0.1 s (needs HTML cache rule, see §5) | ~0.15 s (app cache) | ~0.06–0.1 s |
| Current baseline | first byte ≈ 0.75–0.95 s | | |
| Effort | Hours | Days; DB (Postgres), MinIO images, Meilisearch, cron/sync, certificates, backups all move | Days + hours |
| Risk | Low, reversible in minutes (grey-cloud again) | Medium-high: downtime window, data consistency during switch | Medium-high |
| Cost (indicative) | $0 on the Free plan (Pro ≈ $20–25/month is not needed for this) | ≈ €5–15/month for a 2 vCPU / 4 GB class server; third-party price lists conflict (Hetzner Cloud entry plans quoted €3.8–7.6, Hostinger KVM 2 listed at €7.79 promo then ≈ $12–15 on renewal): **confirm on the provider checkout** | server cost only; Cloudflare Free |
| Also gives | TLS/HTTP-3/Brotli at the edge, hides origin IP, basic DDoS protection | Lower RTT for **API and image** calls, no dependency on a CDN | Both |
| Main drawbacks | HTML is **not cached by default** (Cloudflare caches static file types only); misconfigured Bot Fight / "Under Attack" can challenge Googlebot; edge→origin leg still crosses to Malaysia | Pure latency fix but no caching layer; migration risk; you pay for two servers during the switch | Most moving parts |

### Reading the numbers
- Today's cost to a Tunisian visitor is dominated by **distance**, not by our code or by competitors' code (competitors measure 0.5–1.2 s first byte as well).
- Option A gets most of the benefit for **static assets and connection set-up** at almost no risk. It does not fix the dynamic HTML leg to Malaysia unless HTML is cached at the edge.
- Option B fixes distance for everything (HTML, API, images) but not by caching.
- Option C is the end state; it is only worth doing if A shows the benefit and the business still wants EU origin.
- Lab Lighthouse (simulated 4G) will move less than real users do, because Lighthouse replaces the real network with its own model; verify with real-user data (CrUX once available, GSC Core Web Vitals report).

## 4. Recommendation (ordered, each step independently reversible)

1. **Do now, zero infrastructure risk (no approval needed beyond a normal deploy):** nginx `Cache-Control` for `/assets/*` (currently `max-age=0`) and Brotli. Not done yet; listed as a proposal.
2. **Option A, staged, needs your approval:**
   1. In the Cloudflare dashboard review SSL mode (must be *Full (strict)*), Bot Fight Mode / Security Level (must not challenge Googlebot) and existing rules.
   2. Orange-cloud `paratunisie.com` and `www` only. Keep `admin` grey until the storefront is verified.
   3. Cache Rule for static assets only; HTML = bypass. Run `npm run seo:check` + the tracking test + Googlebot fetch tests.
   4. Later, only if wanted: cache HTML for anonymous requests, **bypass for cart, checkout, account, API and any request with a session cookie**, using the `s-maxage` headers the app now emits when `PUBLIC_CACHE_SECONDS` is on.
3. **Decide on a European VPS only after step 2 is measured.** If real-user TTFB and LCP are acceptable with Cloudflare, the migration risk may not be worth it.

## 5. Interaction with application caching (Batch 6, local only)
- When `PUBLIC_CACHE_SECONDS` is enabled the home and product pages are served from Next's cache (`s-maxage=60`), cart/checkout/account/favorites/loyalty get `Cache-Control: private, no-store`, category pages stay dynamic (their *data* is cached).
- A CDN that caches HTML must honour these headers. Rule of thumb: cache only paths that return `s-maxage`; bypass everything else.
- The API tells the web app to flush the cache after catalogue, price, stock, order and review writes (see `docs/seo/CACHING_PLAN.md`).

## 6. What is NOT known and should be checked before deciding
- Cloudflare zone settings (see §1).
- Whether Hostinger can relocate the existing VPS to a European data center without a rebuild (provider-specific; ask support) — this would be the cheapest way to get option B.
- Real-user Core Web Vitals (CrUX data is not yet available for the domain; PageSpeed quota was exhausted).
