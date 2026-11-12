"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  Banknote,
  Check,
  Loader2,
  Lock,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Truck,
  User,
  X,
  Building2,
} from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { COMPANY_CONFIG } from "@/lib/config/company";
import { createLandingOrder, type LandingOrderResponse, type LandingProduct } from "@/lib/api/client";
import {
  DraftSaver,
  buildDraftBody,
  captureAttribution,
  clearLandingSession,
  getLandingSession,
  persistLandingForm,
  type Attribution,
  type LandingFormState,
} from "@/lib/checkout/landing-draft";
import { trackGoogleAdsPurchase } from "@/lib/google-ads";
import { trackInitiateCheckout, trackPurchase, trackViewContent } from "@/lib/meta-pixel";
import { trackBeginCheckout, trackProductView, trackPurchase as trackFirstPartyPurchase } from "@/lib/analytics/tracker";
import { GOVERNORATES, GOVERNORATE_LABELS_AR, deliveryFeeMillimes, formatDT, normalizeTunisianPhone } from "@/lib/tunisia";

export const LANDING_ID = "anabolic-whey-80";
const MAX_QTY = 10;
const LOW_STOCK_AT = 5;

type Errors = Partial<Record<"customerName" | "phone" | "gouvernorat" | "fullAddress", string>>;

const EMPTY: LandingFormState = { customerName: "", phone: "", gouvernorat: "", fullAddress: "", quantity: 1, contactConsent: false };

function validate(f: LandingFormState): Errors {
  const e: Errors = {};
  if (f.customerName.trim().length < 2) e.customerName = "اكتب اسمك ولقبك";
  if (!normalizeTunisianPhone(f.phone)) e.phone = "رقم التليفون لازم يكون رقم تونسي من 8 أرقام (مثال: 98 123 456)";
  if (!f.gouvernorat) e.gouvernorat = "اختار الولاية";
  if (f.fullAddress.trim().length < 5) e.fullAddress = "اكتب عنوانك بالتفصيل (الشارع، الحومة، رقم الدار)";
  return e;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Icon sits at the inline-start edge (right in RTL): reserve that side. The phone input is LTR, so its sides are mirrored.
const padRtl = "ps-12 pe-10";
const padLtr = "ps-10 pe-12";
const fieldBase =
  "h-14 w-full lg:h-12 rounded-xl border border-[var(--lp-line-strong)] bg-white text-base text-[var(--lp-ink)] placeholder:text-[var(--lp-ink)]/40 transition-[border-color,box-shadow] duration-150 focus:border-[var(--lp-brand)] focus:outline-none focus:ring-4 focus:ring-[var(--lp-brand)]/15 aria-[invalid=true]:border-[var(--lp-danger)] aria-[invalid=true]:ring-[var(--lp-danger)]/10";

function Field({
  id,
  label,
  icon: Icon,
  error,
  children,
  required,
  valid,
  hint,
}: {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
  valid?: boolean;
  hint?: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[0.9375rem] font-bold text-[var(--lp-ink)] lg:mb-1.5">
        {label}
        {required && <span className="text-[var(--lp-danger)]"> *</span>}
      </label>
      <div className="relative">
        {children}
        <Icon className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-[var(--lp-brand)]" aria-hidden />
        {valid && <Check className="pointer-events-none absolute end-3.5 top-1/2 size-5 -translate-y-1/2 rounded-full bg-[var(--lp-brand)] p-1 text-white" aria-hidden />}
      </div>
      {hint && !error && <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[var(--lp-brand)]">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-semibold text-[var(--lp-danger)]">
          {error}
        </p>
      )}
    </div>
  );
}

export function WheyLanding({ product, children }: { product: LandingProduct; children?: React.ReactNode }) {
  const { variant } = product;
  const maxQty = Math.max(1, Math.min(MAX_QTY, variant.stock));
  const outOfStock = variant.stock <= 0;

  const [form, setForm] = useState<LandingFormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Errors, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [order, setOrder] = useState<LandingOrderResponse | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [ctaVisible, setCtaVisible] = useState(false);
  const [ready, setReady] = useState(false);

  const sidRef = useRef("ssr");
  const attributionRef = useRef<Attribution>({});
  const saverRef = useRef<DraftSaver | null>(null);
  const dirtyRef = useRef(false);
  const initiatedRef = useRef(false);
  const submittingRef = useRef(false);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const subtotal = variant.priceMillimes * form.quantity;
  const fee = deliveryFeeMillimes(subtotal);
  const total = subtotal + fee;
  const eventId = useCallback(() => `purchase_${sidRef.current}`, []);

  /* Session, attribution, restore of an unfinished form, draft saver. */
  useEffect(() => {
    const { sid, restored } = getLandingSession();
    sidRef.current = sid;
    attributionRef.current = captureAttribution();
    // Restoring an unfinished form from this device can only happen after hydration, so it must run in an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (restored) setForm({ ...EMPTY, ...restored, quantity: Math.min(Math.max(1, restored.quantity || 1), maxQty) });
    saverRef.current = new DraftSaver();
    setReady(true);
    trackViewContent({ id: product.id, name: product.name, priceMillimes: variant.priceMillimes, category: "Whey Protéine", brand: product.brand });
    trackProductView({ id: product.id, name: product.name, priceMillimes: variant.priceMillimes });
    return () => saverRef.current?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Persist locally, and save a background draft once name + valid phone exist (never an order). */
  useEffect(() => {
    if (!ready || order) return;
    persistLandingForm(sidRef.current, form);
    if (!dirtyRef.current) return;
    if (form.customerName.trim().length < 2 || !normalizeTunisianPhone(form.phone)) return;
    saverRef.current?.push(
      buildDraftBody(
        {
          sid: sidRef.current,
          landingId: LANDING_ID,
          productId: product.id,
          productVariantId: variant.id,
          purchaseEventId: eventId(),
          attribution: attributionRef.current,
        },
        form,
      ),
    );
  }, [form, ready, order, product.id, variant.id, eventId]);

  /* Sticky mobile bar hides while the real confirm button is on screen. */
  useEffect(() => {
    const el = ctaRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setCtaVisible(entry.isIntersecting), { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, [order]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLightbox(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  function update<K extends keyof LandingFormState>(key: K, value: LandingFormState[K]) {
    dirtyRef.current = true;
    setForm((f) => ({ ...f, [key]: value }));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function blur(key: keyof Errors) {
    setTouched((t) => ({ ...t, [key]: true }));
    const e = validate(form);
    setErrors((prev) => ({ ...prev, [key]: e[key] }));
  }

  /** InitiateCheckout fires once, on the shopper's first interaction with the form — not on page load. */
  function onFormFocus() {
    if (initiatedRef.current) return;
    initiatedRef.current = true;
    trackInitiateCheckout(
      { items: [{ productId: product.id, quantity: form.quantity, priceMillimes: variant.priceMillimes }], totalTnd: total / 1000 },
      `ic_${sidRef.current}`,
    );
    trackBeginCheckout(form.quantity, total / 1000);
  }

  /**
   * The phone keyboard's Done/Go key (Enter) inside a text field would submit the form and place a real order.
   * Only the confirm button may do that: Enter just moves to the next field, or closes the keyboard on the last one.
   */
  function onFormKeyDown(e: React.KeyboardEvent<HTMLFormElement>) {
    if (e.key !== "Enter") return;
    const t = e.target as HTMLElement;
    if (t.tagName !== "INPUT") return; // buttons keep their normal keyboard behaviour
    e.preventDefault();
    const order = ["lp-name", "lp-phone", "lp-gov", "lp-address"];
    const next = order[order.indexOf(t.id) + 1];
    if (next && order.indexOf(t.id) >= 0) document.getElementById(next)?.focus();
    else (t as HTMLInputElement).blur();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current || outOfStock) return;
    const found = validate(form);
    setErrors(found);
    setTouched({ customerName: true, phone: true, gouvernorat: true, fullAddress: true });
    const first = (["customerName", "phone", "gouvernorat", "fullAddress"] as const).find((k) => found[k]);
    if (first) {
      const ids = { customerName: "lp-name", phone: "lp-phone", gouvernorat: "lp-gov", fullAddress: "lp-address" };
      document.getElementById(ids[first])?.focus();
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setServerError(null);
    const payload = {
      checkoutSessionId: sidRef.current,
      landingId: LANDING_ID,
      productId: product.id,
      productVariantId: variant.id,
      quantity: form.quantity,
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      gouvernorat: form.gouvernorat,
      fullAddress: form.fullAddress.trim(),
      purchaseEventId: eventId(),
      sourceUrl: window.location.origin + window.location.pathname,
      contactConsent: form.contactConsent,
      privacyNoticeShown: true,
      ...attributionRef.current,
    };

    // The server is idempotent per session: re-sending after a timeout can never create a second order.
    let result = await createLandingOrder(payload);
    for (let attempt = 1; !result.order && result.retryable && attempt <= 2; attempt++) {
      await sleep(1500 * attempt);
      result = await createLandingOrder(payload);
    }

    if (result.order) {
      const o = result.order;
      saverRef.current?.stop();
      clearLandingSession();
      const items = [{ productId: product.id, name: product.name, quantity: o.quantity, priceMillimes: variant.priceMillimes }];
      // One Purchase, only for a real order. The server sent the matching CAPI event with the same event id.
      trackPurchase({ orderId: o.id, orderNumber: o.reference, totalTnd: o.totalMillimes / 1000, items }, o.eventId);
      trackFirstPartyPurchase(o.id, o.totalMillimes / 1000, o.quantity);
      trackGoogleAdsPurchase({ orderId: o.id, orderNumber: o.reference, totalTnd: o.totalMillimes / 1000, items });
      setOrder(o);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const status = "status" in result ? result.status : 0;
      setServerError(
        status === 409 && result.error
          ? result.error
          : result.retryable
            ? "ما فماش كونيكسيون ثابتة. تأكد من الإنترنت وعاود اضغط على الزرّ — الكوموند ما تتسجلش مرتين."
            : result.error || "صار مشكل وقت تسجيل الكوموند. عاود جرّب ولا اتصل بينا.",
      );
    }
    submittingRef.current = false;
    setSubmitting(false);
  }

  const images = product.images.length ? product.images : [{ url: "/assets/product-unavailable.svg", alt: product.name }];
  const hero = images[Math.min(activeImage, images.length - 1)];
  const waNumber = COMPANY_CONFIG.phoneRaw.replace(/\D/g, "");
  const lowStock = !outOfStock && variant.stock <= LOW_STOCK_AT;
  const governorateOptions = useMemo(() => GOVERNORATES.map((g) => ({ value: g, label: `${GOVERNORATE_LABELS_AR[g]} — ${g}` })), []);

  return (
    <div className="min-h-screen bg-[var(--lp-cream)] text-[var(--lp-ink)]">
      {/* Contact strip */}
      <div className="bg-[var(--lp-brand-deep)] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-1.5 text-xs sm:py-2 sm:text-[0.8125rem] lg:py-1">
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <BadgeCheck className="size-4 text-[var(--lp-accent)]" aria-hidden /> منتوج أصلي 100% · الدفع عند الاستلام
          </span>
          <span className="flex items-center gap-4">
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center gap-1.5 lg:min-h-6 hover:text-[var(--lp-accent)]">
              <MessageCircle className="size-4" aria-hidden /> <span className="hidden sm:inline">واتساب</span>
            </a>
            <a href={`tel:${COMPANY_CONFIG.phoneRaw}`} className="inline-flex min-h-8 items-center gap-1.5 lg:min-h-6 hover:text-[var(--lp-accent)]">
              <Phone className="size-4" aria-hidden /> <span dir="ltr">{COMPANY_CONFIG.phoneDisplay}</span>
            </a>
          </span>
        </div>
      </div>

      {/* Minimal header: brand only, no menus */}
      <header className="border-b border-[var(--lp-line)] bg-white">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-center px-4 sm:h-16 lg:h-14">
          <Link href="/" aria-label="ParaTunisie — الصفحة الرئيسية">
            <Logo size="header" className="lg:[&>img]:h-14" />
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-28 pt-3 lg:grid lg:grid-cols-2 lg:gap-8 lg:px-6 lg:pb-10 lg:pt-4">
        {/* Gallery — first in the DOM so it sits on the right in RTL, above the form on mobile */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <div className="flex gap-3">
            {images.length > 1 && (
              <ul className="flex w-16 shrink-0 flex-col gap-3 sm:w-20" aria-label="صور المنتوج">
                {images.map((img, i) => (
                  <li key={img.url}>
                    <button
                      type="button"
                      onClick={() => setActiveImage(i)}
                      aria-label={`الصورة ${i + 1}`}
                      aria-current={i === activeImage}
                      className={`relative aspect-square w-full overflow-hidden rounded-xl border-2 bg-white transition-colors ${i === activeImage ? "border-[var(--lp-brand)]" : "border-[var(--lp-line)] hover:border-[var(--lp-soft)]"}`}
                    >
                      <Image src={img.url} alt="" fill sizes="80px" className="object-contain p-1" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={() => setLightbox(true)}
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
              }}
              onMouseLeave={() => setZoom(null)}
              aria-label="تكبير الصورة"
              className="relative aspect-[5/4] min-w-0 flex-1 cursor-zoom-in overflow-hidden rounded-3xl sm:aspect-square lg:aspect-[4/3] border border-[var(--lp-line-strong)] bg-white"
            >
              <Image
                src={hero.url}
                alt={hero.alt}
                fill
                priority
                fetchPriority="high"
                sizes="(max-width: 1024px) 92vw, 640px"
                className="object-contain p-2 transition-transform duration-200 will-change-transform sm:p-8"
                style={zoom ? { transform: "scale(1.8)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
              />
            </button>
          </div>
          <TrustChips fee={fee} className="mt-3 hidden lg:grid" />
          {product.benefit && (
            <p className="mt-3 hidden items-start gap-2 text-sm lg:flex" dir="auto">
              <Check className="mt-0.5 size-4 shrink-0 text-[var(--lp-brand)]" aria-hidden />
              <span>{product.benefit}</span>
            </p>
          )}
        </div>

        {/* Purchase column */}
        <section className="mt-4 lg:mt-0" aria-labelledby="lp-title">
          {order ? (
            <Confirmation order={order} product={product} />
          ) : (
            <>
              <p className="text-sm font-bold tracking-wide text-[var(--lp-brand)]">{product.brand}</p>
              <h1 id="lp-title" className="mt-1 text-[1.4rem] font-extrabold leading-snug text-[var(--lp-brand-deep)] sm:text-3xl lg:text-2xl" dir="auto">
                {product.name}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-3 sm:mt-4 lg:mt-2">
                <span className="text-4xl font-extrabold text-[var(--lp-brand)] lg:text-3xl" dir="ltr">{formatDT(variant.priceMillimes)}</span>
                {outOfStock ? (
                  <span className="rounded-full bg-[var(--lp-danger)]/10 px-3 py-1 text-sm font-bold text-[var(--lp-danger)]">غير متوفر حاليا</span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--lp-brand)]/10 px-3 py-1 text-sm font-bold text-[var(--lp-brand)]">
                    <span className="size-2 rounded-full bg-[var(--lp-brand)]" aria-hidden />
                    {lowStock ? `متوفر — بقاو ${variant.stock} فقط` : "متوفر"}
                  </span>
                )}
              </div>

              {product.benefit && (
                <p className="mt-3 flex items-start gap-2 text-[0.9375rem] lg:hidden" dir="auto">
                  <Check className="mt-1 size-4 shrink-0 text-[var(--lp-brand)]" aria-hidden />
                  <span>{product.benefit}</span>
                </p>
              )}
              <TrustChips fee={fee} className="mt-3 lg:hidden" />

              {outOfStock ? (
                <div className="mt-5 rounded-2xl border border-[var(--lp-line-strong)] bg-white p-5 text-center">
                  <p className="font-bold">المنتوج غير متوفر في الوقت الحالي.</p>
                  <a
                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`عسلامة، نحب نعرف وقتاش يرجع ${product.name}`)}`}
                    className="mt-3 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--lp-brand)] px-6 font-bold text-white"
                  >
                    <MessageCircle className="size-5" aria-hidden /> اسألنا على واتساب
                  </a>
                </div>
              ) : (
                <form
                  id="commande"
                  ref={formRef}
                  onSubmit={onSubmit}
                  onFocusCapture={onFormFocus}
                  onKeyDown={onFormKeyDown}
                  noValidate
                  className="mt-4 space-y-4 lg:mt-3 rounded-3xl border border-[var(--lp-line)] bg-white p-4 shadow-[0_8px_30px_-18px_rgba(94,32,60,0.28)] sm:p-6 lg:grid lg:grid-cols-2 lg:gap-x-3 lg:gap-y-2 lg:space-y-0 lg:p-3"
                  aria-describedby="lp-privacy"
                >
                  <p className="text-center text-[0.9375rem] font-extrabold text-[var(--lp-brand-deep)] lg:hidden">كمّل 4 معلومات وكوموندك تتسجّل — تخلّص كي توصلك</p>
                  <div id="lp-privacy" className="flex items-start gap-2 lg:col-span-2 rounded-xl bg-[var(--lp-soft)]/20 p-2.5 text-[0.6875rem] leading-5 text-[var(--lp-brand-deep)]">
                    <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <p>
                      باش نعاونوك تكمّل الكوموند، معلوماتك (الاسم والتليفون) تتسجّل مؤقتا كي تكتبهم حتى كان ما أكّدتش. ما نبيعوهم لحتى طرف.{" "}
                      <Link href="/confidentialite" className="font-bold underline underline-offset-2" target="_blank">
                        سياسة الخصوصية
                      </Link>
                    </p>
                  </div>

                  <Field id="lp-name" label="الاسم و اللقب" icon={User} error={touched.customerName ? errors.customerName : undefined} valid={form.customerName.trim().length >= 2} required>
                    <input
                      id="lp-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      enterKeyHint="next"
                      placeholder="اكتب اسمك ولقبك"
                      value={form.customerName}
                      onChange={(e) => update("customerName", e.target.value)}
                      onBlur={() => blur("customerName")}
                      aria-invalid={Boolean(touched.customerName && errors.customerName)}
                      aria-describedby={errors.customerName ? "lp-name-error" : undefined}
                      className={`${fieldBase} ${padRtl}`}
                    />
                  </Field>

                  <Field id="lp-phone" label="الهاتف" icon={Phone} error={touched.phone ? errors.phone : undefined} valid={!!normalizeTunisianPhone(form.phone)} required>
                    <input
                      id="lp-phone"
                      name="tel"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      enterKeyHint="next"
                      dir="ltr"
                      placeholder="اكتب رقم تليفونك"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      onBlur={() => blur("phone")}
                      aria-invalid={Boolean(touched.phone && errors.phone)}
                      aria-describedby={errors.phone ? "lp-phone-error" : undefined}
                      className={`${fieldBase} ${padLtr} text-end placeholder:text-end`}
                    />
                  </Field>

                  <Field id="lp-gov" label="الولاية" icon={Building2} error={touched.gouvernorat ? errors.gouvernorat : undefined} valid={!!form.gouvernorat} hint={form.gouvernorat ? (<><Truck className="size-3.5 shrink-0" aria-hidden />{["Tunis", "Ariana", "Ben Arous", "Manouba"].includes(form.gouvernorat) ? "توصيلك خلال 24 ساعة عمل" : "توصيلك من 24 لـ 48 ساعة عمل"}</>) : undefined} required>
                    <select
                      id="lp-gov"
                      name="state"
                      autoComplete="address-level1"
                      value={form.gouvernorat}
                      onChange={(e) => update("gouvernorat", e.target.value)}
                      onBlur={() => blur("gouvernorat")}
                      aria-invalid={Boolean(touched.gouvernorat && errors.gouvernorat)}
                      aria-describedby={errors.gouvernorat ? "lp-gov-error" : undefined}
                      className={`${fieldBase} ${padRtl} appearance-none ${form.gouvernorat ? "" : "text-[var(--lp-ink)]/40"}`}
                    >
                      <option value="">اختار الولاية</option>
                      {governorateOptions.map((o) => (
                        <option key={o.value} value={o.value} className="text-[var(--lp-ink)]">
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </Field>


                  <Field id="lp-address" label="العنوان" icon={MapPin} error={touched.fullAddress ? errors.fullAddress : undefined} valid={form.fullAddress.trim().length >= 5} required>
                    <input
                      id="lp-address"
                      name="address"
                      type="text"
                      autoComplete="street-address"
                      enterKeyHint="done"
                      placeholder="اكتب عنوانك بالتفصيل"
                      value={form.fullAddress}
                      onChange={(e) => update("fullAddress", e.target.value)}
                      onBlur={() => blur("fullAddress")}
                      aria-invalid={Boolean(touched.fullAddress && errors.fullAddress)}
                      aria-describedby={errors.fullAddress ? "lp-address-error" : undefined}
                      className={`${fieldBase} ${padRtl}`}
                    />
                  </Field>

                  <div className="space-y-4 lg:col-span-2 lg:flex lg:items-center lg:gap-3 lg:space-y-0">
                  <div className="flex items-center justify-between gap-4 lg:shrink-0">
                    <span className="text-[0.9375rem] font-bold" id="lp-qty-label">الكمية</span>
                    <div className="inline-flex items-center rounded-xl border border-[var(--lp-line-strong)]" role="group" aria-labelledby="lp-qty-label">
                      <button
                        type="button"
                        onClick={() => update("quantity", Math.max(1, form.quantity - 1))}
                        disabled={form.quantity <= 1}
                        aria-label="نقّص الكمية"
                        className="flex size-12 items-center justify-center text-[var(--lp-brand)] disabled:opacity-30 lg:size-10"
                      >
                        <Minus className="size-5" aria-hidden />
                      </button>
                      <output aria-live="polite" className="w-10 text-center text-lg font-extrabold">{form.quantity}</output>
                      <button
                        type="button"
                        onClick={() => update("quantity", Math.min(maxQty, form.quantity + 1))}
                        disabled={form.quantity >= maxQty}
                        aria-label="زيّد الكمية"
                        className="flex size-12 items-center justify-center text-[var(--lp-brand)] disabled:opacity-30 lg:size-10"
                      >
                        <Plus className="size-5" aria-hidden />
                      </button>
                    </div>
                  </div>

                  {/* Separate, unchecked opt-in. The draft above is saved without it; contact needs it. */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--lp-line)] p-3 text-[0.8125rem] leading-6 lg:flex-1 lg:p-2 lg:text-xs lg:leading-5">
                    <input
                      type="checkbox"
                      checked={form.contactConsent}
                      onChange={(e) => update("contactConsent", e.target.checked)}
                      className="mt-1 size-5 shrink-0 accent-[var(--lp-brand)]"
                    />
                    <span>نعم، تنجموا تتصلوا بيّ (واتساب/تليفون) كان ما كمّلتش الكوموند.</span>
                  </label>
                  </div>

                  {/* Summary — same three rows as the reference */}
                  <dl className="space-y-2.5 border-t border-[var(--lp-line)] pt-4 text-[0.9375rem] lg:col-span-2 lg:grid lg:grid-cols-3 lg:gap-2 lg:space-y-0 lg:border-t-0 lg:pt-0 lg:text-sm">
                    <div className="flex items-center justify-between lg:flex-col lg:items-start lg:justify-center lg:rounded-xl lg:bg-[var(--lp-cream)] lg:px-3 lg:py-1.5">
                      <dt className="text-[var(--lp-ink)]/70">المجموع الفرعي{form.quantity > 1 ? ` (${form.quantity} ×)` : ""}</dt>
                      <dd className="font-bold" dir="ltr">{formatDT(subtotal)}</dd>
                    </div>
                    <div className="flex items-center justify-between lg:flex-col lg:items-start lg:justify-center lg:rounded-xl lg:bg-[var(--lp-cream)] lg:px-3 lg:py-1.5">
                      <dt className="text-[var(--lp-ink)]/70">التوصيل</dt>
                      <dd className="font-bold" dir="ltr">{fee === 0 ? <span className="text-[var(--lp-brand)]">مجاني</span> : formatDT(fee)}</dd>
                    </div>
                    <div className="flex items-center justify-between border-t border-[var(--lp-line)] pt-3 text-lg lg:flex-col lg:items-start lg:justify-center lg:rounded-xl lg:border-t-0 lg:bg-[var(--lp-brand)]/10 lg:px-3 lg:py-1.5 lg:pt-1.5 lg:text-base">
                      <dt className="font-extrabold">المجموع</dt>
                      <dd className="text-2xl font-extrabold text-[var(--lp-brand)] lg:text-xl" dir="ltr" aria-live="polite">{formatDT(total)}</dd>
                    </div>
                  </dl>

                  {serverError && (
                    <p role="alert" className="rounded-xl bg-[var(--lp-danger)]/10 lg:col-span-2 p-3 text-sm font-semibold leading-6 text-[var(--lp-danger)]">
                      {serverError}
                    </p>
                  )}

                  <button
                    ref={ctaRef}
                    type="submit"
                    disabled={submitting}
                    className="flex h-16 w-full items-center justify-center gap-2 lg:col-span-2 lg:h-14 rounded-2xl bg-[var(--lp-brand)] px-4 text-lg font-extrabold text-white shadow-[0_10px_24px_-10px_rgba(123,47,82,0.55)] transition-colors hover:bg-[var(--lp-brand-deep)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lp-accent)]/60 active:scale-[0.99] disabled:cursor-wait disabled:opacity-80 motion-reduce:transition-none"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-5 animate-spin" aria-hidden /> جاري تسجيل الكوموند…
                      </>
                    ) : (
                      "✅ أكّد الكوموند متاعك توا"
                    )}
                  </button>
                  <p className="text-center text-xs leading-6 text-[var(--lp-ink)]/65 lg:hidden">
                    الدفع عند الاستلام فقط. بعد التأكيد نتصلو بيك باش نثبتو الكوموند.
                  </p>
                </form>
              )}
            </>
          )}
        </section>
      </div>

      {children}

      {/* Sticky mobile action bar */}
      {!order && !outOfStock && (
        <div
          className={`fixed inset-x-0 bottom-0 z-30 border-t border-[var(--lp-line)] bg-white/95 px-4 pt-3 backdrop-blur transition-transform duration-200 lg:hidden ${ctaVisible ? "translate-y-full" : "translate-y-0"}`}
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
          aria-hidden={ctaVisible}
        >
          <div className="mx-auto flex max-w-md items-center gap-3">
            <div className="leading-tight">
              <p className="text-[0.6875rem] text-[var(--lp-ink)]/60">المجموع</p>
              <p className="text-lg font-extrabold text-[var(--lp-brand)]" dir="ltr">{formatDT(total)}</p>
            </div>
            <a
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`عسلامة، نحب نسأل على ${product.name}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={ctaVisible ? -1 : 0}
              aria-label="واتساب"
              className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-[var(--lp-line-strong)] text-[#1FA855]"
            >
              <MessageCircle className="size-6" aria-hidden />
            </a>
            <button
              type="button"
              tabIndex={ctaVisible ? -1 : 0}
              onClick={() => {
                formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                setTimeout(() => document.getElementById("lp-name")?.focus({ preventScroll: true }), 450);
              }}
              className="h-12 flex-1 rounded-xl bg-[var(--lp-brand)] text-base font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(123,47,82,0.7)] active:scale-[0.99]"
            >
              اطلب توا
            </button>
          </div>
        </div>
      )}

      {/* Floating WhatsApp, kept clear of the sticky bar on phones */}
      <a
        href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`عسلامة، نحب نسأل على ${product.name}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل معانا على واتساب"
        className="fixed bottom-6 end-4 z-20 hidden size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 lg:flex"
      >
        <MessageCircle className="size-7" aria-hidden />
      </a>

      {lightbox && (
        <div role="dialog" aria-modal="true" aria-label={hero.alt} className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={() => setLightbox(false)}>
          <button type="button" autoFocus aria-label="سكّر" className="absolute end-4 top-4 flex size-12 items-center justify-center rounded-full bg-white/15 text-white" onClick={() => setLightbox(false)}>
            <X className="size-6" aria-hidden />
          </button>
          <div className="relative h-full w-full max-w-3xl">
            <Image src={hero.url} alt={hero.alt} fill sizes="100vw" className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}

function TrustChips({ fee, className }: { fee: number; className?: string }) {
  const chip = "flex flex-col items-center gap-1 rounded-xl bg-[var(--lp-brand)]/10 px-1.5 py-2.5";
  return (
    <ul className={`grid grid-cols-3 gap-2 text-center text-[0.75rem] font-bold leading-4 text-[var(--lp-brand-deep)] ${className ?? ""}`}>
      <li className={chip}>
        <BadgeCheck className="size-5 text-[var(--lp-brand)]" aria-hidden /> منتوج أصلي 100%
      </li>
      <li className={chip}>
        <Banknote className="size-5 text-[var(--lp-brand)]" aria-hidden /> الدفع عند الاستلام
      </li>
      <li className={chip}>
        <Truck className="size-5 text-[var(--lp-brand)]" aria-hidden /> {fee === 0 ? "توصيل مجاني" : "توصيل 24–48 س"}
      </li>
    </ul>
  );
}

function Confirmation({ order, product }: { order: LandingOrderResponse; product: LandingProduct }) {
  const waNumber = COMPANY_CONFIG.phoneRaw.replace(/\D/g, "");
  return (
    <div className="rounded-3xl border border-[var(--lp-line)] bg-white p-6 text-center shadow-[0_8px_30px_-18px_rgba(94,32,60,0.28)] sm:p-8" role="status" aria-live="polite">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[var(--lp-brand)] text-white">
        <Check className="size-9" aria-hidden />
      </div>
      <h1 className="mt-4 text-2xl font-extrabold text-[var(--lp-brand-deep)]">تسجّلت الكوموند متاعك ✅</h1>
      <p className="mt-2 text-sm leading-7 text-[var(--lp-ink)]/75">نتصلو بيك قريب باش نثبتو الكوموند. حافظ على التليفون مفتوح.</p>

      <div className="mt-5 rounded-2xl bg-[var(--lp-cream)] p-4">
        <p className="text-xs text-[var(--lp-ink)]/60">رقم الكوموند</p>
        <p className="mt-1 text-3xl font-extrabold tracking-wider text-[var(--lp-brand)]" dir="ltr">{order.reference}</p>
      </div>

      <dl className="mt-5 space-y-2.5 text-start text-[0.9375rem]">
        <div className="flex justify-between gap-4"><dt className="text-[var(--lp-ink)]/70">المنتوج</dt><dd className="font-bold" dir="auto">{product.name} × {order.quantity}</dd></div>
        <div className="flex justify-between"><dt className="text-[var(--lp-ink)]/70">التوصيل</dt><dd className="font-bold" dir="ltr">{order.deliveryFeeMillimes === 0 ? "مجاني" : formatDT(order.deliveryFeeMillimes)}</dd></div>
        <div className="flex justify-between border-t border-[var(--lp-line)] pt-3 text-lg"><dt className="font-extrabold">المجموع عند الاستلام</dt><dd className="font-extrabold text-[var(--lp-brand)]" dir="ltr">{formatDT(order.totalMillimes)}</dd></div>
      </dl>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a
          href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`عسلامة، الكوموند متاعي ${order.reference}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--lp-brand)] px-6 font-bold text-[var(--lp-brand)]"
        >
          <MessageCircle className="size-5" aria-hidden /> تواصل معانا
        </a>
        <Link href="/" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--lp-brand)] px-6 font-bold text-white">
          تصفّح المتجر
        </Link>
      </div>
    </div>
  );
}
