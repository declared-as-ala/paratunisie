import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationNavProps = {
  currentPage: number;
  totalPages: number;
  /** Builds the href for a given page number (1-based). */
  pageHref: (page: number) => string;
  className?: string;
};

function pageWindow(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const withEllipsis: (number | "ellipsis")[] = [];
  sorted.forEach((p, idx) => {
    if (idx > 0 && p - sorted[idx - 1] > 1) {
      withEllipsis.push("ellipsis");
    }
    withEllipsis.push(p);
  });
  return withEllipsis;
}

/**
 * Shared numeric pagination for the shop and category PLPs. 44px touch
 * targets throughout (CLAUDE.md §5) — the two prior bespoke implementations
 * dropped to 32-36px on the number cells.
 */
export function PaginationNav({ currentPage, totalPages, pageHref, className }: PaginationNavProps) {
  if (totalPages <= 1) return null;

  const pages = pageWindow(currentPage, totalPages);

  const navButton = "flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-white text-ink transition-colors duration-150 hover:border-primary/40 hover:bg-soft-nude disabled:pointer-events-none disabled:opacity-40";

  return (
    <nav
      aria-label="Pagination"
      className={`mt-10 flex items-center justify-center gap-1.5 sm:gap-2 ${className ?? ""}`}
    >
      {currentPage > 1 ? (
        <Link rel="prev" href={pageHref(currentPage - 1)} aria-label="Page précédente" className={navButton}>
          <ChevronLeft size={18} />
        </Link>
      ) : (
        <span aria-hidden="true" className={`${navButton} opacity-40`}>
          <ChevronLeft size={18} />
        </span>
      )}

      <div className="flex items-center gap-1 rounded-xl bg-soft-nude/50 p-1">
        {pages.map((p, idx) =>
          p === "ellipsis" ? (
            <span key={`ellipsis-${idx}`} aria-hidden="true" className="flex size-11 items-center justify-center text-sm font-semibold text-ink-muted">
              &hellip;
            </span>
          ) : (
            <Link
              key={p}
              href={pageHref(p)}
              aria-current={currentPage === p ? "page" : undefined}
              className={`flex size-11 items-center justify-center rounded-lg text-sm font-bold tabular-nums transition-all duration-150 ${
                currentPage === p
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-ink hover:bg-white"
              }`}
            >
              {p}
            </Link>
          ),
        )}
      </div>

      {currentPage < totalPages ? (
        <Link rel="next" href={pageHref(currentPage + 1)} aria-label="Page suivante" className={navButton}>
          <ChevronRight size={18} />
        </Link>
      ) : (
        <span aria-hidden="true" className={`${navButton} opacity-40`}>
          <ChevronRight size={18} />
        </span>
      )}
    </nav>
  );
}
