import React from "react";

/* ── Types ─────────────────────────────────────────────────────────────── */

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading2"; text: string }
  | { type: "heading3"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "quote"; text: string; author?: string }
  | { type: "callout"; text: string; variant?: "info" | "tip" | "warning" }
  | { type: "image"; url: string; alt: string; caption?: string }
  | { type: "divider" }
  | { type: "product_single"; productId: string; rationale?: string }
  | { type: "product_grid"; productIds: string[]; heading?: string }
  | { type: "category_cta"; categorySlug: string; label: string }
  | { type: "brand_cta"; brandSlug: string; label: string };

interface ArticleBlockRendererProps {
  content: string | string[]; // JSON string or array of strings
}

/* ── Parser ─────────────────────────────────────────────────────────── */

export function parseContent(content: string | string[]): ContentBlock[] {
  if (Array.isArray(content)) {
    return content.map((text) => ({ type: "paragraph", text }));
  }

  try {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) return [];

    // Handle legacy format: string[] (flat paragraphs)
    if (parsed.length > 0 && typeof parsed[0] === "string") {
      return parsed.map((text: string) => ({ type: "paragraph", text }));
    }

    return parsed as ContentBlock[];
  } catch {
    return [];
  }
}

/* ── Renderers ───────────────────────────────────────────────────────── */

const CALLOUT_STYLES = {
  info: "bg-blue-50 border-blue-200 text-blue-900",
  tip: "bg-emerald-50 border-emerald-200 text-emerald-900",
  warning: "bg-amber-50 border-amber-200 text-amber-900",
} as const;

const CALLOUT_ICONS = {
  info: "ℹ️",
  tip: "💡",
  warning: "⚠️",
} as const;

/* ── Main component ──────────────────────────────────────────────────── */

export function ArticleBlockRenderer({ content }: ArticleBlockRendererProps) {
  const blocks = parseContent(content);

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p
                key={index}
                className="text-sm leading-relaxed text-ink sm:text-base sm:leading-7"
              >
                {block.text}
              </p>
            );

          case "heading2":
            return (
              <h2
                key={index}
                id={`h-${block.text.toLowerCase().replace(/\s+/g, "-").slice(0, 40)}`}
                className="mt-8 mb-3 font-serif text-xl font-medium tracking-tight text-ink sm:text-2xl"
              >
                {block.text}
              </h2>
            );

          case "heading3":
            return (
              <h3
                key={index}
                id={`h-${block.text.toLowerCase().replace(/\s+/g, "-").slice(0, 40)}`}
                className="mt-5 mb-2 font-serif text-lg font-medium text-ink sm:text-xl"
              >
                {block.text}
              </h3>
            );

          case "list": {
            const Tag = block.ordered ? "ol" : "ul";
            return (
              <Tag
                key={index}
                className={`ml-5 space-y-1.5 text-sm text-ink sm:text-base ${
                  block.ordered ? "list-decimal" : "list-disc"
                }`}
              >
                {block.items.map((item, i) => (
                  <li key={i} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </Tag>
            );
          }

          case "quote":
            return (
              <blockquote
                key={index}
                className="border-l-4 border-primary pl-5 my-6"
              >
                <p className="text-base italic text-ink leading-relaxed">{block.text}</p>
                {block.author && (
                  <footer className="mt-2 text-sm font-medium text-ink-muted">— {block.author}</footer>
                )}
              </blockquote>
            );

          case "callout": {
            const variant = block.variant ?? "info";
            return (
              <div
                key={index}
                className={`rounded-xl border p-4 ${CALLOUT_STYLES[variant]}`}
              >
                <p className="flex items-start gap-2 text-sm leading-relaxed">
                  <span role="img" aria-label={variant} className="mt-0.5 shrink-0">
                    {CALLOUT_ICONS[variant]}
                  </span>
                  {block.text}
                </p>
              </div>
            );
          }

          case "image":
            return (
              <figure key={index} className="my-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={block.url}
                  alt={block.alt}
                  className="w-full rounded-xl border border-border object-cover"
                  loading="lazy"
                />
                {block.caption && (
                  <figcaption className="mt-2 text-center text-xs text-ink-muted italic">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );

          case "divider":
            return <hr key={index} className="border-border my-8" />;

          // Product blocks are handled by the parent page
          // We render a placeholder here so the layout is consistent
          case "product_single":
          case "product_grid":
          case "category_cta":
          case "brand_cta":
            return null;

          default:
            return null;
        }
      })}
    </div>
  );
}

/* ── TOC extractor ───────────────────────────────────────────────────── */

export function extractTOC(content: string | string[]): { id: string; text: string; level: 2 | 3 }[] {
  const blocks = parseContent(content);
  const toc: { id: string; text: string; level: 2 | 3 }[] = [];

  for (const block of blocks) {
    if (block.type === "heading2") {
      toc.push({
        id: `h-${block.text.toLowerCase().replace(/\s+/g, "-").slice(0, 40)}`,
        text: block.text,
        level: 2,
      });
    } else if (block.type === "heading3") {
      toc.push({
        id: `h-${block.text.toLowerCase().replace(/\s+/g, "-").slice(0, 40)}`,
        text: block.text,
        level: 3,
      });
    }
  }

  return toc;
}
