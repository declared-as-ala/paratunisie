/**
 * Motion tokens for JS-driven (Motion) animation. Values mirror the CSS
 * custom properties in src/app/globals.css — one source of truth, two
 * consumers. Extend here and in globals.css together; never fork a new
 * duration/easing scale locally in a component.
 */

export const duration = {
  micro: 0.15,
  standard: 0.25,
  large: 0.4,
} as const;

/** Cubic-bezier eases as arrays, for Motion's `ease` prop. */
export const ease = {
  /** Entrances and exits. */
  out: [0.16, 1, 0.3, 1] as const,
  /** On-screen movement/morphing (e.g. header shrink-on-scroll). */
  inOut: [0.77, 0, 0.175, 1] as const,
  /** Sheets and drawers — iOS-like. */
  drawer: [0.32, 0.72, 0, 1] as const,
};

/** Apple-style spring — for gesture-driven, interruptible motion (drag, swipe). Prefer over a bezier for anything the user can interrupt mid-motion. */
export const spring = {
  default: { type: "spring", duration: 0.5, bounce: 0.2 } as const,
  /** Snappier, less bounce — small UI feedback (e.g. wishlist toggle). */
  snappy: { type: "spring", duration: 0.35, bounce: 0.15 } as const,
};

/**
 * Fade + rise entrance, for content that shouldn't teleport in.
 * transform/opacity only — see CLAUDE.md §7 / PERFORMANCE.md.
 */
export const fadeInUp = {
  hidden: { opacity: 0, transform: "translateY(8px)" },
  visible: {
    opacity: 1,
    transform: "translateY(0px)",
    transition: { duration: duration.standard, ease: ease.out },
  },
};

/** Staggered reveal for a group of siblings (e.g. mega-menu columns, card grids). */
export function staggerContainer(staggerMs = 50) {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: staggerMs / 1000 },
    },
  };
}
