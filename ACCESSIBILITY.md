# ACCESSIBILITY.md — ParaTunisie WCAG-Focused Requirements

Baseline target: WCAG 2.1 AA across the storefront.

## Color

- Color is never the sole signal of state (stock, error, promo, selection) — always paired with text or an icon (`DESIGN_SYSTEM.md`).
- Text/background contrast meets AA (4.5:1 normal text, 3:1 large text/UI components).

## Keyboard

- Every interactive element (nav, mega-menu, filters, cart drawer, modals, diagnostic flow, forms) is fully operable by keyboard alone — no mouse/touch-only interaction paths.
- Logical tab order matching visual order; no keyboard traps in drawers/modals (focus can always move out via Escape or a close control).

## Focus states

- Visible focus indicator on every focusable element, never suppressed with `outline: none` without a compliant custom replacement.
- Focus is moved deliberately on route change / drawer open (to the drawer's first focusable element) and returned to the trigger on close.

## Screen readers

- Semantic HTML first (`nav`, `main`, `button`, `a`, headings in order) — ARIA supplements, it doesn't replace, semantic structure.
- Images carry meaningful `alt` text; decorative images use empty `alt=""`.
- Live regions (`aria-live`) for async feedback that isn't otherwise announced (cart updated, form error appeared, search results updated).

## Dialogs / Drawers

- `role="dialog"` (or native `<dialog>`), `aria-modal`, labeled via `aria-labelledby`, focus trapped while open, Escape closes, background inert to screen readers while open.

## Forms

- Every input has a visible, programmatically associated label (not placeholder-as-label).
- Errors are specific, associated with their field (`aria-describedby`), announced on submit, and don't rely on color alone.

## Reduced motion

- `prefers-reduced-motion: reduce` respected everywhere motion is used — non-essential motion disabled, essential transitions shortened rather than removed entirely where removal would be disorienting (`DESIGN_SYSTEM.md` §Motion).

## Touch targets

- Minimum 44×44px for interactive elements on mobile viewports (`CLAUDE.md` §5).

## Testing

- Automated checks (axe or equivalent) integrated into the frontend test suite (`TESTING.md`); manual keyboard-only and screen-reader spot checks on the critical path (search → PLP → PDP → cart → checkout) before major releases.
