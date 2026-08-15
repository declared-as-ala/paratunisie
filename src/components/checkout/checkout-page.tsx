"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, ChevronDown, Wallet } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/data/products";
import { createExpressOrder } from "@/lib/api/client";

const GOUVERNORATS = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa",
  "Jendouba", "Kairouan", "Kasserine", "Kébili", "Kef", "Mahdia",
  "Manouba", "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid",
  "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan",
] as const;

const ARAMEX_DELIVERY_PRICE = 10_000; // 10 DT in millimes

type CheckoutFormData = {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  governorat: string;
  address: string;
  notes: string;
};

export function CheckoutPage() {
  const cart = useCart();
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState<CheckoutFormData>({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    governorat: "",
    address: "",
    notes: "",
  });

  function updateField(field: keyof CheckoutFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("[CHECKOUT FORM SUBMIT] Initiated by user:", form);
    console.log("[CHECKOUT FORM SUBMIT] Cart items:", cart.items);

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        email: form.email,
        phone: form.phone,
        firstName: form.firstName,
        lastName: form.lastName,
        gouvernorat: form.governorat,
        fullAddress: form.address,
        deliveryNote: form.notes,
        items: cart.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          priceMillimes: i.priceMillimes,
        })),
      };
      console.log("[CHECKOUT FORM SUBMIT] Payload sent to createExpressOrder:", payload);

      const { order, error } = await createExpressOrder(payload);
      console.log("[CHECKOUT FORM SUBMIT] Response received from createExpressOrder:", order, error);

      if (order?.id) {
        const ref = `PT-${order.id.slice(-6).toUpperCase()}`;
        console.log("[CHECKOUT FORM SUBMIT] Order created successfully! Ref:", ref);
        setOrderNumber(ref);
        setSubmitted(true);
        cart.clearCart();
      } else {
        console.error("[CHECKOUT FORM SUBMIT] createExpressOrder failed:", error);
        setErrorMsg(error || "Une erreur s'est produite lors de la validation de la commande. Veuillez réessayer.");
      }
    } catch (err: any) {
      console.error("[CHECKOUT FORM SUBMIT] Exception caught during handleSubmit:", err);
      setErrorMsg("Impossible de communiquer avec le serveur de commande.");
    } finally {
      setSubmitting(false);
    }
  }

  const deliveryPrice = cart.hasFreeDelivery ? 0 : ARAMEX_DELIVERY_PRICE;
  const total = cart.subtotal + deliveryPrice;

  if (cart.items.length === 0 && !submitted) {
    return (
      <div className="flex flex-col items-center px-4 py-20 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-soft-nude">
          <Wallet className="size-9 text-ink-muted/40" aria-hidden />
        </div>
        <h1 className="mt-6 font-serif text-2xl font-medium text-ink sm:text-3xl">
          Votre panier est vide
        </h1>
        <p className="mt-3 max-w-xs text-sm text-ink-muted">
          Ajoutez des produits à votre panier avant de passer commande.
        </p>
        <Button size="lg" className="mt-8 min-w-44" render={<Link href="/shop" />}>
          Voir le Shop
        </Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center px-4 py-20 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-success-bg sm:size-20">
          <BadgeCheck className="size-8 text-success sm:size-10" aria-hidden />
        </div>
        <h1 className="mt-6 font-serif text-2xl font-medium text-ink sm:text-3xl">
          Commande confirmée
        </h1>
        <p className="mt-4 max-w-sm text-sm text-ink-muted">
          Merci ! Votre commande <strong className="text-ink">#{orderNumber}</strong> a bien été enregistrée.
        </p>
        <p className="mt-1.5 max-w-sm text-sm text-ink-muted">
          Vous recevrez un appel de confirmation sous peu. Le paiement s&apos;effectue à la livraison.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" render={<Link href="/" />}>Retour à l&apos;accueil</Button>
          <Button size="lg" variant="outline" render={<Link href="/shop" />}>Continuer mes achats</Button>
        </div>
      </div>
    );
  }

  const inputClass = "mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-ink placeholder:text-ink-muted/50 transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none aria-invalid:border-destructive sm:h-11";

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-8 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pt-12">
      {/* Breadcrumb */}
      <nav aria-label="Fil d'Ariane" className="mb-4 text-xs text-ink-muted sm:mb-6 sm:text-sm">
        <ol className="flex items-center gap-1.5 sm:gap-2">
          <li><Link href="/" className="hover:text-primary">Accueil</Link></li>
          <li aria-hidden className="text-ink-muted/50">/</li>
          <li><Link href="/panier" className="hover:text-primary">Panier</Link></li>
          <li aria-hidden className="text-ink-muted/50">/</li>
          <li aria-current="page" className="text-ink">Commande</li>
        </ol>
      </nav>

      <h1 className="font-serif text-2xl font-medium tracking-tight text-ink sm:text-3xl lg:text-4xl">
        Informations de commande
      </h1>

      {/* Mobile compact summary — collapsible */}
      <button
        type="button"
        onClick={() => setSummaryOpen((o) => !o)}
        className="mt-4 flex w-full items-center justify-between rounded-xl border border-border bg-surface-alt px-4 py-3 lg:hidden"
      >
        <div className="flex items-center gap-3">
          <span className="font-tabular text-lg font-semibold text-ink">{formatPrice(total)}</span>
          <span className="text-xs text-ink-muted">
            {cart.itemCount} article{cart.itemCount === 1 ? "" : "s"}
          </span>
        </div>
        <ChevronDown
          className={`size-4 text-ink-muted transition-transform duration-200 ease-out ${summaryOpen ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {summaryOpen && (
        <div className="mt-2 rounded-xl border border-border bg-surface-alt px-4 py-3 lg:hidden">
          <ul className="divide-y divide-border/60">
            {cart.items.map((item) => (
              <li key={`${item.productId}-${item.sizeLabel}`} className="flex items-center gap-3 py-2.5 first:pt-0">
                <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-white border border-border flex items-center justify-center p-0.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image || "/assets/product-tube.webp"}
                    alt={item.name}
                    className="size-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/product-tube.webp";
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-ink line-clamp-1">{item.name}</p>
                  <p className="text-[0.65rem] text-ink-muted">×{item.quantity}</p>
                </div>
                <p className="font-tabular text-xs font-semibold text-ink">
                  {formatPrice(item.priceMillimes * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <dl className="mt-2 space-y-1 border-t border-border pt-2">
            <div className="flex justify-between text-xs">
              <dt className="text-ink-muted">Livraison</dt>
              <dd className="font-tabular text-ink">
                {deliveryPrice === 0 ? <span className="text-success">Offerte</span> : formatPrice(deliveryPrice)}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {errorMsg && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[1fr_380px] lg:gap-8"
      >
        <div className="space-y-5 sm:space-y-6">
          {/* Contact */}
          <fieldset>
            <legend className="font-serif text-base font-medium text-ink sm:text-lg">
              Coordonnées
            </legend>
            <div className="mt-3 grid gap-3 sm:mt-4 sm:gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="checkout-email" className="text-xs font-medium text-ink sm:text-sm">
                  Email <span className="text-destructive" aria-hidden>*</span>
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="votre@email.com"
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="checkout-phone" className="text-xs font-medium text-ink sm:text-sm">
                  Téléphone <span className="text-destructive" aria-hidden>*</span>
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="XX XXX XXX"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="checkout-firstname" className="text-xs font-medium text-ink sm:text-sm">
                  Prénom <span className="text-destructive" aria-hidden>*</span>
                </label>
                <input
                  id="checkout-firstname"
                  type="text"
                  required
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="checkout-lastname" className="text-xs font-medium text-ink sm:text-sm">
                  Nom <span className="text-destructive" aria-hidden>*</span>
                </label>
                <input
                  id="checkout-lastname"
                  type="text"
                  required
                  autoComplete="family-name"
                  value={form.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </fieldset>

          {/* Address — simplified: Gouvernorat + Adresse only */}
          <fieldset>
            <legend className="font-serif text-base font-medium text-ink sm:text-lg">
              Adresse de livraison
            </legend>
            <div className="mt-3 grid gap-3 sm:mt-4 sm:gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="checkout-governorate" className="text-xs font-medium text-ink sm:text-sm">
                  Gouvernorat <span className="text-destructive" aria-hidden>*</span>
                </label>
                <select
                  id="checkout-governorate"
                  required
                  value={form.governorat}
                  onChange={(e) => updateField("governorat", e.target.value)}
                  className={inputClass}
                >
                  <option value="">Sélectionner</option>
                  {GOUVERNORATS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="checkout-address" className="text-xs font-medium text-ink sm:text-sm">
                  Adresse complète <span className="text-destructive" aria-hidden>*</span>
                </label>
                <input
                  id="checkout-address"
                  type="text"
                  required
                  autoComplete="street-address"
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Rue, numéro, immeuble, code postal, localité"
                  className={inputClass}
                />
              </div>
            </div>
          </fieldset>

          {/* Delivery */}
          <div>
            <p className="font-serif text-base font-medium text-ink sm:text-lg">
              Livraison
            </p>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-surface-alt p-3 sm:mt-4 sm:p-4">
              <div>
                <p className="text-sm font-medium text-ink">Aramex</p>
                <p className="text-xs text-ink-muted">3–5 jours ouvrables</p>
              </div>
              <p className="font-tabular text-sm font-semibold text-ink">
                {cart.hasFreeDelivery ? (
                  <span className="text-success">Offerte</span>
                ) : (
                  formatPrice(ARAMEX_DELIVERY_PRICE)
                )}
              </p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="checkout-notes" className="text-xs font-medium text-ink sm:text-sm">
              Notes de livraison <span className="text-ink-muted">(optionnel)</span>
            </label>
            <textarea
              id="checkout-notes"
              rows={2}
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Instructions spéciales..."
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
            />
          </div>
        </div>

        {/* Order summary sidebar — desktop */}
        <aside className="hidden lg:sticky lg:top-32 lg:block lg:self-start">
          <div className="rounded-xl border border-border bg-surface-alt p-5">
            <h2 className="font-serif text-lg font-medium text-ink">Votre commande</h2>

            <ul className="mt-3 divide-y divide-border/60">
              {cart.items.map((item) => (
                <li key={`${item.productId}-${item.sizeLabel}`} className="flex gap-3 py-2.5 first:pt-0">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-white border border-border flex items-center justify-center p-0.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image || "/assets/product-tube.webp"}
                      alt={item.name}
                      className="size-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/product-tube.webp";
                      }}
                    />
                    <span className="absolute -right-1 -top-1 z-10 flex size-4.5 items-center justify-center rounded-full bg-primary text-[0.65rem] font-bold text-white shadow-xs">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <p className="text-[0.65rem] font-semibold text-primary uppercase">{item.brand}</p>
                    <p className="text-xs text-ink line-clamp-1">{item.name}</p>
                    <p className="text-[0.65rem] text-ink-muted">{item.sizeLabel}</p>
                  </div>
                  <p className="font-tabular text-xs font-semibold text-ink">
                    {formatPrice(item.priceMillimes * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="mt-3 space-y-2 border-t border-border pt-3">
              <div className="flex justify-between text-sm">
                <dt className="text-ink-muted">Sous-total</dt>
                <dd className="font-tabular font-semibold text-ink">{formatPrice(cart.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-sm">
              <dt className="text-ink-muted">Livraison Aramex</dt>
                <dd className="font-tabular text-ink">
                  {deliveryPrice === 0 ? (
                    <span className="text-success">Offerte</span>
                  ) : (
                    formatPrice(deliveryPrice)
                  )}
                </dd>
              </div>
              <div className="border-t border-border pt-2">
                <div className="flex justify-between">
                  <dt className="font-medium text-ink">Total</dt>
                  <dd className="font-tabular text-lg font-semibold text-ink">{formatPrice(total)}</dd>
                </div>
              </div>
            </dl>

            <div className="mt-3 rounded-lg bg-soft-nude px-3 py-2.5">
              <div className="flex items-center gap-2 text-xs text-ink sm:text-sm">
                <Wallet className="size-3.5 shrink-0 text-primary sm:size-4" aria-hidden />
                <span>Paiement à la livraison</span>
              </div>
            </div>

            <Button type="submit" size="lg" disabled={submitting} className="mt-4 w-full">
              {submitting ? "Validation en cours..." : "Confirmer la commande"}
            </Button>
            <p className="mt-2.5 text-center text-[0.65rem] text-ink-muted">
              En confirmant, vous acceptez nos conditions générales de vente.
            </p>
          </div>
        </aside>

        {/* Mobile sticky submit bar */}
        <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 border-t border-border bg-surface-alt/95 px-4 py-3 backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-xl items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[0.65rem] text-ink-muted">Total</p>
              <p className="font-tabular text-lg font-semibold leading-tight text-ink">
                {formatPrice(total)}
              </p>
            </div>
            <Button type="submit" size="lg" disabled={submitting} className="shrink-0 px-5">
              {submitting ? "Validation..." : "Confirmer"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
