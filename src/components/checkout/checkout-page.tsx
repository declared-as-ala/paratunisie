"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, CheckCircle2, ChevronDown, Lock, ShieldCheck, Truck, Wallet, AlertCircle, Loader2, ShoppingBag, Gift, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/data/products";
import { createExpressOrder } from "@/lib/api/client";
import { trackInitiateCheckout, trackPurchase } from "@/lib/meta-pixel";
import { trackBeginCheckout, trackPurchase as trackFirstPartyPurchase } from "@/lib/analytics/tracker";
import { trackGoogleAdsPurchase } from "@/lib/google-ads";
import { getCustomerSession, type CustomerSession } from "@/lib/customer-auth";
import { calculatePointsDiscountMillimes } from "@/lib/loyalty";
import { saveCheckoutDraft, markCheckoutAbandoned, getCheckoutSessionId, resetCheckoutSession } from "@/lib/checkout/abandoned-tracker";

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
  fullName: string;
  governorat: string;
  address: string;
  notes: string;
};

type FormErrors = Partial<Record<keyof CheckoutFormData, string>>;

export function CheckoutPage() {
  const cart = useCart();
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Customer session & loyalty points
  const [session, setSession] = useState<CustomerSession | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState<boolean>(false);

  useEffect(() => {
    const currentSession = getCustomerSession();
    if (currentSession?.user) {
      setSession(currentSession);
      if (currentSession.user.email && !form.email) {
        setForm((prev) => ({ ...prev, email: currentSession.user.email, fullName: currentSession.user.name || prev.fullName, phone: currentSession.user.phone || prev.phone }));
      }
      fetch(`/api/v1/loyalty/account/${currentSession.user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data.points === "number") {
            setUserPoints(data.points);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Track InitiateCheckout on checkout page mount if cart has items
  useEffect(() => {
    if (cart.items.length > 0 && !submitted) {
      const deliveryPrice = cart.hasFreeDelivery ? 0 : ARAMEX_DELIVERY_PRICE;
      const total = cart.subtotal + deliveryPrice;
      trackInitiateCheckout({
        items: cart.items.map((i) => ({
          productId: i.productId,
          name: i.name,
          quantity: i.quantity,
          priceMillimes: i.priceMillimes,
        })),
        totalTnd: total / 1000,
      });
      trackBeginCheckout(cart.itemCount, total / 1000);
    }
  }, [cart.items.length, cart.subtotal, cart.hasFreeDelivery, cart.itemCount, submitted]);

  const [form, setForm] = useState<CheckoutFormData>({
    email: "",
    phone: "",
    fullName: "",
    governorat: "",
    address: "",
    notes: "",
  });

  // Progressive draft saving as customer fills checkout form
  useEffect(() => {
    if (cart.items.length > 0 && form.phone.trim() && !submitted) {
      const deliveryPrice = cart.hasFreeDelivery ? 0 : ARAMEX_DELIVERY_PRICE;
      const totalAmount = cart.subtotal + deliveryPrice;
      saveCheckoutDraft({
        source: "CHECKOUT_PAGE",
        customerName: form.fullName,
        phone: form.phone,
        email: form.email,
        gouvernorat: form.governorat,
        fullAddress: form.address,
        deliveryNote: form.notes,
        items: cart.items.map((i) => ({
          productId: i.productId,
          name: i.name,
          image: i.image,
          variantLabel: i.sizeLabel,
          quantity: i.quantity,
          priceMillimes: i.priceMillimes,
        })),
        subtotalMillimes: cart.subtotal,
        shippingFeeMillimes: deliveryPrice,
        totalMillimes: totalAmount,
      });
    }
  }, [form.phone, form.fullName, form.email, form.governorat, form.address, form.notes, cart.items, cart.subtotal, cart.hasFreeDelivery, submitted]);

  // Handle page unload / navigate away before confirming order
  useEffect(() => {
    const handleUnload = () => {
      if (!submitted && form.phone.trim()) {
        markCheckoutAbandoned("CHECKOUT_PAGE");
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      handleUnload();
    };
  }, [submitted, form.phone]);

  const [touched, setTouched] = useState<Partial<Record<keyof CheckoutFormData, boolean>>>({});
  const [errors, setErrors] = useState<FormErrors>({});

  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const fullNameRef = useRef<HTMLInputElement>(null);
  const governoratRef = useRef<HTMLSelectElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);

  function validate(data: CheckoutFormData): FormErrors {
    const errs: FormErrors = {};

    // Email is OPTIONAL: only validate format if user entered something
    if (data.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errs.email = "Veuillez saisir une adresse email valide.";
    }

    // Phone is MANDATORY (8 digits in Tunisia)
    const cleanPhone = data.phone.replace(/\s+/g, "");
    if (!cleanPhone) {
      errs.phone = "Le numéro de téléphone est obligatoire.";
    } else if (!/^\d{8}$/.test(cleanPhone)) {
      errs.phone = "Saisissez un numéro tunisien à 8 chiffres (ex: 20 123 456).";
    }

    // Full Name is MANDATORY
    if (!data.fullName.trim()) {
      errs.fullName = "Le nom et prénom sont obligatoires.";
    }

    // Governorate is MANDATORY
    if (!data.governorat) {
      errs.governorat = "Veuillez choisir un gouvernorat.";
    }

    // Address is MANDATORY
    if (!data.address.trim()) {
      errs.address = "L'adresse complète est obligatoire.";
    }

    return errs;
  }

  function updateField(field: keyof CheckoutFormData, value: string) {
    const nextForm = { ...form, [field]: value };
    setForm(nextForm);
    if (touched[field]) {
      const fieldErrors = validate(nextForm);
      setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
    }
  }

  function handleBlur(field: keyof CheckoutFormData) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const fieldErrors = validate(form);
    setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmittingRef.current || submitting) return;
    setErrorMsg(null);

    // Mark all as touched and validate
    const allTouched = {
      email: true,
      phone: true,
      fullName: true,
      governorat: true,
      address: true,
      notes: true,
    };
    setTouched(allTouched);

    const validationErrors = validate(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      // Focus first error field
      if (validationErrors.fullName && fullNameRef.current) fullNameRef.current.focus();
      else if (validationErrors.phone && phoneRef.current) phoneRef.current.focus();
      else if (validationErrors.governorat && governoratRef.current) governoratRef.current.focus();
      else if (validationErrors.address && addressRef.current) addressRef.current.focus();
      else if (validationErrors.email && emailRef.current) emailRef.current.focus();
      return;
    }

    isSubmittingRef.current = true;
    setSubmitting(true);

    // Split fullName into firstName and lastName for API backend compatibility
    const nameParts = form.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || form.fullName.trim();
    const lastName = nameParts.slice(1).join(" ") || ".";

    // Calculate loyalty points discount
    const maxDiscountMillimes = calculatePointsDiscountMillimes(userPoints);
    const applicableDiscountMillimes = useLoyaltyPoints
      ? Math.min(cart.subtotal, maxDiscountMillimes)
      : 0;
    const pointsActuallyUsed = useLoyaltyPoints
      ? Math.floor(applicableDiscountMillimes / 1000 / 0.05)
      : 0;

    const checkoutSessionId = getCheckoutSessionId("CHECKOUT_PAGE");

    try {
      const payload = {
        userId: session?.user?.id,
        email: form.email.trim() || undefined,
        phone: form.phone,
        firstName,
        lastName,
        gouvernorat: form.governorat,
        fullAddress: form.address,
        deliveryNote: form.notes,
        checkoutSessionId,
        loyaltyPointsToRedeem: pointsActuallyUsed > 0 ? pointsActuallyUsed : undefined,
        items: cart.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          priceMillimes: i.priceMillimes,
        })),
      };

      const { order, error } = await createExpressOrder(payload);

      if (order?.id) {
        resetCheckoutSession("CHECKOUT_PAGE");
        const ref = `PT-${order.id.slice(-6).toUpperCase()}`;
        const orderTotalTnd = (order.totalMillimes || total) / 1000;
        trackPurchase({
          orderId: order.id,
          orderNumber: ref,
          totalTnd: orderTotalTnd,
          items: cart.items.map((i) => ({
            productId: i.productId,
            name: i.name,
            quantity: i.quantity,
            priceMillimes: i.priceMillimes,
          })),
        });
        trackFirstPartyPurchase(order.id, orderTotalTnd, cart.itemCount);
        trackGoogleAdsPurchase({
          orderId: order.id,
          orderNumber: ref,
          totalTnd: orderTotalTnd,
          items: cart.items.map((i) => ({
            productId: i.productId,
            name: i.name,
            quantity: i.quantity,
            priceMillimes: i.priceMillimes,
          })),
        });
        setOrderNumber(ref);
        setSubmitted(true);
        cart.clearCart();
      } else {
        isSubmittingRef.current = false;
        setErrorMsg(error || "Une erreur s'est produite lors de la validation de la commande. Veuillez réessayer.");
      }
    } catch (err: any) {
      isSubmittingRef.current = false;
      setErrorMsg("Impossible de communiquer avec le serveur. Veuillez vérifier votre connexion.");
    } finally {
      setSubmitting(false);
    }
  }

  // Loyalty calculations
  const maxPossibleDiscount = calculatePointsDiscountMillimes(userPoints);
  const loyaltyDiscountMillimes = useLoyaltyPoints
    ? Math.min(cart.subtotal, maxPossibleDiscount)
    : 0;
  const pointsRedeemed = useLoyaltyPoints
    ? Math.floor(loyaltyDiscountMillimes / 1000 / 0.05)
    : 0;

  const netSubtotal = Math.max(0, cart.subtotal - loyaltyDiscountMillimes);
  const deliveryPrice = cart.hasFreeDelivery || netSubtotal >= 99_000 ? 0 : ARAMEX_DELIVERY_PRICE;
  const total = netSubtotal + deliveryPrice;

  if (cart.items.length === 0 && !submitted) {
    return (
      <div className="flex flex-col items-center px-4 py-20 text-center min-h-[60vh] justify-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-soft-nude border border-border/60">
          <ShoppingBag className="size-9 text-ink-muted/60" aria-hidden />
        </div>
        <h1 className="mt-6 font-serif text-2xl font-bold text-ink sm:text-3xl">
          Votre panier est vide
        </h1>
        <p className="mt-2.5 max-w-xs text-xs sm:text-sm text-ink-muted leading-relaxed">
          Ajoutez des soins ou parapharmacie à votre panier avant de valider votre commande.
        </p>
        <Button size="lg" className="mt-8 rounded-xl font-bold min-w-48 shadow-xs" render={<Link href="/shop" />}>
          Découvrir le Shop
        </Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center px-4 py-20 text-center min-h-[65vh] justify-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 sm:size-20 shadow-sm">
          <CheckCircle2 className="size-9 sm:size-11" aria-hidden />
        </div>
        <h1 className="mt-6 font-serif text-2xl font-bold text-ink sm:text-3xl">
          Commande confirmée !
        </h1>
        <p className="mt-3 text-xs font-bold text-emerald-700 bg-emerald-50 py-1.5 px-4 rounded-full border border-emerald-200 inline-block">
          Référence : #{orderNumber}
        </p>
        <p className="mt-3 max-w-md text-xs sm:text-sm text-ink-muted leading-relaxed">
          Merci <strong className="text-ink">{form.fullName}</strong> ! Votre commande a bien été enregistrée. Notre service client vous contactera par téléphone pour valider l&apos;expédition.
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-ink bg-soft-nude/60 px-3.5 py-2 rounded-xl border border-border">
          <Wallet size={16} className="text-primary" />
          Paiement en espèces à la livraison
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row w-full max-w-xs sm:max-w-md">
          <Button size="lg" className="rounded-xl font-bold flex-1" render={<Link href="/" />}>
            Retour à l&apos;accueil
          </Button>
          <Button size="lg" variant="outline" className="rounded-xl font-bold flex-1" render={<Link href="/shop" />}>
            Continuer mes achats
          </Button>
        </div>
      </div>
    );
  }

  const baseInputClass =
    "h-12 w-full rounded-xl border bg-white px-3.5 text-xs sm:text-sm text-ink placeholder:text-ink-muted/40 transition-all focus:outline-none";

  return (
    <div className="mx-auto max-w-[1440px] px-3.5 sm:px-6 lg:px-8 pt-4 pb-[calc(200px+env(safe-area-inset-bottom))] lg:pb-16 overflow-x-hidden w-full max-w-full">
      {/* Compact Breadcrumb */}
      <nav aria-label="Fil d'Ariane" className="mb-3 text-[0.6875rem] sm:text-xs text-ink-muted">
        <ol className="flex items-center gap-1.5">
          <li><Link href="/" className="hover:text-primary">Accueil</Link></li>
          <li aria-hidden className="text-ink-muted/40">/</li>
          <li><Link href="/panier" className="hover:text-primary">Panier</Link></li>
          <li aria-hidden className="text-ink-muted/40">/</li>
          <li aria-current="page" className="text-ink font-semibold">Commande</li>
        </ol>
      </nav>

      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink">
          Commande
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-ink-muted">
          Finalisez votre commande — Renseignez vos coordonnées pour confirmer votre achat.
        </p>
      </div>

      {/* Mobile Expandable Order Summary */}
      <div className="mt-4 lg:hidden">
        <button
          type="button"
          onClick={() => setSummaryOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-2xl border border-border/80 bg-white p-3.5 shadow-xs transition-colors hover:border-primary/50"
        >
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="size-4 text-primary" />
            <div className="text-left">
              <span className="text-xs font-bold text-ink block">Résumé de la commande</span>
              <span className="text-[0.6875rem] text-ink-muted font-medium">
                {cart.itemCount} article{cart.itemCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-tabular text-sm sm:text-base font-extrabold text-ink">
              {formatPrice(total)}
            </span>
            <ChevronDown
              className={`size-4 text-ink-muted transition-transform duration-200 ${summaryOpen ? "rotate-180" : ""}`}
              aria-hidden
            />
          </div>
        </button>

        {summaryOpen && (
          <div className="mt-2 rounded-2xl border border-border/80 bg-white p-4 shadow-sm animate-in fade-in duration-200">
            <ul className="divide-y divide-border/60">
              {cart.items.map((item) => (
                <li key={`${item.productId}-${item.sizeLabel}`} className="flex items-center gap-3 py-2.5 first:pt-0">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-white border border-border p-1 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image || "/assets/product-tube.webp"}
                      alt={item.name}
                      className="size-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/product-tube.webp";
                      }}
                    />
                    <span className="absolute -right-1 -top-1 z-10 flex size-4.5 items-center justify-center rounded-full bg-primary text-[0.6rem] font-bold text-white shadow-xs">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.65rem] font-bold text-primary uppercase">{item.brand}</p>
                    <p className="text-xs font-semibold text-ink line-clamp-1">{item.name}</p>
                    <p className="text-[0.65rem] text-ink-muted font-medium">Format: {item.sizeLabel}</p>
                  </div>
                  <p className="font-tabular text-xs font-extrabold text-ink">
                    {formatPrice(item.priceMillimes * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1.5 border-t border-border pt-3 text-xs">
              <div className="flex justify-between text-ink-muted">
                <span>Sous-total produits</span>
                <span className="font-tabular font-bold text-ink">{formatPrice(cart.subtotal)}</span>
              </div>
              {loyaltyDiscountMillimes > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Points fidélité ({pointsRedeemed} pts)</span>
                  <span className="font-tabular">-{formatPrice(loyaltyDiscountMillimes)}</span>
                </div>
              )}
              <div className="flex justify-between text-ink-muted">
                <span>Livraison Aramex</span>
                <span className="font-tabular font-bold text-emerald-700">
                  {deliveryPrice === 0 ? "OFFERTE 🎉" : formatPrice(deliveryPrice)}
                </span>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-2 text-sm font-black text-ink">
                <span>Total à la livraison</span>
                <span className="font-tabular text-primary text-base">{formatPrice(total)}</span>
              </div>
            </dl>
          </div>
        )}
      </div>

      {/* Guest Loyalty Incentive or Logged-in Loyalty Widget */}
      {!session ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs">
          <div className="flex items-center gap-2.5">
            <Gift className="size-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-ink">Gagnez des points fidélité sur cette commande !</p>
              <p className="text-[0.6875rem] text-ink-muted mt-0.5">1 DT dépensé = 1 point (20 points = 1 DT de réduction future).</p>
            </div>
          </div>
          <Link
            href={`/compte?redirect=${encodeURIComponent("/checkout")}`}
            className="rounded-xl border border-amber-600 bg-white px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-50 shrink-0 shadow-2xs"
          >
            Se connecter
          </Link>
        </div>
      ) : userPoints > 0 ? (
        <div className="mt-4 rounded-2xl border border-amber-500/30 bg-linear-to-r from-amber-500/10 via-amber-500/5 to-white p-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Gift className="size-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-ink">
                  Vous avez <strong className="text-amber-800 font-extrabold">{userPoints} points</strong> disponibles ({(userPoints * 0.05).toFixed(3)} DT)
                </p>
                <p className="text-[0.6875rem] text-ink-muted">Utilisez vos points pour réduire le montant de votre commande.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setUseLoyaltyPoints(!useLoyaltyPoints)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-xs ${
                useLoyaltyPoints
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-amber-600 text-white hover:bg-amber-700"
              }`}
            >
              {useLoyaltyPoints ? "✓ Points appliqués (-" + formatPrice(loyaltyDiscountMillimes) + ")" : "Utiliser mes points"}
            </button>
          </div>
        </div>
      ) : null}

      {/* General Error Banner */}
      {errorMsg && (
        <div className="mt-4 flex items-center gap-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold animate-in fade-in">
          <AlertCircle className="size-4 shrink-0 text-rose-600" />
          <div>
            <p className="font-bold">Nous n'avons pas pu confirmer votre commande.</p>
            <p className="text-[0.6875rem] text-rose-700 font-normal">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Main Checkout Grid Form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-5 grid grid-cols-1 gap-6 lg:mt-8 lg:grid-cols-[1fr_400px] lg:gap-10"
      >
        <div className="space-y-5">
          {/* Section 1: Coordonnées */}
          <div className="rounded-2xl border border-border/80 bg-white p-4 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/60">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">1</span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-ink">Coordonnées</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="checkout-fullname" className="block text-xs sm:text-sm font-semibold text-ink mb-1">
                  Nom et prénom <span className="text-primary">*</span>
                </label>
                <input
                  ref={fullNameRef}
                  id="checkout-fullname"
                  type="text"
                  required
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  onBlur={() => handleBlur("fullName")}
                  placeholder="Ex: Mohamed Ben Ali"
                  className={`${baseInputClass} ${
                    touched.fullName && errors.fullName
                      ? "border-rose-500 focus:ring-2 focus:ring-rose-200"
                      : "border-border focus:border-primary focus:ring-2 focus:ring-primary/10"
                  }`}
                />
                {touched.fullName && errors.fullName && (
                  <p className="mt-1 text-[0.6875rem] font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.fullName}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="checkout-phone" className="block text-xs sm:text-sm font-semibold text-ink mb-1">
                  Téléphone (Tunisie) <span className="text-primary">*</span>
                </label>
                <div className="flex items-center rounded-xl border border-border overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                  <span className="px-3 py-3 bg-soft-nude/70 text-xs font-bold text-ink border-r border-border shrink-0 select-none">
                    🇹🇳 +216
                  </span>
                  <input
                    ref={phoneRef}
                    id="checkout-phone"
                    type="tel"
                    inputMode="tel"
                    required
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    onBlur={() => handleBlur("phone")}
                    placeholder="20 123 456"
                    className="h-12 w-full bg-white px-3 text-xs sm:text-sm text-ink placeholder:text-ink-muted/40 focus:outline-none"
                  />
                </div>
                {touched.phone && errors.phone && (
                  <p className="mt-1 text-[0.6875rem] font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.phone}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="checkout-email" className="block text-xs sm:text-sm font-semibold text-ink mb-1">
                  Adresse email <span className="text-ink-muted font-normal">(Optionnel)</span>
                </label>
                <input
                  ref={emailRef}
                  id="checkout-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  placeholder="votre.email@domaine.com (optionnel)"
                  className={`${baseInputClass} ${
                    touched.email && errors.email
                      ? "border-rose-500 focus:ring-2 focus:ring-rose-200"
                      : "border-border focus:border-primary focus:ring-2 focus:ring-primary/10"
                  }`}
                />
                {touched.email && errors.email && (
                  <p className="mt-1 text-[0.6875rem] font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Informations de livraison */}
          <div className="rounded-2xl border border-border/80 bg-white p-4 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/60">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">2</span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-ink">Adresse de livraison</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="checkout-governorate" className="block text-xs sm:text-sm font-semibold text-ink mb-1">
                  Gouvernorat <span className="text-primary">*</span>
                </label>
                <select
                  ref={governoratRef}
                  id="checkout-governorate"
                  required
                  value={form.governorat}
                  onChange={(e) => updateField("governorat", e.target.value)}
                  onBlur={() => handleBlur("governorat")}
                  className={`${baseInputClass} ${
                    touched.governorat && errors.governorat
                      ? "border-rose-500 focus:ring-2 focus:ring-rose-200"
                      : "border-border focus:border-primary focus:ring-2 focus:ring-primary/10"
                  }`}
                >
                  <option value="">Sélectionner un gouvernorat</option>
                  {GOUVERNORATS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                {touched.governorat && errors.governorat && (
                  <p className="mt-1 text-[0.6875rem] font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.governorat}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="checkout-address" className="block text-xs sm:text-sm font-semibold text-ink mb-1">
                  Adresse complète <span className="text-primary">*</span>
                </label>
                <input
                  ref={addressRef}
                  id="checkout-address"
                  type="text"
                  required
                  autoComplete="street-address"
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  onBlur={() => handleBlur("address")}
                  placeholder="Rue, numéro d'immeuble, appartement, résidence..."
                  className={`${baseInputClass} ${
                    touched.address && errors.address
                      ? "border-rose-500 focus:ring-2 focus:ring-rose-200"
                      : "border-border focus:border-primary focus:ring-2 focus:ring-primary/10"
                  }`}
                />
                {touched.address && errors.address && (
                  <p className="mt-1 text-[0.6875rem] font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.address}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Mode de livraison et notes */}
          <div className="rounded-2xl border border-border/80 bg-white p-4 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/60">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">3</span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-ink">Livraison & Paiement</h2>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border bg-soft-nude/30 p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Truck size={18} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-ink">Livraison à domicile Aramex</p>
                  <p className="text-[0.6875rem] text-ink-muted font-medium">Expédition express 24–48h partout en Tunisie</p>
                </div>
              </div>
              <p className="font-tabular text-xs sm:text-sm font-extrabold text-ink">
                {deliveryPrice === 0 ? <span className="text-emerald-700">OFFERTE 🎉</span> : formatPrice(deliveryPrice)}
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-50/50 p-3.5 text-xs text-ink font-semibold">
              <Wallet className="size-4 shrink-0 text-emerald-600" />
              <span>Paiement en espèces à la livraison disponible (COD)</span>
            </div>

            <div>
              <label htmlFor="checkout-notes" className="block text-xs sm:text-sm font-semibold text-ink mb-1">
                Note de livraison <span className="text-ink-muted font-normal">(optionnel)</span>
              </label>
              <textarea
                id="checkout-notes"
                rows={2}
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Instructions spéciales pour le livreur (ex: sonner à l'interphone B2)..."
                className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-xs sm:text-sm text-ink placeholder:text-ink-muted/40 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Desktop Order Summary Sidebar */}
        <aside className="hidden lg:block lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-border/80 bg-white p-6 shadow-xs">
            <h2 className="font-serif text-lg font-bold text-ink pb-3 border-b border-border/60">Résumé de votre commande</h2>

            <ul className="mt-3 divide-y divide-border/60 max-h-[300px] overflow-y-auto pr-1">
              {cart.items.map((item) => (
                <li key={`${item.productId}-${item.sizeLabel}`} className="flex gap-3 py-3 first:pt-0">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-white border border-border p-1 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image || "/assets/product-tube.webp"}
                      alt={item.name}
                      className="size-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/product-tube.webp";
                      }}
                    />
                    <span className="absolute -right-1 -top-1 z-10 flex size-4.5 items-center justify-center rounded-full bg-primary text-[0.6rem] font-bold text-white shadow-xs">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col justify-center min-w-0">
                    <p className="text-[0.65rem] font-bold text-primary uppercase">{item.brand}</p>
                    <p className="text-xs font-semibold text-ink line-clamp-1">{item.name}</p>
                    <p className="text-[0.65rem] text-ink-muted font-medium">{item.sizeLabel}</p>
                  </div>
                  <p className="font-tabular text-xs font-extrabold text-ink">
                    {formatPrice(item.priceMillimes * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2 border-t border-border pt-4 text-xs">
              <div className="flex justify-between text-ink-muted">
                <span>Sous-total</span>
                <span className="font-tabular font-bold text-ink">{formatPrice(cart.subtotal)}</span>
              </div>
              {loyaltyDiscountMillimes > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Points fidélité ({pointsRedeemed} pts)</span>
                  <span className="font-tabular">-{formatPrice(loyaltyDiscountMillimes)}</span>
                </div>
              )}
              <div className="flex justify-between text-ink-muted">
                <span>Livraison Aramex</span>
                <span className="font-tabular font-bold text-ink">
                  {deliveryPrice === 0 ? <span className="text-emerald-700 font-bold">OFFERTE 🎉</span> : formatPrice(deliveryPrice)}
                </span>
              </div>
              <div className="border-t border-border/80 pt-3">
                <div className="flex justify-between">
                  <dt className="font-bold text-ink text-sm">Total à payer</dt>
                  <dd className="font-tabular text-lg font-black text-primary">{formatPrice(total)}</dd>
                </div>
              </div>
            </dl>

            {/* Loyalty points to earn on this order */}
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-[0.6875rem] text-ink">
              <Sparkles className="size-4 text-amber-600 shrink-0" />
              <span>
                Cette commande vous rapporte <strong className="text-amber-800">{Math.floor(netSubtotal / 1000)} points</strong> fidélité !
              </span>
            </div>

            <div className="mt-4 rounded-xl bg-soft-nude/60 p-3 space-y-1 text-[0.6875rem] text-ink-muted font-medium">
              <div className="flex items-center gap-1.5 text-ink font-semibold">
                <ShieldCheck size={14} className="text-primary" />
                <span>Commande 100% sécurisée</span>
              </div>
              <p>💵 Paiement en espèces à la livraison. Pas besoin de carte bancaire.</p>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="mt-5 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 text-sm shadow-md transition-all active:scale-[0.98]"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" /> Confirmation en cours...
                </>
              ) : (
                "Confirmer la commande"
              )}
            </Button>
            <p className="mt-2 text-center text-[0.625rem] text-ink-muted">
              En confirmant, vous acceptez nos conditions générales de vente.
            </p>
          </div>
        </aside>

        {/* Mobile Sticky Confirmation Bar — Positioned ABOVE Mobile Navigation Bar */}
        <div className="fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-40 border-t border-border/80 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[0.65rem] text-ink-muted font-medium">Total à payer</p>
              <p className="font-tabular text-base sm:text-lg font-black leading-tight text-primary">
                {formatPrice(total)}
              </p>
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl px-5 h-11 text-xs sm:text-sm shadow-sm gap-1.5"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Confirmation...
                </>
              ) : (
                "Confirmer la commande"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
