# DESIGN_SYSTEM.md — ParaTunisie Visual Language

## Philosophy

Luxury beauty retail + dermocosmetic trust + modern ecommerce + expert guidance, expressed through typography, composition, whitespace, photography and restrained motion — never through heavy effects. If a design decision's justification is "it looks premium," but it relies on gradients/glassmorphism/big shadows/excess rounding, it's wrong; if it relies on spacing, hierarchy, and a well-chosen photograph, it's right.

Explicitly avoid: pharmacy blue as a primary, neon, excessive bright green, excessive pink, cheap gradients, heavy glassmorphism, giant shadows, overly rounded interfaces, childish cards, excessive pill shapes, crowded layouts.

## Color

**Re-locked for Sprint 2 (2026-08-07).** The user supplied the complete rose-plum palette below. It replaces the original botanical green direction and has been checked against the generated homepage photography and WCAG AA contrast targets; see `DECISIONS.md` D-0009.

| Token | Hex | Role |
|---|---|---|
| `--color-primary` | `#7B2F52` | Deep rose plum — primary brand, CTAs, key accents |
| `--color-primary-hover` | `#5E203C` | Dark rose plum — primary hover-active state |
| `--color-secondary` | `#C98FA8` | Dusty rose — secondary controls and brand moments |
| `--color-primary-soft` | `#EAD2DC` | Soft blush — selected states and gentle section washes |
| `--color-surface` | `#FCF8F6` | Warm ivory — default page background |
| `--color-surface-alt` | `#FFFFFF` | Pure white — cards, elevated surfaces |
| `--color-soft-nude` | `#F5ECE8` | Soft nude — secondary page and section background |
| `--color-accent` | `#C8A46B` | Champagne gold — sparingly: loyalty and editorial highlights |
| `--color-ink` | `#2B2326` | Deep cocoa — primary text |
| `--color-ink-muted` | `#716268` | Muted cocoa — secondary text, AA on warm ivory |
| `--color-border` | `#E7D9D5` | Hairline borders on warm surfaces |
| `--color-danger` | `#B3402C` | Muted terracotta-red — errors, out-of-stock |
| `--color-danger-bg` | `#FBEBE7` | Error/danger tinted background |
| `--color-success` | `#2F6F52` | Muted teal-green (hue-distinct from primary) — confirmations |
| `--color-success-bg` | `#EAF3EE` | Success tinted background |

Rule: color is never the sole signal of state (stock, promo, error) — always paired with an icon or text label (`ACCESSIBILITY.md`).

## Typography

**Locked Sprint 1:** [Fraunces](https://fonts.google.com/specimen/Fraunces) (variable, optical-size-aware editorial serif) for hero headings, campaign headlines, editorial section titles only. [Inter](https://fonts.google.com/specimen/Inter) for navigation, product info, forms, prices, buttons, all ecommerce UI — chosen for its readability at small sizes and native tabular-figure support for price alignment. Both loaded via `next/font/google` with subsetting, `display: swap`.

- Mobile heading scale capped so a hero headline never consumes the full viewport height; test on a 375×667 viewport before merging any hero.
- Numeric/price rendering uses tabular figures (`font-variant-numeric: tabular-nums`) so prices align in lists.

## Spacing & Grid

- 4px base unit, Tailwind spacing scale used as-is (no ad hoc pixel values in components).
- Content max-width contained (e.g. 1280-1440px) with generous outer gutters on desktop; mobile gutter minimum 16px.
- 12-column grid on desktop, single-column/stacked with intentional asymmetry allowed on mobile — asymmetry via content order and sizing, not via broken alignment.

## Surfaces, Borders, Radii, Shadows

- Borders: hairline (1px), low-contrast, used to separate rather than decorate.
- Radii: small-to-moderate (e.g. 4-12px range depending on component scale) — consistent per component type, never maximal "pill everything."
- Shadows: soft and shallow, used only to indicate elevation (dropdowns, drawers, sticky bars) — never as a default card decoration.

## Core Components (token-driven, restyled shadcn primitives)

- **Buttons**: primary (filled, primary color), secondary (outline/ghost), and a tertiary text-link style. Consistent height scale, consistent focus ring.
- **Inputs**: consistent height/padding, clear label placement, inline error state with icon + message (not color alone).
- **Cards**: product card is the most important card in the system (see PDP/PLP docs in `REQUIREMENTS.md`/`UX.md`) — image, brand, name, benefit line, size, price (+ struck previous price), rating, stock signal, wishlist toggle, quick-add. No essential info hidden behind hover on any breakpoint.
- **Drawers**: cart drawer and filter bottom sheet — consistent enter/exit motion (see Motion below), consistent scrim treatment.
- **Modals**: reserved for genuinely blocking decisions (e.g. confirm destructive action); prefer drawers/sheets for browsing-adjacent tasks.
- **Navigation**: desktop mega-menu and mobile five-item bottom tab bar — hierarchy and active location must be unambiguous within one glance.
- **Badges**: Best-seller, Nouveau, Coup de cœur, Recommandé, -20%, Peau sensible, Stock limité — one visual badge language, capped at 1-2 badges per card to avoid clutter.

## Motion

- Timing scale: micro-interactions 120-180ms, standard transitions 200-300ms, larger surface transitions (drawers, page-level reveals) 300-450ms. Nothing purchase-path-blocking runs longer than ~450ms.
- Easing: ease-out for entrances (things arriving should decelerate into place), ease-in for exits, spring-based easing for gesture-driven/interruptible interactions (drag, swipe, sheet drag-to-dismiss) per `apple-design` skill guidance.
- Every animated interaction must be interruptible where the user might reasonably act again mid-animation (opening cart while it's still closing, etc).
- `prefers-reduced-motion: reduce` disables non-essential motion (parallax, decorative reveals) and shortens/removes remaining transitions to near-instant.

## Mobile Interaction Principles

- Bottom-reachable primary actions where feasible (sticky add-to-cart bar on PDP, sticky filter/sort bar on PLP).
- Persistent bottom navigation uses at most five top-level destinations, icon plus label, a non-color active marker, and safe-area padding.
- No functionality that depends on hover only.
- Filter and sort surfaces are bottom sheets, not adapted desktop sidebars.
- Minimum 44×44px touch targets.

## Loading / Skeleton Patterns

- Skeletons match the real layout's proportions (no generic gray boxes unrelated to final content shape) to avoid CLS and to feel intentional.
- Prefer optimistic UI for reversible actions (wishlist toggle, quantity change) over spinner-then-update.

## Composition Rule (anti-genericism)

No homepage or landing section may be "heading + paragraph + 4 identical cards" by default. Each section needs one deliberate compositional choice: full-bleed imagery, split layout, asymmetric grid, horizontal scroll/discovery, typography-driven layout, or an interactive selector. Alternate dense commerce sections with calmer editorial sections to create rhythm (see homepage architecture in `UX.md`/handoff brief).

## Quality Bar (self-review checklist — run after every major UI implementation)

- Does it look generic / like default shadcn / like a template?
- Is the hierarchy obvious at a glance?
- Is mobile excellent, not just "responsive"?
- Is there visual noise that isn't earning its place?
- Is every animation meaningful?
- Is it fast (perceived and measured)?
- Can the primary ecommerce action be found immediately?
- Does it feel premium without relying on heavy effects?
- Does the page have visual rhythm across sections?
- Would this stand out against Tunisian parapharmacy competitors?

If the honest answer to any of these is "no," iterate before calling the work done.
