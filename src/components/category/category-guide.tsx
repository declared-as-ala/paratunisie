import type { ReactNode } from "react";

import { ProductRichText } from "@/components/product/product-rich-text";

const slugify = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

type Section = { title: string; body: string };

/**
 * Splits the stored guide on its H2 headings. The FAQ section is excluded: it has its own accessible accordion and its own
 * FAQPage markup. A line containing only {{comparatif}} marks where the live price table is inserted.
 */
export function parseGuide(content: string): { sections: Section[]; marker: number } {
  const clean = content.replace(/\r\n/g, "\n");
  const withoutFaq = clean.split(/\n## Questions fréquentes\b/)[0];
  const parts = withoutFaq.split(/^## /m);
  const intro = parts.shift()?.trim();
  const sections: Section[] = [];
  if (intro) sections.push({ title: "", body: intro });
  let marker = -1; // index in `sections` after which the comparison is rendered
  for (const part of parts) {
    const nl = part.indexOf("\n");
    const title = (nl === -1 ? part : part.slice(0, nl)).trim();
    const body = nl === -1 ? "" : part.slice(nl + 1).trim();
    if (body.includes("{{comparatif}}")) {
      const [before, after] = body.split("{{comparatif}}");
      sections.push({ title, body: before.trim() });
      marker = sections.length - 1;
      if (after.trim()) sections.push({ title: "", body: after.trim() });
      continue;
    }
    sections.push({ title, body });
  }
  return { sections, marker };
}

/**
 * Long-form buying guide shown BELOW the product grid, in readable type, with a table of contents.
 * `comparison` (the live price table) is rendered where the stored text contains {{comparatif}}.
 */
export function CategoryGuide({ content, categoryName, summary, comparison, hasFaq }: { content: string; categoryName: string; summary?: ReactNode; comparison?: ReactNode; hasFaq?: boolean }) {
  const { sections, marker } = parseGuide(content);
  const toc = sections.filter((s) => s.title).map((s) => ({ id: `guide-${slugify(s.title)}`, title: s.title }));
  if (comparison) {
    const at = marker < 0 ? toc.length : sections.slice(0, marker + 1).filter((s) => s.title).length;
    toc.splice(at, 0, { id: "comparatif-prix", title: "Comparatif des prix" });
  }
  if (hasFaq) toc.push({ id: "category-faq-title", title: "Questions fréquentes" });
  return (
    <section id="guide" aria-labelledby="guide-title" className="scroll-mt-28 rounded-2xl border border-border/80 bg-white p-4 shadow-2xs sm:p-6 lg:p-8">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Guide d&apos;achat</p>
      <h2 id="guide-title" className="mt-1 font-serif text-2xl font-extrabold leading-tight text-ink sm:text-3xl">Bien choisir : {categoryName.toLowerCase()}</h2>
      {summary ? <div className="mt-3 text-sm leading-7 text-ink-muted">{summary}</div> : null}
      {toc.length > 2 ? (
        <nav aria-label="Sommaire du guide" className="mt-5">
          <ul className="flex flex-wrap gap-2">
            {toc.map((t) => (
              <li key={t.id}><a href={`#${t.id}`} className="inline-flex min-h-9 items-center rounded-full bg-primary-soft/60 px-3.5 text-xs font-bold text-secondary hover:bg-primary-soft hover:text-primary">{t.title}</a></li>
            ))}
          </ul>
        </nav>
      ) : null}
      <div className="mt-6 space-y-8">
        {sections.map((s, i) => (
          <div key={i} className="space-y-3">
            {s.title ? <h2 id={`guide-${slugify(s.title)}`} className="scroll-mt-28 font-serif text-xl font-extrabold tracking-tight text-ink sm:text-2xl">{s.title}</h2> : null}
            {s.body ? <ProductRichText content={s.body} className="text-sm leading-7 text-ink-muted sm:text-[0.9375rem] [&_h3]:mt-4 [&_h3]:text-base [&_ul]:space-y-1.5" /> : null}
            {comparison && i === marker ? <div className="pt-2">{comparison}</div> : null}
          </div>
        ))}
        {comparison && marker < 0 ? <div>{comparison}</div> : null}
      </div>
    </section>
  );
}
