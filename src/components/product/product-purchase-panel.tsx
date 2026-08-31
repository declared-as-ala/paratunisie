"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { BadgeCheck, Check, Heart, Minus, Plus, Truck, Wallet, Zap, X, ShoppingBag, Loader2, CheckCircle2, AlertCircle, Gift, Star, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { formatPrice, type ProductSummary } from "@/lib/data/products";
import { createExpressOrder, type ProductRating } from "@/lib/api/client";
import { trackViewContent, trackInitiateCheckout, trackPurchase } from "@/lib/meta-pixel";
import { trackProductView, trackAddToCart, trackPurchase as trackFirstPartyPurchase } from "@/lib/analytics/tracker";
import { trackGoogleAdsPurchase } from "@/lib/google-ads";
import { calculatePointsEarned } from "@/lib/loyalty";
import { getCustomerSession } from "@/lib/customer-auth";
import { DemanderModal } from "@/components/product/demander-modal";
import { saveCheckoutDraft, saveCheckoutDraftImmediate, markCheckoutAbandoned, getCheckoutSessionId, resetCheckoutSession } from "@/lib/checkout/abandoned-tracker";

const reassurance = [
  { icon: BadgeCheck, label: "Produit authentique" },
  { icon: Truck, label: "Livraison partout en Tunisie" },
  { icon: Wallet, label: "Paiement à la livraison disponible" },
] as const;

const GOUVERNORATS_TUNISIE = [
  "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Bizerte", "Sousse", "Monastir", "Mahdia",
  "Sfax", "Kairouan", "Kasserine", "Sidi Bouzid", "Gabès", "Medenine", "Tataouine", "Gafsa", "Tozeur",
  "Kebili", "Béja", "Jendouba", "Le Kef", "Siliana", "Zaghouan"
];

export function ProductPurchasePanel({ product, rating }: { product: ProductSummary; rating?: ProductRating }) {
  const defaultIndex = Math.max(
    0,
    product.sizes.findIndex((size) => size.label === product.size),
  );
  const [sizeIndex, setSizeIndex] = useState(defaultIndex);
  const [quantity, setQuantity] = useState(1);
  const [saved, setSaved] = useState(false);
  const [quickOrderOpen, setQuickOrderOpen] = useState(false);
  const [demanderOpen, setDemanderOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [orderSuccess, setOrderSuccess] = useState<{ id: string; name: string; phone: string } | null>(null);

  // Track ViewContent on product load
  useEffect(() => {
    trackViewContent(product);
    trackProductView(product);
  }, [product]);

  // IntersectionObserver State for Mobile Sticky Bar (only visible when inline buttons scroll out of view)
  const inlineBuyRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const element = inlineBuyRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [gouvernorat, setGouvernorat] = useState("Tunis");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  const { addItem, isInCart } = useCart();

  const selected = product.sizes[sizeIndex];
  const added = isInCart(product.id, selected.label);

  const handleAdd = useCallback(() => {
    addItem(product, selected.label, quantity);
    trackAddToCart({
      id: product.id,
      name: product.name,
      priceMillimes: selected.priceMillimes,
      quantity,
    });
  }, [addItem, product, selected.label, selected.priceMillimes, quantity]);

  const subtotalMillimes = selected.priceMillimes * quantity;
  const deliveryFeeMillimes = subtotalMillimes >= 99_000 ? 0 : 10_000;
  const totalMillimes = subtotalMillimes + deliveryFeeMillimes;

  const handleOpenQuickOrder = useCallback(() => {
    setQuickOrderOpen(true);
    trackInitiateCheckout({
      items: [
        {
          productId: product.id,
          name: product.name,
          quantity,
          priceMillimes: selected.priceMillimes,
        },
      ],
      totalTnd: totalMillimes / 1000,
    });
  }, [product.id, product.name, quantity, selected.priceMillimes, totalMillimes]);

  // Progressive draft saving as customer types
  useEffect(() => {
    if (quickOrderOpen && (phone.trim() || fullName.trim() || address.trim() || note.trim())) {
      saveCheckoutDraft({
        source: "BUY_NOW_MODAL",
        customerName: fullName,
        phone,
        gouvernorat,
        fullAddress: address,
        deliveryNote: note,
        items: [
          {
            productId: product.id,
            name: product.name,
            image: product.image,
            variantLabel: selected.label,
            quantity,
            priceMillimes: selected.priceMillimes,
          },
        ],
        subtotalMillimes,
        shippingFeeMillimes: deliveryFeeMillimes,
        totalMillimes,
      });
    }
  }, [quickOrderOpen, phone, fullName, gouvernorat, address, note, product.id, product.name, product.image, selected.label, selected.priceMillimes, quantity, subtotalMillimes, deliveryFeeMillimes, totalMillimes]);

  const handleCloseQuickOrder = useCallback(() => {
    if (!orderSuccess && (phone.trim() || fullName.trim() || address.trim())) {
      saveCheckoutDraftImmediate(
        {
          source: "BUY_NOW_MODAL",
          customerName: fullName,
          phone,
          gouvernorat,
          fullAddress: address,
          deliveryNote: note,
          items: [
            {
              productId: product.id,
              name: product.name,
              image: product.image,
              variantLabel: selected.label,
              quantity,
              priceMillimes: selected.priceMillimes,
            },
          ],
          subtotalMillimes,
          shippingFeeMillimes: deliveryFeeMillimes,
          totalMillimes,
        },
        "ABANDONED"
      );
    }
    setQuickOrderOpen(false);
    setOrderSuccess(null);
    setErrorMsg("");
  }, [orderSuccess, phone, fullName, gouvernorat, address, note, product.id, product.name, product.image, selected.label, selected.priceMillimes, quantity, subtotalMillimes, deliveryFeeMillimes, totalMillimes]);

  const handleQuickOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || submitting) return;
    setErrorMsg("");

    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setErrorMsg("Veuillez remplir tous les champs obligatoires (*)");
      return;
    }

    isSubmittingRef.current = true;
    setSubmitting(true);

    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || fullName.trim();
    const lastName = nameParts.slice(1).join(" ") || "";

    const session = getCustomerSession();
    const checkoutSessionId = getCheckoutSessionId("BUY_NOW_MODAL");

    try {
      const { order, error } = await createExpressOrder({
        userId: session?.user?.id,
        email: session?.user?.email,
        firstName,
        lastName,
        phone: phone.trim(),
        gouvernorat,
        fullAddress: address.trim(),
        deliveryNote: note.trim() || undefined,
        checkoutSessionId,
        items: [
          {
            productId: product.id,
            quantity,
            priceMillimes: selected.priceMillimes,
          },
        ],
      });

      if (order?.id) {
        resetCheckoutSession("BUY_NOW_MODAL");
        const orderRef = `PT-${order.id.slice(-6).toUpperCase()}`;
        const totalTnd = (order.totalMillimes || totalMillimes) / 1000;
        trackPurchase({
          orderId: order.id,
          orderNumber: orderRef,
          totalTnd,
          items: [
            {
              productId: product.id,
              name: product.name,
              quantity,
              priceMillimes: selected.priceMillimes,
            },
          ],
        });
        trackFirstPartyPurchase(order.id, totalTnd, quantity);
        trackGoogleAdsPurchase({
          orderId: order.id,
          orderNumber: orderRef,
          totalTnd,
          items: [
            {
              productId: product.id,
              name: product.name,
              quantity,
              priceMillimes: selected.priceMillimes,
            },
          ],
        });
        setOrderSuccess({ id: orderRef, name: fullName.trim(), phone: phone.trim() });
      } else {
        isSubmittingRef.current = false;
        setErrorMsg(error || "Une erreur s'est produite lors de la validation de la commande. Veuillez réessayer.");
      }
    } catch {
      isSubmittingRef.current = false;
      setErrorMsg("Impossible de communiquer avec le serveur. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-full min-w-0">
      <Link
        href={`/marques/${product.brand.toLowerCase().replace(/\s+/g, "-")}`}
        className="text-[0.6875rem] sm:text-xs font-semibold tracking-[0.14em] text-primary uppercase hover:underline"
      >
        {product.brand}
      </Link>
      <h1 className="mt-1 sm:mt-2 font-serif text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink leading-snug">
        {product.seoH1 || product.name}
      </h1>

      {rating && rating.count > 0 && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className="flex gap-0.5 text-amber-400" aria-hidden>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`size-3.5 ${s <= Math.round(rating.average) ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"}`} />
            ))}
          </span>
          <span className="text-xs font-bold text-ink">{rating.average.toFixed(1)}</span>
          <span className="text-xs text-ink-muted">({rating.count} avis)</span>
        </div>
      )}

      <p className="mt-1.5 sm:mt-2 text-xs sm:text-base leading-relaxed text-ink-muted">{product.benefit}</p>

      {/* Stock + Delivery indicators */}
      <div className="mt-2.5 sm:mt-3 flex flex-wrap items-center gap-2">
        {product.inStock ? (
          <>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.6875rem] font-semibold border bg-emerald-500/10 border-emerald-500/20 text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              En stock
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.6875rem] font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-700">
              <Truck className="size-3" />
              Livraison 24–48h
            </span>
          </>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.6875rem] font-semibold border bg-amber-500/10 border-amber-500/20 text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Disponible sur commande
          </span>
        )}
      </div>

      <p className="font-tabular mt-3 sm:mt-5 text-xl sm:text-2xl font-bold text-ink">
        {formatPrice(selected.priceMillimes)}
      </p>

      {/* Loyalty points reward banner */}
      {product.inStock && (
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs">
          <Gift className="size-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-ink">
              🎁 Gagnez {calculatePointsEarned(selected.priceMillimes * quantity)} points avec cet achat
            </p>
            <p className="text-[0.6875rem] text-ink-muted mt-0.5">
              20 points = 1 DT de réduction sur vos prochaines commandes
            </p>
          </div>
        </div>
      )}

      {product.sizes.length > 1 && (
        <div className="mt-4 sm:mt-6">
          <p className="text-xs sm:text-sm font-medium text-ink" id="size-label">
            Format
          </p>
          <div role="radiogroup" aria-labelledby="size-label" className="mt-1.5 flex flex-wrap gap-2">
            {product.sizes.map((size, index) => (
              <button
                key={size.label}
                type="button"
                role="radio"
                aria-checked={index === sizeIndex}
                onClick={() => setSizeIndex(index)}
                className={`min-h-10 sm:min-h-11 rounded-lg border px-3 sm:px-4 text-xs sm:text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none ${
                  index === sizeIndex
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-ink hover:border-primary hover:text-primary"
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.inStock && (
        <div className="mt-4 sm:mt-6 flex items-center gap-3">
          <p className="text-xs sm:text-sm font-medium text-ink" id="quantity-label">
            Quantité
          </p>
          <div className="flex items-center rounded-lg border border-border bg-white">
            <button
              type="button"
              aria-label="Diminuer la quantité"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              className="flex size-9 sm:size-11 items-center justify-center text-ink-muted transition-transform duration-100 hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:scale-90"
            >
              <Minus className="size-3.5 sm:size-4" aria-hidden />
            </button>
            <span aria-labelledby="quantity-label" className="font-tabular w-8 text-center text-xs sm:text-sm font-bold text-ink">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Augmenter la quantité"
              onClick={() => setQuantity((current) => current + 1)}
              className="flex size-9 sm:size-11 items-center justify-center text-ink-muted transition-transform duration-100 hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:scale-90"
            >
              <Plus className="size-3.5 sm:size-4" aria-hidden />
            </button>
          </div>
        </div>
      )}

      {/* Main Flow Purchase Buttons (Observed by IntersectionObserver) */}
      <div ref={inlineBuyRef} className="mt-5 sm:mt-7 flex flex-col gap-2.5 sm:gap-3 max-w-md">
        {product.inStock ? (
          <>
            {/* 1. Ajouter au panier & Favorite */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <Button
                type="button"
                size="lg"
                variant={added ? "secondary" : "default"}
                onClick={handleAdd}
                className="flex-1 rounded-xl font-bold py-3.5 sm:py-6 text-xs sm:text-base shadow-xs h-11 sm:h-13"
              >
                {added ? <Check className="size-4 sm:size-5" /> : <ShoppingBag className="size-4 sm:size-5" />}
                {added ? "Ajouté au panier" : "Ajouter au panier"}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                aria-label={saved ? "Retirer des favoris" : "Ajouter aux favoris"}
                aria-pressed={saved}
                onClick={() => setSaved((current) => !current)}
                className="rounded-xl h-11 w-11 sm:h-13 sm:w-13 shrink-0"
              >
                <Heart className={saved ? "fill-primary text-primary" : ""} />
              </Button>
            </div>

            {/* 2. Acheter maintenant */}
            <Button
              type="button"
              size="lg"
              onClick={handleOpenQuickOrder}
              className="w-full bg-gradient-to-r from-[#d4a359] via-[#c89b3c] to-[#b88628] hover:from-[#c89b3c] hover:via-[#b88628] hover:to-[#a0741f] text-white font-extrabold rounded-xl py-3.5 sm:py-6 text-xs sm:text-base gap-2 shadow-md transition-all active:scale-[0.98] h-11 sm:h-13 border border-[#b88628]/30"
            >
              <Zap size={18} className="fill-white text-white" />
              Acheter maintenant · {formatPrice(selected.priceMillimes * quantity)}
            </Button>
          </>
        ) : (
          /* SUR COMMANDE CTA BUTTON */
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Button
              type="button"
              size="lg"
              onClick={() => setDemanderOpen(true)}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl py-3.5 sm:py-6 text-xs sm:text-base gap-2 shadow-md transition-all active:scale-[0.98] h-11 sm:h-13"
            >
              <Mail size={18} />
              Demander ce produit
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              aria-label={saved ? "Retirer des favoris" : "Ajouter aux favoris"}
              aria-pressed={saved}
              onClick={() => setSaved((current) => !current)}
              className="rounded-xl h-11 w-11 sm:h-13 sm:w-13 shrink-0"
            >
              <Heart className={saved ? "fill-primary text-primary" : ""} />
            </Button>
          </div>
        )}
      </div>

      <ul className="mt-6 sm:mt-8 space-y-2.5 sm:space-y-3 border-t border-border pt-4 sm:pt-6">
        {reassurance.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2.5 text-xs sm:text-sm text-ink">
            <Icon className="size-4 shrink-0 text-primary" aria-hidden />
            {label}
          </li>
        ))}
      </ul>

      {/* Mobile Sticky Purchase Action Bar — ONLY visible when inline buttons scroll OUT of view */}
      <div
        className={`fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-40 flex flex-col gap-1.5 border-t border-border/80 bg-white/95 p-2.5 backdrop-blur-md lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.1)] transition-all duration-300 ${
          showStickyBar
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        {product.inStock ? (
          <>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={saved ? "Retirer des favoris" : "Ajouter aux favoris"}
                aria-pressed={saved}
                onClick={() => setSaved((current) => !current)}
                className="shrink-0 rounded-xl h-10 w-10 border-border"
              >
                <Heart className={saved ? "fill-primary text-primary size-4" : "size-4"} />
              </Button>
              <Button
                type="button"
                size="lg"
                variant={added ? "secondary" : "default"}
                onClick={handleAdd}
                className="flex-1 text-xs font-bold rounded-xl h-10 gap-1.5"
              >
                {added ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
                {added ? "Ajouté" : "Ajouter au panier"}
              </Button>
            </div>
            <Button
              type="button"
              size="lg"
              onClick={handleOpenQuickOrder}
              className="w-full bg-gradient-to-r from-[#d4a359] via-[#c89b3c] to-[#b88628] hover:from-[#c89b3c] hover:via-[#b88628] hover:to-[#a0741f] text-white font-extrabold text-xs gap-1.5 rounded-xl h-10 shadow-sm"
            >
              <Zap size={14} className="fill-white text-white" />
              Acheter maintenant · {formatPrice(selected.priceMillimes * quantity)}
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={saved ? "Retirer des favoris" : "Ajouter aux favoris"}
              aria-pressed={saved}
              onClick={() => setSaved((current) => !current)}
              className="shrink-0 rounded-xl h-10 w-10 border-border"
            >
              <Heart className={saved ? "fill-primary text-primary size-4" : "size-4"} />
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={() => setDemanderOpen(true)}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl h-10 text-xs gap-1.5 shadow-sm"
            >
              <Mail size={15} />
              Demander ce produit
            </Button>
          </div>
        )}
      </div>

      {/* Demander Modal */}
      <DemanderModal
        isOpen={demanderOpen}
        onClose={() => setDemanderOpen(false)}
        product={{
          id: product.id,
          name: product.name,
          brand: product.brand,
          image: product.image,
          priceMillimes: selected.priceMillimes,
          format: selected.label,
        }}
      />

      {/* ── Express 1-Click Order Modal Form ────────────────────────────── */}
      {quickOrderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-border max-h-[90dvh] overflow-y-auto">
            <button
              type="button"
              onClick={handleCloseQuickOrder}
              className="absolute top-4 right-4 p-2 text-ink-muted hover:text-ink rounded-full hover:bg-soft-nude transition-colors"
            >
              <X size={20} />
            </button>

            {orderSuccess ? (
              <div className="py-6 text-center space-y-4">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-ink">Commande Enregistrée !</h3>
                <p className="text-xs font-bold text-emerald-700 bg-emerald-50 py-1.5 px-3 rounded-full inline-block border border-emerald-200">
                  Référence : {orderSuccess.id}
                </p>
                <p className="text-xs leading-5 text-ink-muted max-w-xs mx-auto">
                  Merci <strong>{orderSuccess.name}</strong> ! Votre commande de <strong>{product.name}</strong> a bien été enregistrée. Notre service client vous contactera au <strong>{orderSuccess.phone}</strong> pour valider l&apos;expédition.
                </p>
                <div className="pt-4 flex gap-3">
                  <Button
                    type="button"
                    className="w-full rounded-xl bg-primary text-white font-bold"
                    onClick={() => {
                      setQuickOrderOpen(false);
                      setOrderSuccess(null);
                      setErrorMsg("");
                    }}
                  >
                    Continuer mes achats
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleQuickOrderSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Zap size={20} className="text-[#c89b3c] fill-[#c89b3c]" />
                    <h3 className="text-xl font-serif font-bold text-ink">Commande Rapide 1-Clic</h3>
                  </div>
                  <p className="text-xs text-ink-muted mt-1">
                    Paiement en espèces à la livraison. Pas besoin de création de compte !
                  </p>
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
                    <AlertCircle size={16} className="shrink-0" />
                    {errorMsg}
                  </div>
                )}

                {/* Product Summary */}
                <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-soft-nude/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image || "/assets/product-tube.webp"}
                    alt={product.name}
                    className="size-14 rounded-lg object-contain bg-white border border-border p-1 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.65rem] font-bold text-primary uppercase">{product.brand}</p>
                    <p className="text-xs font-bold text-ink line-clamp-1">{product.name}</p>
                    <p className="text-[0.6875rem] text-ink-muted font-medium">Format : {selected.label}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-tabular text-sm font-extrabold text-ink">{formatPrice(subtotalMillimes)}</p>
                    <p className="text-[0.625rem] text-ink-muted">Qté : {quantity}</p>
                  </div>
                </div>

                {/* Shipping & Price Breakdown */}
                <div className="space-y-1.5 rounded-xl border border-border/80 p-3 bg-white text-xs">
                  <div className="flex justify-between text-ink-muted font-medium">
                    <span>Sous-total produit :</span>
                    <span className="font-tabular font-bold text-ink">{formatPrice(subtotalMillimes)}</span>
                  </div>
                  <div className="flex justify-between text-ink-muted font-medium">
                    <span>Frais de livraison (Tunisie) :</span>
                    <span className="font-bold text-emerald-700">
                      {deliveryFeeMillimes === 0 ? "OFFERT 🎉" : formatPrice(deliveryFeeMillimes)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border/60 pt-2 text-sm font-black text-ink">
                    <span>Total à payer à la livraison :</span>
                    <span className="font-tabular text-primary text-base">{formatPrice(totalMillimes)}</span>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">Nom et Prénom *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Mohamed Ben Ali"
                      className="w-full h-10 rounded-xl border border-border px-3 text-xs font-medium focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">Téléphone (Tunisie) *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ex: 20 123 456"
                      className="w-full h-10 rounded-xl border border-border px-3 text-xs font-medium focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-ink mb-1">Gouvernorat *</label>
                      <select
                        value={gouvernorat}
                        onChange={(e) => setGouvernorat(e.target.value)}
                        className="w-full h-10 rounded-xl border border-border px-3 text-xs font-medium bg-white focus:outline-none focus:border-primary"
                      >
                        {GOUVERNORATS_TUNISIE.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-ink mb-1">Adresse de livraison *</label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Rue, Immeuble..."
                        className="w-full h-10 rounded-xl border border-border px-3 text-xs font-medium focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">Note pour le livreur (Optionnel)</label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Ex: Sonner à l'interphone B2..."
                      className="w-full h-10 rounded-xl border border-border px-3 text-xs font-medium focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-[#d4a359] via-[#c89b3c] to-[#b88628] hover:from-[#c89b3c] hover:via-[#b88628] hover:to-[#a0741f] text-white font-extrabold text-sm gap-2 shadow-md transition-all active:scale-[0.98]"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Enregistrement...
                      </>
                    ) : (
                      <>
                        <Check size={18} /> Valider la commande ({formatPrice(totalMillimes)})
                      </>
                    )}
                  </Button>
                  <p className="text-[0.625rem] text-center text-ink-muted mt-2">
                    💵 Paiement en espèces à la livraison. Confirmation sous 24h.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
