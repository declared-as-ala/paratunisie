"use client";

import { Check, Leaf } from "lucide-react";
import { useEffect, useState } from "react";

import { fetchBrands, type DiagnosticQuestion } from "@/lib/api/client";

function OptionCard({
  selected,
  onClick,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex min-h-14 w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none ${
        selected ? "border-primary bg-brand-blush/25" : "border-border hover:border-primary/50"
      }`}
    >
      <span>
        <span className="block text-sm font-medium text-ink">{title}</span>
        {description && <span className="block text-xs text-ink-muted">{description}</span>}
      </span>
      <span
        className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          selected ? "border-primary bg-primary" : "border-border"
        }`}
      >
        <Check
          className={`size-3 text-primary-foreground transition-opacity duration-150 ${selected ? "opacity-100" : "opacity-0"}`}
          aria-hidden
        />
      </span>
    </button>
  );
}

function Pill({ selected, onClick, label }: { selected: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`min-h-11 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none ${
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-ink hover:border-primary hover:text-primary"
      }`}
    >
      {label}
    </button>
  );
}

/**
 * One data-driven renderer for every real DiagnosticQuestion (from
 * GET /diagnostic/config) — no per-question component to maintain when
 * admin edits/adds/reorders questions (CLAUDE.md §47/§48). Two special
 * cases only: "brandPreference" pulls the live real brand catalogue
 * instead of any seeded snapshot, and "pregnancy" shows the safe-referral
 * notice rather than any ingredient-safety claim.
 */
export function StepQuestion({
  question,
  value,
  onChange,
}: {
  question: DiagnosticQuestion;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const isMulti = question.type === "multi";
  const selectedValues = isMulti ? (Array.isArray(value) ? (value as string[]) : []) : undefined;
  const selectedValue = !isMulti ? (typeof value === "string" ? value : undefined) : undefined;

  function toggleMulti(optionValue: string) {
    const current = selectedValues ?? [];
    onChange(current.includes(optionValue) ? current.filter((v) => v !== optionValue) : [...current, optionValue]);
  }

  const isBrandPreference = question.key === "brandPreference";
  const [liveBrands, setLiveBrands] = useState<{ name: string; slug: string }[]>([]);

  useEffect(() => {
    if (!isBrandPreference) return;
    let cancelled = false;
    fetchBrands().then((brands) => {
      if (!cancelled) setLiveBrands(brands);
    });
    return () => {
      cancelled = true;
    };
  }, [isBrandPreference]);

  const options = isBrandPreference
    ? liveBrands.map((b) => ({ id: b.slug, value: b.slug, label: b.name, position: 0 }))
    : question.options;

  return (
    <div>
      <h2 className="font-serif text-xl font-medium text-ink sm:text-2xl">{question.label}</h2>
      {!question.required && <p className="mt-1.5 text-sm text-ink-muted">Facultatif — vous pouvez passer cette question.</p>}

      {isBrandPreference && liveBrands.length === 0 ? (
        <p className="mt-5 text-sm text-ink-muted">Chargement des marques…</p>
      ) : isMulti ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {options.map((option) => (
            <Pill
              key={option.id}
              selected={(selectedValues ?? []).includes(option.value)}
              onClick={() => toggleMulti(option.value)}
              label={option.label}
            />
          ))}
        </div>
      ) : (
        <div role="radiogroup" aria-label={question.label} className="mt-5 space-y-2.5">
          {options.map((option) => (
            <OptionCard
              key={option.id}
              selected={selectedValue === option.value}
              onClick={() => onChange(option.value)}
              title={option.label}
            />
          ))}
        </div>
      )}

      {question.key === "pregnancy" && selectedValue === "oui" && (
        <p className="mt-5 flex items-start gap-2 rounded-xl border border-border bg-brand-blush/20 p-3.5 text-xs leading-5 text-ink-muted">
          <Leaf className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
          Pour certains actifs cosmétiques ou compléments, demandez conseil à un professionnel de santé.
        </p>
      )}

      {question.key === "routineComplexity" && (
        <p className="mt-5 flex items-center gap-2 text-xs text-ink-muted">
          <Leaf className="size-3.5 shrink-0 text-primary" aria-hidden />
          Ce diagnostic propose des conseils cosmétiques et ne remplace pas un avis médical.
        </p>
      )}
    </div>
  );
}
