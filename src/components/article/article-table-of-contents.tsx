"use client";

import * as React from "react";
import { ListOrdered, ChevronDown } from "lucide-react";

export interface TocItem {
  id: string;
  text: string;
  level?: 2 | 3;
}

interface ArticleTableOfContentsProps {
  items: TocItem[];
}

export function ArticleTableOfContents({ items }: ArticleTableOfContentsProps) {
  const [activeId, setActiveId] = React.useState<string>("");
  const [isOpen, setIsOpen] = React.useState<boolean>(true);

  React.useEffect(() => {
    if (!items || items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0% -60% 0%" },
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Table des matières de l'article"
      className="my-6 rounded-2xl border border-border/80 bg-surface-alt/60 p-4 sm:p-5 shadow-xs"
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between font-serif text-sm font-bold text-ink sm:text-base cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <ListOrdered className="size-4 text-primary" />
          Sommaire de l&apos;article
        </span>
        <ChevronDown
          className={`size-4 text-ink-muted transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <ul className="mt-3 space-y-1.5 border-t border-border/50 pt-3 text-xs sm:text-sm">
          {items.map((item, idx) => {
            const isActive = activeId === item.id;
            const isH3 = item.level === 3;

            return (
              <li
                key={item.id || idx}
                className={isH3 ? "ml-4 border-l border-border/60 pl-2" : ""}
              >
                <a
                  href={`#${item.id}`}
                  className={`block py-1 transition-colors leading-snug ${
                    isActive
                      ? "font-bold text-primary"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {item.text}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}
