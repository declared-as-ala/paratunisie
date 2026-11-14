"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Heart, Minus, Phone, Plus, Share2, ShieldCheck, Zap, X, ShoppingBag, Loader2, CheckCircle2, AlertCircle, MessageCircle, Star, Mail } from "lucide-react";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { COMPANY_CONFIG } from "@/lib/config/company";
import { deliveryFeeMillimes as computeDeliveryFee } from "@/lib/tunisia";
import { phoneHref, whatsappHref } from "@/lib/contact";
import { useCart } from "@/hooks/use-cart";
import { formatPrice, type ProductSummary } from "@/lib/data/products";
import { createExpressOrder, type ProductRating } from "@/lib/api/client";
import { trackViewContent, trackInitiateCheckout, trackPurchase } from "@/lib/meta-pixel";
import { trackProductView, trackAddToCart, trackBeginCheckout, trackPurchase as trackFirstPartyPurchase } from "@/lib/analytics/tracker";
import { trackGoogleAdsPurchase } from "@/lib/google-ads";
import { getCustomerSession } from "@/lib/customer-auth";
import { DemanderModal } from "@/components/product/demander-modal";
import { saveCheckoutDraft, saveCheckoutDraftImmediate, markCheckoutAbandoned, getCheckoutSessionId, resetCheckoutSession } from "@/lib/checkout/abandoned-tracker";

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
  const [email, setEmail] = useState("");
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
  const deliveryFeeMillimes = computeDeliveryFee(subtotalMillimes);
  const totalMillimes = subtotalMillimes + deliveryFeeMillimes;

  const handleOpenQuickOrder = () => {
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
    trackBeginCheckout(quantity, totalMillimes / 1000);
  };

  // Pre-fill user data if logged in
  useEffect(() => {
    const session = getCustomerSession();
    if (session?.user) {
      if (session.user.name) setFullName(session.user.name);
      if (session.user.phone) setPhone(session.user.phone);
      if (session.user.email) setEmail(session.user.email);
    }
  }, []);

  // Progressive draft saving as customer types
  useEffect(() => {
    if (quickOrderOpen && (phone.trim() || fullName.trim() || email.trim() || address.trim() || note.trim())) {
      saveCheckoutDraft({
        source: "BUY_NOW_MODAL",
        customerName: fullName,
        phone,
        email: email.trim() || undefined,
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
  }, [quickOrderOpen, phone, fullName, email, gouvernorat, address, note, product.id, product.name, product.image, selected.label, selected.priceMillimes, quantity, subtotalMillimes, deliveryFeeMillimes, totalMillimes]);

  const handleCloseQuickOrder = useCallback(() => {
    if (!orderSuccess && (phone.trim() || fullName.trim() || email.trim() || address.trim())) {
      saveCheckoutDraftImmediate(
        {
          source: "BUY_NOW_MODAL",
          customerName: fullName,
          phone,
          email: email.trim() || undefined,
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
  }, [orderSuccess, phone, fullName, email, gouvernorat, address, note, product.id, product.name, product.image, selected.label, selected.priceMillimes, quantity, subtotalMillimes, deliveryFeeMillimes, totalMillimes]);

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
        email: email.trim() || session?.user?.email,
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

  const hasSale = Boolean(
    sizeIndex === defaultIndex && product.regularPriceMillimes && product.regularPriceMillimes > selected.priceMillimes,
  );
  const savingMillimes = hasSale && product.regularPriceMillimes ? product.regularPriceMillimes - selected.priceMillimes : 0;
  const discountPercent = hasSale && product.regularPriceMillimes ? Math.round((savingMillimes / product.regularPriceMillimes) * 100) : 0;
  const reference = product.sku && product.sku !== product.id ? product.sku : null;
  const whatsappOrderHref = `${whatsappHref}?text=${encodeURIComponent(
    `Bonjour, je souhaite commander : ${product.name} (${selected.label}) x${quantity} — ${COMPANY_CONFIG.siteUrl}/produits/${product.slug}`,
  )}`;

  const handleShare = async () => {
    const url = `${COMPANY_CONFIG.siteUrl}/produits/${product.slug}`;
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else await navigator.clipboard.writeText(url);
    } catch {
      /* user dismissed the share sheet */
    }
  };

  const outlineBtn =
    "inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-border-strong bg-card px-4 text-[0.8125rem] font-bold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer";

  return (
    <div className="w-full max-w-full min-w-0">
      <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">
        <span aria-hidden className="h-px w-6 bg-primary" />
        {product.category}
      </p>
      <h1 className="mt-3 font-serif text-2xl font-extrabold uppercase leading-[1.05] tracking-tight text-foreground sm:text-3xl lg:text-4xl">
        {product.seoH1 || product.name}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          href={`/marques/${product.brandSlug || product.brand.toLowerCase().replace(/\s+/g, "-")}`}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-muted px-3 text-xs hover:bg-primary-soft"
        >
          <span className="text-[0.625rem] font-semibold uppercase tracking-wide text-ink-muted">Marque</span>
          <span className="font-extrabold uppercase text-foreground">{product.brand}</span>
          <ArrowUpRight className="size-3.5 text-ink-muted" aria-hidden />
        </Link>
        <span className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-muted px-3 text-xs font-bold text-foreground">
          <ShieldCheck className="size-4 text-emerald-600" aria-hidden /> 100% authentique
        </span>
        {rating && rating.count > 0 && (
          <span className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-muted px-3 text-xs font-bold text-foreground">
            <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
            {rating.average.toFixed(1)} <span className="font-normal text-ink-muted">({rating.count} avis)</span>
          </span>
        )}
      </div>

      {(product.seoIntro || product.benefit) && (
        <p className="mt-5 border-s-2 border-primary ps-4 text-sm leading-7 text-ink-muted sm:text-base">
          {product.seoIntro || product.benefit}
        </p>
      )}

      {/* ── Buy box ─────────────────────────────────────────────────── */}
      <div className="mt-6 rounded-3xl bg-card p-5 shadow-[0_24px_50px_-36px_rgba(90,27,61,0.5)] ring-1 ring-border-strong/60 sm:p-6">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="font-tabular font-serif text-4xl font-extrabold tracking-tight text-primary">{formatPrice(selected.priceMillimes)}</p>
          {hasSale && product.regularPriceMillimes && (
            <>
              <span className="font-tabular text-base text-ink-muted line-through">{formatPrice(product.regularPriceMillimes)}</span>
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-extrabold text-white">-{discountPercent}%</span>
            </>
          )}
        </div>
        {savingMillimes > 0 && <p className="mt-1 text-xs font-bold text-emerald-700">Vous économisez {formatPrice(savingMillimes)}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4 text-xs">
          {product.inStock ? (
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700">
              <Check className="size-4" aria-hidden /> En stock
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-bold text-amber-700">
              <span className="size-2 rounded-full bg-amber-500" aria-hidden /> Disponible sur commande
            </span>
          )}
          {reference && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 font-semibold text-ink-muted">
              Référence <span className="font-mono text-foreground">{reference}</span>
            </span>
          )}
        </div>

        {product.sizes.length > 1 && (
          <div className="mt-4 flex items-center gap-4 border-t border-border/60 pt-4">
            <label htmlFor="size-select" className="text-sm font-bold text-foreground">Format</label>
            <select
              id="size-select"
              value={sizeIndex}
              onChange={(e) => setSizeIndex(Number(e.target.value))}
              className="h-11 min-w-0 flex-1 rounded-xl border border-border-strong bg-card px-3 text-sm font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {product.sizes.map((size, index) => (
                <option key={size.label} value={index}>
                  {size.label} — {formatPrice(size.priceMillimes)}
                </option>
              ))}
            </select>
          </div>
        )}

        {product.inStock && (
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-border/60 pt-4">
            <div className="flex items-center gap-4">
              <p className="text-sm font-bold text-foreground" id="quantity-label">Quantité</p>
              <div className="flex items-center rounded-xl border border-border-strong bg-card">
                <button
                  type="button"
                  aria-label="Diminuer la quantité"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  className="flex size-11 items-center justify-center text-ink-muted transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary active:scale-90"
                >
                  <Minus className="size-4" aria-hidden />
                </button>
                <span aria-labelledby="quantity-label" className="font-tabular w-8 text-center text-sm font-bold text-foreground">{quantity}</span>
                <button
                  type="button"
                  aria-label="Augmenter la quantité"
                  onClick={() => setQuantity((current) => current + 1)}
                  className="flex size-11 items-center justify-center text-ink-muted transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary active:scale-90"
                >
                  <Plus className="size-4" aria-hidden />
                </button>
              </div>
            </div>
            <p className="text-sm text-ink-muted">
              Total <strong className="font-tabular text-base text-foreground">{formatPrice(selected.priceMillimes * quantity)}</strong>
            </p>
          </div>
        )}

        {/* Main purchase buttons (observed to show the sticky bar) */}
        <div ref={inlineBuyRef} className="mt-5 flex flex-col gap-2.5">
          {product.inStock ? (
            <>
              <button
                type="button"
                onClick={handleAdd}
                className={`flex h-14 w-full items-center justify-center gap-2.5 rounded-full text-sm font-extrabold uppercase tracking-wide transition-all active:scale-[0.98] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  added
                    ? "bg-secondary text-white"
                    : "bg-primary text-primary-foreground shadow-[0_14px_28px_-14px_rgba(233,30,99,0.9)] hover:bg-primary-hover"
                }`}
              >
                {added ? <Check className="size-5" aria-hidden /> : <ShoppingBag className="size-5" aria-hidden />}
                {added ? "Ajouté au panier" : "Ajouter au panier"}
              </button>
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <button type="button" onClick={handleOpenQuickOrder} className={outlineBtn}>
                  <Zap className="size-4" aria-hidden /> Commander maintenant
                </button>
                <a href={whatsappOrderHref} target="_blank" rel="noopener noreferrer" className={outlineBtn}>
                  <MessageCircle className="size-4 text-emerald-600" aria-hidden /> Commander sur WhatsApp
                </a>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setDemanderOpen(true)}
              className="flex h-14 w-full items-center justify-center gap-2.5 rounded-full bg-secondary text-sm font-extrabold uppercase tracking-wide text-white transition-colors hover:bg-primary cursor-pointer"
            >
              <Mail className="size-5" aria-hidden /> Demander ce produit
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center justify-center gap-6 text-sm font-semibold text-ink-muted">
          <button
            type="button"
            aria-pressed={saved}
            onClick={() => setSaved((current) => !current)}
            className="inline-flex min-h-11 items-center gap-2 hover:text-primary cursor-pointer"
          >
            <Heart className={`size-4 ${saved ? "fill-primary text-primary" : ""}`} aria-hidden />
            {saved ? "Retirer des favoris" : "Ajouter aux favoris"}
          </button>
          <button type="button" onClick={handleShare} className="inline-flex min-h-11 items-center gap-2 hover:text-primary cursor-pointer">
            <Share2 className="size-4" aria-hidden /> Partager
          </button>
        </div>

        <p className="mt-2 border-t border-border/60 pt-4 text-xs leading-relaxed text-ink-muted">
          Livraison {COMPANY_CONFIG.deliveryTime} · {COMPANY_CONFIG.shippingFeeTnd} DT · Paiement à la livraison
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/60 pt-4 text-center">
          <div>
            <ShieldCheck className="mx-auto size-5 text-primary" aria-hidden />
            <p className="mt-1 text-xs font-bold text-foreground">Authenticité</p>
            <p className="text-[0.6875rem] text-ink-muted">Produits d&apos;origine</p>
          </div>
          <a href={phoneHref} className="block hover:text-primary">
            <Phone className="mx-auto size-5 text-primary" aria-hidden />
            <p className="mt-1 text-xs font-bold text-foreground">Conseil</p>
            <p className="text-[0.6875rem] text-ink-muted">{COMPANY_CONFIG.phoneDisplay}</p>
          </a>
        </div>
      </div>

      {/* Sticky purchase bar: appears once the inline buttons scroll out of view */}
      <div
        className={`fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-40 border-t border-border-strong/60 bg-white/95 p-2.5 shadow-[0_-8px_30px_-12px_rgba(36,19,29,0.3)] backdrop-blur-md transition-all duration-300 motion-reduce:transition-none lg:bottom-0 lg:p-3 ${
          showStickyBar ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="mx-auto flex max-w-[1280px] items-center gap-3 lg:px-5">
          <span className="relative hidden size-12 shrink-0 overflow-hidden rounded-xl bg-muted/60 ring-1 ring-border/60 lg:block">
            <Image src={product.image} alt="" fill sizes="48px" className="object-contain p-1" />
          </span>
          <div className="hidden min-w-0 flex-1 lg:block">
            <p className="truncate text-sm font-extrabold text-foreground">{product.name}</p>
            <p className="text-xs text-ink-muted">{product.brand}</p>
          </div>
          <div className="ms-auto flex flex-1 items-center gap-2 lg:flex-none">
            <p className="hidden text-end lg:block">
              <span className="block text-[0.625rem] font-bold uppercase tracking-wide text-ink-muted">Total</span>
              <span className="font-tabular text-base font-extrabold text-foreground">{formatPrice(selected.priceMillimes * quantity)}</span>
            </p>
            {product.inStock ? (
              <>
                <button
                  type="button"
                  onClick={handleAdd}
                  className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-full px-6 text-xs font-extrabold uppercase tracking-wide transition-colors cursor-pointer lg:flex-none ${
                    added ? "bg-secondary text-white" : "bg-primary text-primary-foreground hover:bg-primary-hover"
                  }`}
                >
                  {added ? <Check className="size-4" aria-hidden /> : <ShoppingBag className="size-4" aria-hidden />}
                  {added ? "Ajouté" : "Ajouter au panier"}
                </button>
                <button
                  type="button"
                  onClick={handleOpenQuickOrder}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-border-strong bg-card px-5 text-xs font-bold text-foreground transition-colors hover:border-primary hover:text-primary cursor-pointer lg:flex-none"
                >
                  <Zap className="size-4" aria-hidden /> Commander
                  <span className="hidden xl:inline"> maintenant</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setDemanderOpen(true)}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-secondary px-6 text-xs font-extrabold uppercase tracking-wide text-white cursor-pointer lg:flex-none"
              >
                <Mail className="size-4" aria-hidden /> Demander ce produit
              </button>
            )}
          </div>
        </div>
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
                    <Zap size={20} className="text-primary fill-primary" />
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
                    <span className="font-bold text-ink">{formatPrice(deliveryFeeMillimes)}</span>
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

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">Email (Optionnel)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ex: mohamed@gmail.com"
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
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary-hover text-white font-extrabold text-sm gap-2 shadow-md transition-all active:scale-[0.98]"
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
