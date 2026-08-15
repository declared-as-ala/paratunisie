"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, Bookmark, Check, Mail, RefreshCw, Share2, Sun, Moon, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { formatPrice, type ProductSummary } from "@/lib/data/products";
import {
  adjustDiagnosticBudget,
  fetchDiagnosticAlternative,
  type RoutineResult,
  type RoutineRoleItem,
} from "@/lib/api/client";

const SAVED_ROUTINES_KEY = "paratunisie-saved-routines";

const DISPLAY_LABELS: Record<string, string> = {
  "tres-seche": "Peau très sèche",
  seche: "Peau sèche",
  normale: "Peau normale",
  mixte: "Peau mixte",
  grasse: "Peau grasse",
  "je-ne-sais-pas": "Type de peau non précisé",
  normaux: "Cheveux normaux",
  secs: "Cheveux secs",
  gras: "Cheveux gras",
  mixtes: "Cheveux mixtes",
  low: "Sensibilité faible",
  medium: "Sensibilité modérée",
  high: "Sensibilité élevée",
};

const BUDGET_OPTIONS = [
  { value: "under-80", label: "Moins de 80 DT" },
  { value: "80-150", label: "80–150 DT" },
  { value: "150-250", label: "150–250 DT" },
  { value: "250-plus", label: "250 DT et plus" },
  { value: "no-preference", label: "Pas de préférence" },
];

const ALTERNATIVE_PREFERENCES: { value: "moins-cher" | "autre-marque" | "autre-texture"; label: string }[] = [
  { value: "moins-cher", label: "Moins cher" },
  { value: "autre-marque", label: "Autre marque" },
  { value: "autre-texture", label: "Autre texture" },
];

function toCartProduct(item: RoutineRoleItem): ProductSummary {
  const size = item.sizeLabel || "Standard";
  return {
    id: item.productId,
    slug: item.slug,
    brand: item.brandName,
    name: item.name,
    benefit: "",
    size,
    priceMillimes: item.priceMillimes,
    category: "",
    concerns: [],
    skinTypes: [],
    image: item.image || "/assets/product-tube.webp",
    description: "",
    benefits: [],
    usage: "",
    sizes: [{ label: size, priceMillimes: item.priceMillimes }],
    routineTime: [],
  };
}

function RoutineItemCard({
  item,
  onReplace,
}: {
  item: RoutineRoleItem;
  onReplace: (preference?: "moins-cher" | "autre-marque" | "autre-texture") => Promise<void>;
}) {
  const { addItem } = useCart();
  const [isReplacing, setIsReplacing] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  async function handleReplace(preference?: "moins-cher" | "autre-marque" | "autre-texture") {
    setIsReplacing(true);
    setShowPreferences(false);
    await onReplace(preference);
    setIsReplacing(false);
  }

  return (
    <li className="py-3.5 first:pt-0">
      <div className="flex gap-3">
        <Link
          href={`/produits/${item.slug}`}
          className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-soft-nude"
          aria-label={`Voir ${item.name}`}
        >
          <Image src={item.image || "/assets/product-tube.webp"} alt={item.name} fill sizes="64px" className="object-cover" />
        </Link>
        <div className="flex flex-1 flex-col justify-center">
          <p className="flex items-center gap-1.5 text-[0.65rem] font-semibold tracking-[0.1em] text-primary uppercase">
            {item.brandName}
            {!item.inStock && (
              <span className="rounded-full bg-danger-bg px-1.5 py-0.5 text-[0.6rem] font-bold text-danger normal-case tracking-normal">
                Rupture
              </span>
            )}
          </p>
          <Link href={`/produits/${item.slug}`} className="mt-0.5 text-sm font-medium text-ink hover:text-primary">
            {item.name}
          </Link>
          <p className="mt-1 text-xs leading-snug text-ink-muted">
            <span className="font-semibold text-ink">{item.role} — </span>
            {item.reason}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <span className="font-tabular text-sm font-semibold text-ink">{formatPrice(item.priceMillimes)}</span>
            <button
              type="button"
              onClick={() => addItem(toCartProduct(item))}
              className="flex min-h-8 items-center gap-1 text-xs font-medium text-primary hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <ShoppingBag className="size-3" aria-hidden />
              Ajouter
            </button>
            <button
              type="button"
              disabled={isReplacing}
              onClick={() => setShowPreferences((v) => !v)}
              className="flex min-h-8 items-center gap-1 text-xs font-medium text-primary hover:underline disabled:opacity-50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <RefreshCw className={`size-3 ${isReplacing ? "animate-spin" : ""}`} aria-hidden />
              Voir une alternative
            </button>
          </div>
          {showPreferences && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {ALTERNATIVE_PREFERENCES.map((pref) => (
                <button
                  key={pref.value}
                  type="button"
                  onClick={() => handleReplace(pref.value)}
                  className="rounded-full border border-border px-2.5 py-1 text-[0.6875rem] font-medium text-ink-muted hover:border-primary hover:text-primary"
                >
                  {pref.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleReplace(undefined)}
                className="rounded-full border border-border px-2.5 py-1 text-[0.6875rem] font-medium text-ink-muted hover:border-primary hover:text-primary"
              >
                Peu importe
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export function DiagnosticResult({
  sessionId,
  result,
  onRestart,
  onResultChange,
}: {
  sessionId: string;
  result: RoutineResult;
  onRestart: () => void;
  onResultChange: (next: RoutineResult) => void;
}) {
  const { addItem } = useCart();
  const [saved, setSaved] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");
  const [showBudgetPicker, setShowBudgetPicker] = useState(false);
  const [isAdjustingBudget, setIsAdjustingBudget] = useState(false);
  const [alternativeError, setAlternativeError] = useState<string | null>(null);

  const allItems = [...result.am, ...result.pm];

  async function replaceItem(
    slot: "AM" | "PM",
    index: number,
    item: RoutineRoleItem,
    preference?: "moins-cher" | "autre-marque" | "autre-texture",
  ) {
    setAlternativeError(null);
    const alternative = await fetchDiagnosticAlternative(sessionId, item.productId, item.role, preference);
    if (!alternative) {
      setAlternativeError("Nous n'avons pas trouvé d'alternative correspondante dans notre catalogue pour le moment.");
      return;
    }
    const list = slot === "AM" ? [...result.am] : [...result.pm];
    list[index] = { ...item, ...alternative };
    onResultChange(slot === "AM" ? { ...result, am: list } : { ...result, pm: list });
  }

  function addAllToCart() {
    const unique = allItems.filter((item, i, all) => all.findIndex((o) => o.productId === item.productId) === i);
    for (const item of unique) addItem(toCartProduct(item));
  }

  async function applyBudget(budget: string) {
    setIsAdjustingBudget(true);
    const next = await adjustDiagnosticBudget(sessionId, budget);
    setIsAdjustingBudget(false);
    setShowBudgetPicker(false);
    if (next) onResultChange(next);
  }

  function saveRoutine() {
    try {
      const existing = JSON.parse(localStorage.getItem(SAVED_ROUTINES_KEY) ?? "[]");
      const record = { savedAt: new Date().toISOString(), tier: result.tier, productIds: allItems.map((i) => i.productId) };
      localStorage.setItem(SAVED_ROUTINES_KEY, JSON.stringify([record, ...(Array.isArray(existing) ? existing : [])].slice(0, 10)));
      setSaved(true);
    } catch {
      // localStorage unavailable — saving is a nice-to-have, not blocking.
    }
  }

  function shareSummary() {
    const lines = [`Ma routine ${result.tier} ParaTunisie`, ...allItems.map((i) => `• ${i.name} (${i.brandName})`)];
    const text = lines.join("\n");
    const url = typeof window !== "undefined" ? window.location.origin + "/diagnostic" : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: "Ma routine ParaTunisie", text, url }).catch(() => {});
      return;
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
        setShareState("copied");
        setTimeout(() => setShareState("idle"), 2000);
      });
    }
  }

  const emailBody = encodeURIComponent(
    `Voici ma routine ${result.tier} :\n\n${allItems.map((i) => `- ${i.name} (${i.brandName}) — ${formatPrice(i.priceMillimes)}`).join("\n")}\n\nDécouvrir sur ${typeof window !== "undefined" ? window.location.origin : "paratunisie.com"}/diagnostic`,
  );

  const priorityRoles = [...new Set(allItems.map((i) => i.role))];
  const typeLabel = result.profile.skinType
    ? DISPLAY_LABELS[result.profile.skinType]
    : result.profile.hairType
      ? DISPLAY_LABELS[result.profile.hairType]
      : null;

  if (result.redFlag) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-danger-bg text-danger">
          <AlertTriangle className="size-8" />
        </div>
        <h2 className="mt-4 font-serif text-2xl font-medium text-ink">Avis médical recommandé</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          {result.referralNotice ||
            "Notre système d'analyse visuelle a identifié un signe cutané nécessitant un avis dermatologique préalable avant l'établissement d'une routine cosmétique."}
        </p>
        {result.redFlagReason && (
          <div className="mt-4 rounded-lg bg-soft-nude/60 p-3 text-xs text-ink">
            <strong>Observation :</strong> {result.redFlagReason}
          </div>
        )}
        <button
          type="button"
          onClick={onRestart}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          Recommencer le diagnostic
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="inline-flex items-center rounded-full bg-brand-champagne/25 px-3 py-1 text-xs font-semibold tracking-wide text-ink uppercase">
            Routine {result.tier}
          </span>
          <h2 className="mt-2 font-serif text-2xl font-medium text-ink sm:text-3xl">Votre routine sur mesure</h2>
        </div>
        <button
          type="button"
          onClick={onRestart}
          className="min-h-11 text-sm font-medium text-primary hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          Refaire le diagnostic
        </button>
      </div>

      {/* ── Profile summary ─────────────────────────────────────────── */}
      <div className="mt-4 rounded-xl border border-border bg-soft-nude/40 p-4">
        <p className="text-sm font-semibold text-ink">Votre profil</p>
        <p className="mt-1 text-sm text-ink-muted">
          {typeLabel && <span>{typeLabel} · </span>}
          {DISPLAY_LABELS[result.profile.sensitivity] ?? "Sensibilité modérée"}
        </p>
        {priorityRoles.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {priorityRoles.map((role) => (
              <span key={role} className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-ink border border-border">
                {role}
              </span>
            ))}
          </div>
        )}
      </div>

      {result.unfilledRoles.length > 0 && (
        <div className="mt-4 rounded-lg bg-soft-nude px-4 py-3 text-sm text-ink-muted">
          {result.unfilledRoles.join(" ")}
        </div>
      )}

      {allItems.length === 0 && (
        <div className="mt-4 rounded-lg bg-soft-nude px-4 py-3 text-sm text-ink-muted">
          Nous n&apos;avons pas trouvé suffisamment de produits correspondant exactement à vos critères. Essayez d&apos;élargir
          votre budget ou vos préférences de marque.
        </div>
      )}

      <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
        <span className="mt-0.5 shrink-0">ⓘ</span>
        Ce diagnostic propose des conseils cosmétiques personnalisés et ne constitue pas un avis médical. En cas de doute,
        consultez un professionnel de santé.
      </p>

      <div className="mt-6 grid gap-8 sm:grid-cols-2">
        {result.am.length > 0 && (
          <section aria-label="Routine du matin">
            <h3 className="flex items-center gap-2 font-serif text-lg font-medium text-ink">
              <Sun className="size-4.5 text-primary" aria-hidden />
              Matin
            </h3>
            <ul className="mt-1 divide-y divide-border">
              {result.am.map((item, index) => (
                <RoutineItemCard
                  key={`${item.productId}-${index}`}
                  item={item}
                  onReplace={(preference) => replaceItem("AM", index, item, preference)}
                />
              ))}
            </ul>
          </section>
        )}

        {result.pm.length > 0 && (
          <section aria-label="Routine du soir">
            <h3 className="flex items-center gap-2 font-serif text-lg font-medium text-ink">
              <Moon className="size-4.5 text-primary" aria-hidden />
              Soir
            </h3>
            <ul className="mt-1 divide-y divide-border">
              {result.pm.map((item, index) => (
                <RoutineItemCard
                  key={`${item.productId}-${index}`}
                  item={item}
                  onReplace={(preference) => replaceItem("PM", index, item, preference)}
                />
              ))}
            </ul>
          </section>
        )}
      </div>

      {alternativeError && <p className="mt-4 text-xs text-danger">{alternativeError}</p>}

      {allItems.length > 0 && (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3">
          <span className="text-sm text-ink-muted">
            {result.itemCount} produit{result.itemCount > 1 ? "s" : ""}
          </span>
          <span className="font-tabular text-lg font-semibold text-ink">Total : {formatPrice(result.totalMillimes)}</span>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <Button type="button" size="lg" onClick={addAllToCart} disabled={allItems.length === 0} className="min-w-56">
          Ajouter toute la routine au panier
        </Button>
        <Button type="button" variant="outline" onClick={() => setShowBudgetPicker((v) => !v)}>
          Adapter à mon budget
        </Button>
        <Button type="button" variant="outline" size="icon-lg" aria-label="Enregistrer la routine" onClick={saveRoutine}>
          {saved ? <Check className="text-success" /> : <Bookmark />}
        </Button>
        <Button type="button" variant="outline" size="icon-lg" aria-label="Partager la routine" onClick={shareSummary}>
          <Share2 />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label="Envoyer la routine par email"
          render={<a href={`mailto:?subject=${encodeURIComponent(`Ma routine ${result.tier} ParaTunisie`)}&body=${emailBody}`} />}
        >
          <Mail />
        </Button>
        {shareState === "copied" && <span className="text-xs text-ink-muted">Lien copié !</span>}
      </div>

      {showBudgetPicker && (
        <div className="mt-3 flex flex-wrap gap-2">
          {BUDGET_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={isAdjustingBudget}
              onClick={() => applyBudget(option.value)}
              className="min-h-10 rounded-full border border-border px-4 text-sm font-medium text-ink hover:border-primary hover:text-primary disabled:opacity-50"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
