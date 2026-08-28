"use client";

import * as React from "react";
import { HelpCircle, ChevronDown } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
}

interface ArticleFaqProps {
  title?: string;
  items: FaqItem[];
}

export function ArticleFaq({ title = "Foire Aux Questions (FAQ)", items }: ArticleFaqProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0); // First item open by default

  if (!items || items.length === 0) return null;

  const toggle = (idx: number) => {
    setOpenIndex((curr) => (curr === idx ? null : idx));
  };

  return (
    <section aria-labelledby="faq-heading" className="my-10">
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="size-5 text-primary" />
        <h2 id="faq-heading" className="font-serif text-xl font-bold text-ink sm:text-2xl">
          {title}
        </h2>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className="rounded-2xl border border-border/80 bg-white shadow-xs transition-colors overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="flex w-full items-center justify-between p-4 sm:p-5 text-left font-serif text-sm sm:text-base font-bold text-ink hover:text-primary transition-colors cursor-pointer"
                aria-expanded={isOpen}
              >
                <span>{item.question}</span>
                <ChevronDown
                  className={`size-4 shrink-0 text-ink-muted ml-3 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm leading-relaxed text-ink-muted border-t border-border/40 pt-3">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
