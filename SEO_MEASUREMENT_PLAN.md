# ParaTunisie — Google Search Console & Analytics Measurement Plan

**Date:** September 2026  
**Auditor:** Senior E-Commerce SEO Strategist  
**Scope:** Search Console Tracking, GA4 Ecommerce Events, Organic KPI Dashboards  

---

## 1. Executive Summary

This measurement plan establishes structured reporting groups, organic KPI tracking, and automated validation gates for ParaTunisie's growth phase.

---

## 2. Google Search Console Tracking Structure

### Core Performance Metrics Tracked Daily
- **Total Organic Impressions**
- **Total Organic Clicks**
- **Average Organic CTR (%)**
- **Average Ranking Position**
- **Index Coverage Status:**
  - *Indexed Pages (Target: 100% of sitemap.xml URLs)*
  - *Discovered – currently not indexed*
  - *Crawled – currently not indexed*
  - *Page with redirect*
  - *Alternate page with proper canonical tag*

### Segmented Reporting Clusters (Regex Filters)

| Cluster Name | GSC Page Filter Pattern | High-Intent Focus Queries |
| :--- | :--- | :--- |
| **Créatine Hub** | `https://paratunisie.com/(creatine.*\|produits/.*creatine.*)` | `creatine tunisie`, `creatine monohydrate prix`, `creapure tunisie` |
| **Whey & Protéines** | `https://paratunisie.com/(whey.*\|gainers.*\|produits/.*whey.*)` | `whey protein tunisie`, `whey isolate prix`, `gainer prise de masse` |
| **Anti-Stress & Sommeil** | `https://paratunisie.com/(pack-anti-stress\|ashwagandha.*\|magnesium.*)` | `ashwagandha tunisie`, `magnesium b6 tunisie`, `pack anti stress` |
| **Vitamines & Minéraux** | `https://paratunisie.com/(vitamines.*\|zinc.*\|omega-3.*)` | `vitamine d3 k2 tunisie`, `zinc musculation tunisie`, `omega 3 epa dha` |
| **Marques Officielles** | `https://paratunisie.com/marques/.*` | `biotech usa tunisie`, `real pharm tunisie`, `quamtrax tunisie` |
| **Editorial Guides** | `https://paratunisie.com/conseils/.*` | `quand prendre la creatine`, `meilleure whey tunisie`, `dosage ashwagandha` |

---

## 3. GA4 Organic E-Commerce Event Specification

The storefront emits standardized GA4 e-commerce events and Meta Conversions API (CAPI) events:

```
[view_item_list] (Category PLP / Search Results)
        ↓
   [view_item] (Product PDP / Pack Landing)
        ↓
  [add_to_cart] (Cart Drawer Open)
        ↓
[begin_checkout] (Checkout Page / Form)
        ↓
   [purchase] (Confirmation / COD Order Registered)
```

| Event Name | Key Parameters Sent | Verification Method |
| :--- | :--- | :--- |
| `view_item` | `currency: "TND"`, `value`, `items: [{ item_id, item_name, item_brand, item_category, price }]` | DataLayer / GA4 DebugView |
| `add_to_cart` | `currency: "TND"`, `value`, `items: [...]` | DataLayer push on button click |
| `begin_checkout` | `currency: "TND"`, `value`, `coupon` | Checkout step 1 |
| `purchase` | `transaction_id`, `value`, `shipping: 7.000`, `currency: "TND"`, `items: [...]` | Order confirmation screen |
| `whatsapp_click` | `contact_type: "customer_support"`, `phone: "97991266"` | Custom event on WhatsApp CTA click |

---

## 4. Weekly SEO Audit Checklist

```text
[ ] Check GSC Index Coverage for unexpected 404 or redirect spikes
[ ] Verify sitemap.xml contains 100% HTTP 200 URLs with 0 errors
[ ] Review organic search queries with high impressions but low CTR (Position 4-10) for meta title optimization
[ ] Track organic conversions and COD order volume in GA4
[ ] Verify that no unauthorized bulk scrapers imported unvetted products into indexable status
```
