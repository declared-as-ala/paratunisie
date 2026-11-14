"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { ProductRichText } from "@/components/product/product-rich-text";
import { COMPANY_CONFIG } from "@/lib/config/company";
import type { ProductSummary } from "@/lib/data/products";

function Section({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: ReactNode }) {
  return (
    <details open={defaultOpen} className="group px-5 sm:px-6">
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 text-sm font-extrabold uppercase tracking-wide text-foreground [&::-webkit-details-marker]:hidden">
        {title}
        <span className="flex size-9 items-center justify-center rounded-full bg-muted text-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none">
          <ChevronDown className="size-4" aria-hidden />
        </span>
      </summary>
      <div className="pb-6">{children}</div>
    </details>
  );
}

function ReadMore({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <div className={`relative overflow-hidden ${expanded ? "" : "max-h-60"}`}>
        {children}
        {!expanded && <div aria-hidden className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />}
      </div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="mt-3 text-sm font-bold text-primary hover:text-primary-hover"
      >
        {expanded ? "Réduire" : "Lire plus"}
      </button>
    </div>
  );
}

/** Description, usage, FAQ and delivery as stacked disclosure sections under the gallery. */
export function ProductInfoAccordion({ product }: { product: ProductSummary }) {
  const faq = product.faq ?? [];

  return (
    <div className="mt-5 divide-y divide-border-strong/60 rounded-3xl bg-card ring-1 ring-border-strong/60">
      <Section title="Description" defaultOpen>
        <ReadMore>
          <ProductRichText content={product.description || "Aucune description disponible pour ce produit."} className="text-sm leading-7 text-ink-muted" />
        </ReadMore>
        <dl className="mt-5 grid grid-cols-2 gap-4 rounded-2xl bg-muted/60 p-4 text-sm">
          <div>
            <dt className="text-xs font-semibold text-ink-muted">Catégorie</dt>
            <dd className="mt-0.5 font-bold text-foreground">{product.category}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-ink-muted">Format</dt>
            <dd className="mt-0.5 font-bold text-foreground">{product.size || "Voir les formats"}</dd>
          </div>
        </dl>
      </Section>

      {product.usage && (
        <Section title="Conseils d'utilisation">
          <p className="text-sm leading-7 text-ink-muted">{product.usage}</p>
        </Section>
      )}

      {faq.length > 0 && (
        <Section title="Questions fréquentes">
          <div className="divide-y divide-border/60">
            {faq.map(({ question, answer }) => (
              <details key={question} className="group/faq py-1">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-foreground [&::-webkit-details-marker]:hidden">
                  {question}
                  <span aria-hidden className="text-lg leading-none text-primary transition-transform group-open/faq:rotate-45">+</span>
                </summary>
                <p className="pb-3 text-sm leading-6 text-ink-muted">{answer}</p>
              </details>
            ))}
          </div>
        </Section>
      )}

      <Section title="Livraison et retours">
        <ul className="space-y-2 text-sm leading-6 text-ink-muted">
          <li>Livraison en {COMPANY_CONFIG.deliveryTime} dans les {COMPANY_CONFIG.coverage}.</li>
          <li>Frais de livraison : {COMPANY_CONFIG.shippingFeeTnd} DT, paiement à la livraison.</li>
          <li>Retours possibles sous 7 jours pour les produits non ouverts, dans leur emballage d&apos;origine.</li>
        </ul>
      </Section>
    </div>
  );
}
