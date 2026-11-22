# Ranking baseline — 90 days to 2026-11-13 (before Batches 9–12)

Source: Search Console API (property `sc-domain:paratunisie.com`, web search, all countries), query export saved as `ops/seo/_gsc_queries_20261113.json`. Position = impression-weighted average; lower is better. Grouping is a regex classifier (screening aid, not Google data). **This is the 'before' reference: no improvement can be claimed until an equal period measured after Google recrawls shows one.**

Total: 1315 queries, 13736 impressions, 218 clicks, CTR 1.59%.

| Group | Queries | Impressions | Clicks | CTR | Avg position | Queries ≤ pos 10 |
|---|---:|---:|---:|---:|---:|---:|
| 1. ParaTunisie brand | 4 | 5652 | 99 | 1.8% | 3.7 | 3 |
| 2. Category alone (no Tunisie) | 89 | 341 | 1 | 0.3% | 68.0 | 4 |
| 3. Category + Tunisie / price | 89 | 765 | 2 | 0.3% | 66.8 | 3 |
| 4. Exact product / brand + product / size | 386 | 1491 | 30 | 2.0% | 40.6 | 88 |
| 5. Other non-brand | 747 | 5487 | 86 | 1.6% | 41.7 | 274 |

## Opportunities: positions 4–20 with ≥ 3 impressions (non-brand)

| Query | Impr. | Clicks | Pos |
|---|---:|---:|---:|
| citrolax | 240 | 1 | 7.8 |
| enemacol | 111 | 0 | 9.7 |
| cc cream pierre cardin | 94 | 0 | 9.0 |
| "145 beige rose" "accord parfait" | 76 | 0 | 9.5 |
| vominat | 70 | 0 | 5.5 |
| vominat baby | 69 | 0 | 6.7 |
| paratunis | 62 | 1 | 4.8 |
| pierre cardin cc cream | 59 | 0 | 7.8 |
| minoxidil tunisie | 55 | 1 | 9.6 |
| meboderma | 49 | 2 | 8.3 |
| bucco spray | 40 | 0 | 7.4 |
| dip belt tunisie | 36 | 10 | 5.7 |
| alopexy 5 tunisie | 33 | 7 | 6.8 |
| gripoff | 32 | 0 | 10.0 |
| pytheal | 32 | 0 | 9.7 |
| vominat baby posologie | 31 | 0 | 4.9 |
| alopexy tunisie | 30 | 4 | 8.9 |
| mira white | 30 | 0 | 8.6 |
| blastofer | 29 | 0 | 9.9 |
| minoxidil 5 tunisie | 28 | 2 | 9.2 |
| natufolic | 28 | 1 | 7.0 |
| inosifol | 27 | 2 | 7.1 |
| mk 677 prix tunisie | 27 | 1 | 9.2 |
| vominat kids | 23 | 0 | 5.7 |
| mk677 tunisie prix | 22 | 4 | 7.6 |

## High impressions, low CTR (≥ 20 impressions, CTR < 2%)

| Query | Impr. | Clicks | Pos |
|---|---:|---:|---:|
| paratunisie | 5489 | 88 | 3.2 |
| citrolax | 240 | 1 | 7.8 |
| protection solaire tunisie | 173 | 0 | 73.1 |
| filorga tunisie | 172 | 0 | 41.5 |
| coffret clarenia tunisie | 141 | 0 | 61.1 |
| eye care tunisie | 135 | 0 | 35.9 |
| bio orient tunisie | 132 | 0 | 78.2 |
| enemacol | 111 | 0 | 9.7 |
| complément alimentaires tunisie | 103 | 0 | 64.0 |
| whey tunisie | 101 | 0 | 77.0 |
| proteine anabolic tunisie | 99 | 0 | 63.0 |
| chicco tunisie | 96 | 0 | 59.5 |
| cytol basic | 95 | 0 | 81.3 |
| cc cream pierre cardin | 94 | 0 | 9.0 |
| avene creme hydratant tunisie | 92 | 0 | 29.3 |
| clermine | 89 | 0 | 53.6 |
| impact nutrition | 88 | 0 | 52.0 |
| nutrition sportive tunisie | 80 | 0 | 67.3 |
| daylong tunisie | 79 | 0 | 72.8 |
| profertil tunisie | 79 | 0 | 72.4 |

## How to re-measure
Run the same export for an equal-length window ≥ 14 days after the last deploy (2026-11-16), then compare group by group: `python ops/seo/ranking-baseline.py <new export> <label>`. Report only differences visible in Google data.
