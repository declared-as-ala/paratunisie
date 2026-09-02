"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  Flame,
  Sun,
  Moon,
  ChevronDown,
  ShoppingBag,
  ArrowDown,
  Lock,
  Star,
  Check,
  Loader2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { formatPrice } from "@/lib/data/products";
import { createExpressOrder } from "@/lib/api/client";
import { trackInitiateCheckout, trackPurchase } from "@/lib/meta-pixel";
import { trackBeginCheckout, trackPurchase as trackFirstPartyPurchase } from "@/lib/analytics/tracker";
import { trackGoogleAdsPurchase } from "@/lib/google-ads";
import {
  saveCheckoutDraft,
  saveCheckoutDraftImmediate,
  markCheckoutAbandoned,
  getCheckoutSessionId,
  resetCheckoutSession,
} from "@/lib/checkout/abandoned-tracker";

export interface LandingProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
  priceMillimes: number;
  variantId?: string;
  stock?: number;
  inStock?: boolean;
  benefit?: string;
  usage?: string;
}

interface PackLandingProps {
  magnesium: LandingProduct;
  ashwagandha: LandingProduct;
}

type SelectedOption = "BOTH" | "MAGNESIUM" | "ASHWAGANDHA";

const GOUVERNORATS = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa",
  "Jendouba", "Kairouan", "Kasserine", "Kébili", "Kef", "Mahdia",
  "Manouba", "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid",
  "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan",
] as const;

export function PackAntiStressLanding({ magnesium, ashwagandha }: PackLandingProps) {
  const [selectedOption, setSelectedOption] = useState<SelectedOption>("BOTH");
  const [quantity, setQuantity] = useState<number>(1);

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [gouvernorat, setGouvernorat] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [confirmedOrderRef, setConfirmedOrderRef] = useState("");
  const [confirmedTotal, setConfirmedTotal] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);

  const checkoutRef = useRef<HTMLDivElement>(null);

  // Prices calculation
  const magPrice = magnesium?.priceMillimes || 89000;
  const ashPrice = ashwagandha?.priceMillimes || 95000;
  const normalCombinedPrice = magPrice + ashPrice; // 184 DT
  // Bundle price (can be equal to combined or special offer)
  const bundlePrice = normalCombinedPrice; 

  const currentUnitSubtotal = useMemo(() => {
    if (selectedOption === "BOTH") return bundlePrice;
    if (selectedOption === "MAGNESIUM") return magPrice;
    return ashPrice;
  }, [selectedOption, bundlePrice, magPrice, ashPrice]);

  const subtotalMillimes = currentUnitSubtotal * quantity;
  // Free delivery if subtotal >= 99 DT (Option BOTH has FREE delivery!)
  const shippingFeeMillimes = subtotalMillimes >= 99000 ? 0 : 7000;
  const totalMillimes = subtotalMillimes + shippingFeeMillimes;

  // Track page view
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        if ((window as any).fbq) {
          (window as any).fbq("track", "ViewContent", {
            content_name: "Pack Anti-Stress (Magnésium + Ashwagandha)",
            content_category: "Packs & Routine",
            value: totalMillimes / 1000,
            currency: "TND",
          });
        }
      } catch {}
    }
  }, []);

  // Items payload for current selection
  const selectedItemsPayload = useMemo(() => {
    if (selectedOption === "BOTH") {
      return [
        {
          productId: magnesium.id,
          productVariantId: magnesium.variantId,
          name: magnesium.name,
          image: magnesium.image,
          variantLabel: "90 comprimés",
          quantity: quantity,
          priceMillimes: magPrice,
        },
        {
          productId: ashwagandha.id,
          productVariantId: ashwagandha.variantId,
          name: ashwagandha.name,
          image: ashwagandha.image,
          variantLabel: "60 gélules",
          quantity: quantity,
          priceMillimes: ashPrice,
        },
      ];
    } else if (selectedOption === "MAGNESIUM") {
      return [
        {
          productId: magnesium.id,
          productVariantId: magnesium.variantId,
          name: magnesium.name,
          image: magnesium.image,
          variantLabel: "90 comprimés",
          quantity: quantity,
          priceMillimes: magPrice,
        },
      ];
    } else {
      return [
        {
          productId: ashwagandha.id,
          productVariantId: ashwagandha.variantId,
          name: ashwagandha.name,
          image: ashwagandha.image,
          variantLabel: "60 gélules",
          quantity: quantity,
          priceMillimes: ashPrice,
        },
      ];
    }
  }, [selectedOption, quantity, magnesium, ashwagandha, magPrice, ashPrice]);

  // Debounced Autosave for Abandoned Checkout
  useEffect(() => {
    if (orderSuccess) return;

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length >= 6 || fullName.trim().length >= 2 || address.trim().length >= 3) {
      saveCheckoutDraft({
        source: "PACK_ANTI_STRESS",
        customerName: fullName,
        phone: phone,
        gouvernorat: gouvernorat,
        fullAddress: address,
        deliveryNote: deliveryNote,
        items: selectedItemsPayload,
        subtotalMillimes,
        shippingFeeMillimes,
        totalMillimes,
        sourceUrl: typeof window !== "undefined" ? window.location.href : undefined,
      });
    }
  }, [phone, fullName, gouvernorat, address, deliveryNote, selectedItemsPayload, subtotalMillimes, shippingFeeMillimes, totalMillimes, orderSuccess]);

  // Mark abandoned on page unload if unsubmitted
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!orderSuccess) {
        markCheckoutAbandoned("PACK_ANTI_STRESS");
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [orderSuccess]);

  const scrollToCheckout = (opt?: SelectedOption) => {
    if (opt) {
      setSelectedOption(opt);
    }
    checkoutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) {
      errors.fullName = "الرجاء إدخال الاسم واللقب";
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 8) {
      errors.phone = "الرجاء إدخال رقم هاتف صحيح (8 أرقام)";
    }
    if (!gouvernorat) {
      errors.gouvernorat = "الرجاء اختيار الولاية";
    }
    if (!address.trim()) {
      errors.address = "الرجاء إدخال عنوان التوصيل بالتفصيل";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || isSubmittingRef.current) return;
    if (!validateForm()) {
      checkoutRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    isSubmittingRef.current = true;
    setSubmitting(true);
    setApiError(null);

    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || fullName.trim();
    const lastName = nameParts.slice(1).join(" ") || ".";
    const checkoutSessionId = getCheckoutSessionId("PACK_ANTI_STRESS");

    try {
      const orderPayload = {
        phone: phone.trim(),
        firstName,
        lastName,
        gouvernorat,
        fullAddress: address.trim(),
        deliveryNote: deliveryNote.trim() || undefined,
        checkoutSessionId,
        items: selectedItemsPayload.map((it) => ({
          productId: it.productId,
          productVariantId: it.productVariantId,
          quantity: it.quantity,
          priceMillimes: it.priceMillimes,
        })),
      };

      const { order, error } = await createExpressOrder(orderPayload);

      if (error || !order?.id) {
        throw new Error(error || "Erreur lors de la validation de la commande");
      }

      // Order created successfully
      resetCheckoutSession("PACK_ANTI_STRESS");
      const orderRef = `PT-${order.id.slice(-6).toUpperCase()}`;
      const finalTotalTnd = (order.totalMillimes || totalMillimes) / 1000;

      // Track purchase
      trackPurchase({
        orderId: order.id,
        orderNumber: orderRef,
        totalTnd: finalTotalTnd,
        items: selectedItemsPayload.map((it) => ({
          productId: it.productId,
          name: it.name,
          quantity: it.quantity,
          priceMillimes: it.priceMillimes,
        })),
      });
      trackFirstPartyPurchase(order.id, finalTotalTnd, selectedItemsPayload.length);
      trackGoogleAdsPurchase({
        orderId: order.id,
        orderNumber: orderRef,
        totalTnd: finalTotalTnd,
        items: selectedItemsPayload.map((it) => ({
          productId: it.productId,
          name: it.name,
          quantity: it.quantity,
          priceMillimes: it.priceMillimes,
        })),
      });

      setConfirmedOrderRef(orderRef);
      setConfirmedTotal(finalTotalTnd);
      setOrderSuccess(true);
      checkoutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err: any) {
      setApiError(err.message || "Une erreur est survenue lors de l'enregistrement de votre commande.");
    } finally {
      setSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A2E26] font-sans antialiased selection:bg-[#2D6A4F] selection:text-white pb-28 md:pb-16">
      {/* ── Top Announcement Bar ── */}
      <div className="bg-[#1B4332] text-white py-2 px-4 text-xs sm:text-sm font-semibold text-center border-b border-[#2D6A4F]/40 flex items-center justify-center gap-2">
        <Truck className="size-4 text-[#74C69D] shrink-0" />
        <span>🚚 livraison Express 24–48h partout en Tunisie | 💵 Paiement à la livraison</span>
      </div>

      {/* ── Landing Header ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E8E1D5] py-3 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-[#1B4332]">
              Para<span className="text-[#2D6A4F]">Tunisie</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2D6A4F]">
              Routine Anti-Stress
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <a
              href="tel:+21697991266"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#1B4332] bg-[#FAF7F2] hover:bg-[#EAE4D9] border border-[#D8CFC0] px-3 py-1.5 rounded-full transition-colors"
            >
              <Phone className="size-3.5 text-[#2D6A4F]" />
              <span className="dir-ltr">+216 97 991 266</span>
            </a>
            <button
              type="button"
              onClick={() => scrollToCheckout()}
              className="hidden sm:inline-flex items-center gap-2 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-full shadow-sm transition-all"
            >
              <span>اطلب توا</span>
              <ArrowDown className="size-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 bg-[#E8F5E9] text-[#1B4332] border border-[#B7E4C7] px-3.5 py-1 rounded-full text-xs sm:text-sm font-extrabold shadow-2xs">
            <Sparkles className="size-4 text-[#2D6A4F]" />
            <span>PACK BIEN-ÊTRE & RÉCUPÉRATION QUOTIDIENNE</span>
          </div>

          {/* Primary Tunisian Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1B4332] leading-tight tracking-tight">
            الستراس والتعب مقلقينك؟ <br className="hidden sm:inline" />
            <span className="text-[#2D6A4F] bg-clip-text">حضّر Routine متاعك</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-[#334E44] max-w-2xl mx-auto font-medium leading-relaxed">
            <strong>Magnésium + B6</strong> للعضلات والتعب + <strong>Ashwagandha</strong> للراحة والتوازن اليومي.
            <br />
            <span className="text-xs sm:text-sm text-[#52796F] mt-1 block">
              Routine anti-stress pour mieux gérer la fatigue, le stress et la récupération au quotidien.
            </span>
          </p>

          {/* Trust Badges Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 pt-4 max-w-3xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xs border border-[#E8E1D5] rounded-xl p-2.5 text-center">
              <ShieldCheck className="size-5 text-[#2D6A4F] mx-auto mb-1" />
              <p className="text-xs font-extrabold text-[#1B4332]">Produits Originaux</p>
              <p className="text-[10px] text-[#52796F]">100% Authentiques</p>
            </div>
            <div className="bg-white/80 backdrop-blur-xs border border-[#E8E1D5] rounded-xl p-2.5 text-center">
              <CheckCircle2 className="size-5 text-[#2D6A4F] mx-auto mb-1" />
              <p className="text-xs font-extrabold text-[#1B4332]">En Stock</p>
              <p className="text-[10px] text-[#52796F]">Expédition du jour</p>
            </div>
            <div className="bg-white/80 backdrop-blur-xs border border-[#E8E1D5] rounded-xl p-2.5 text-center">
              <Truck className="size-5 text-[#2D6A4F] mx-auto mb-1" />
              <p className="text-xs font-extrabold text-[#1B4332]">Livraison 24–48h</p>
              <p className="text-[10px] text-[#52796F]">Partout en Tunisie</p>
            </div>
            <div className="bg-white/80 backdrop-blur-xs border border-[#E8E1D5] rounded-xl p-2.5 text-center">
              <Lock className="size-5 text-[#2D6A4F] mx-auto mb-1" />
              <p className="text-xs font-extrabold text-[#1B4332]">Paiement à la livraison</p>
              <p className="text-[10px] text-[#52796F]">Sans carte bancaire</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 PURCHASE OPTIONS (CARDS) ── */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest font-black text-[#2D6A4F] bg-[#E8F5E9] px-3 py-1 rounded-full border border-[#B7E4C7]">
            اختر العرض المناسب ليك
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1B4332] mt-2">
            عروض الشراء المتاحة
          </h2>
          <p className="text-xs sm:text-sm text-[#52796F] font-medium mt-1">
            اختر الـ Pack كامل للروتين المثالية أو اختر منتج واحد حسب حاجتك
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* OPTION 1: BOTH (RECOMMENDED) */}
          <div
            onClick={() => setSelectedOption("BOTH")}
            className={`relative rounded-3xl p-5 sm:p-6 transition-all cursor-pointer flex flex-col justify-between ${
              selectedOption === "BOTH"
                ? "bg-white border-2 border-[#2D6A4F] shadow-xl ring-4 ring-[#2D6A4F]/10 scale-[1.02]"
                : "bg-white/70 border border-[#E8E1D5] hover:bg-white hover:border-[#2D6A4F]/50 shadow-sm"
            }`}
          >
            {/* Tag */}
            <div className="absolute -top-3.5 right-4 bg-gradient-to-r from-[#E11D48] to-[#BE123C] text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
              <Flame className="size-3.5 fill-white text-white" />
              <span>الأكثر اختياراً</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-[#2D6A4F] uppercase tracking-wider">Pack Complet</span>
                <span className="size-5 rounded-full border-2 flex items-center justify-center border-[#2D6A4F] bg-[#2D6A4F] text-white">
                  {selectedOption === "BOTH" ? <Check className="size-3.5 stroke-[3]" /> : null}
                </span>
              </div>

              <h3 className="text-lg font-black text-[#1B4332] leading-snug">
                🔥 اشري الزوز – Pack Anti-Stress
              </h3>
              <p className="text-xs text-[#52796F] font-semibold mt-1">
                Magnésium + B6 (90 comp) & Ashwagandha (60 gél)
              </p>

              <div className="my-4 p-3 bg-[#FAF7F2] rounded-2xl border border-[#EAE4D9] flex items-center justify-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={magnesium.image} alt="Mag" className="h-14 w-auto object-contain" />
                <span className="text-xl font-bold text-[#2D6A4F]">+</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ashwagandha.image} alt="Ash" className="h-14 w-auto object-contain" />
              </div>

              <ul className="text-xs text-[#334E44] space-y-1.5 font-medium mb-4">
                <li className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-[#2D6A4F] shrink-0" />
                  <span>تغطية كاملة : نهار وليل</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-[#2D6A4F] shrink-0" />
                  <span>تخفيف التعب + راحة الأعصاب</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-[#2D6A4F] shrink-0" />
                  <strong className="text-[#2D6A4F]">Livraison GRATUITE 🎉</strong>
                </li>
              </ul>
            </div>

            <div>
              <div className="pt-3 border-t border-[#F0EBE1] flex items-baseline justify-between mb-3">
                <span className="text-xs text-[#52796F] font-bold">المجموع :</span>
                <span className="text-2xl font-black text-[#1B4332]">{formatPrice(bundlePrice)}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOption("BOTH");
                  scrollToCheckout("BOTH");
                }}
                className={`w-full py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
                  selectedOption === "BOTH"
                    ? "bg-[#2D6A4F] text-white hover:bg-[#1B4332]"
                    : "bg-[#E8F5E9] text-[#1B4332] hover:bg-[#D8F3DC]"
                }`}
              >
                <span>اشري الزوز</span>
                <ArrowDown className="size-3.5" />
              </button>
            </div>
          </div>

          {/* OPTION 2: MAGNESIUM ONLY */}
          <div
            onClick={() => setSelectedOption("MAGNESIUM")}
            className={`rounded-3xl p-5 sm:p-6 transition-all cursor-pointer flex flex-col justify-between ${
              selectedOption === "MAGNESIUM"
                ? "bg-white border-2 border-[#2D6A4F] shadow-xl ring-4 ring-[#2D6A4F]/10 scale-[1.02]"
                : "bg-white/70 border border-[#E8E1D5] hover:bg-white hover:border-[#2D6A4F]/50 shadow-sm"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-[#52796F] uppercase tracking-wider">Uniquement</span>
                <span className={`size-5 rounded-full border-2 flex items-center justify-center ${selectedOption === "MAGNESIUM" ? "border-[#2D6A4F] bg-[#2D6A4F] text-white" : "border-slate-300"}`}>
                  {selectedOption === "MAGNESIUM" ? <Check className="size-3.5 stroke-[3]" /> : null}
                </span>
              </div>

              <h3 className="text-lg font-black text-[#1B4332] leading-snug">
                Magnésium + B6
              </h3>
              <p className="text-xs text-[#52796F] font-semibold mt-1">
                90 Comprimés • Muscle Care
              </p>

              <div className="my-4 p-3 bg-[#FAF7F2] rounded-2xl border border-[#EAE4D9] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={magnesium.image} alt="Magnésium + B6" className="h-20 w-auto object-contain" />
              </div>

              <ul className="text-xs text-[#334E44] space-y-1.5 font-medium mb-4">
                <li className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-[#2D6A4F] shrink-0" />
                  <span>نقص التعب والإرهاق العضلي</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-[#2D6A4F] shrink-0" />
                  <span>دعم وظائف الجهاز العصبي</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-[#2D6A4F] shrink-0" />
                  <span>cure de 45 à 90 jours</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="pt-3 border-t border-[#F0EBE1] flex items-baseline justify-between mb-3">
                <span className="text-xs text-[#52796F] font-bold">السعر :</span>
                <span className="text-2xl font-black text-[#1B4332]">{formatPrice(magPrice)}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOption("MAGNESIUM");
                  scrollToCheckout("MAGNESIUM");
                }}
                className={`w-full py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
                  selectedOption === "MAGNESIUM"
                    ? "bg-[#2D6A4F] text-white hover:bg-[#1B4332]"
                    : "bg-[#FAF7F2] text-[#1B4332] hover:bg-[#EAE4D9] border border-[#D8CFC0]"
                }`}
              >
                <span>اشري المغنيسيوم</span>
                <ArrowDown className="size-3.5" />
              </button>
            </div>
          </div>

          {/* OPTION 3: ASHWAGANDHA ONLY */}
          <div
            onClick={() => setSelectedOption("ASHWAGANDHA")}
            className={`rounded-3xl p-5 sm:p-6 transition-all cursor-pointer flex flex-col justify-between ${
              selectedOption === "ASHWAGANDHA"
                ? "bg-white border-2 border-[#2D6A4F] shadow-xl ring-4 ring-[#2D6A4F]/10 scale-[1.02]"
                : "bg-white/70 border border-[#E8E1D5] hover:bg-white hover:border-[#2D6A4F]/50 shadow-sm"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-[#52796F] uppercase tracking-wider">Uniquement</span>
                <span className={`size-5 rounded-full border-2 flex items-center justify-center ${selectedOption === "ASHWAGANDHA" ? "border-[#2D6A4F] bg-[#2D6A4F] text-white" : "border-slate-300"}`}>
                  {selectedOption === "ASHWAGANDHA" ? <Check className="size-3.5 stroke-[3]" /> : null}
                </span>
              </div>

              <h3 className="text-lg font-black text-[#1B4332] leading-snug">
                Ashwagandha
              </h3>
              <p className="text-xs text-[#52796F] font-semibold mt-1">
                60 Gélules • BioTechUSA
              </p>

              <div className="my-4 p-3 bg-[#FAF7F2] rounded-2xl border border-[#EAE4D9] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ashwagandha.image} alt="Ashwagandha" className="h-20 w-auto object-contain" />
              </div>

              <ul className="text-xs text-[#334E44] space-y-1.5 font-medium mb-4">
                <li className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-[#2D6A4F] shrink-0" />
                  <span>توازن وراحة في فترات الستراس</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-[#2D6A4F] shrink-0" />
                  <span>دعم الحيوية والتعافي اليومي</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-[#2D6A4F] shrink-0" />
                  <span>extrait standardisé de haute pureté</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="pt-3 border-t border-[#F0EBE1] flex items-baseline justify-between mb-3">
                <span className="text-xs text-[#52796F] font-bold">السعر :</span>
                <span className="text-2xl font-black text-[#1B4332]">{formatPrice(ashPrice)}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOption("ASHWAGANDHA");
                  scrollToCheckout("ASHWAGANDHA");
                }}
                className={`w-full py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
                  selectedOption === "ASHWAGANDHA"
                    ? "bg-[#2D6A4F] text-white hover:bg-[#1B4332]"
                    : "bg-[#FAF7F2] text-[#1B4332] hover:bg-[#EAE4D9] border border-[#D8CFC0]"
                }`}
              >
                <span>اشري الأشواغاندا</span>
                <ArrowDown className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFITS SECTION IN TUNISIAN ── */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D5] shadow-sm space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-[#1B4332]">
              شنوة يعطيك هذا الـ Pack ؟
            </h2>
            <p className="text-xs sm:text-sm text-[#52796F] font-medium mt-1">
              مكونات طبيعية ومعروفة عالمياً لدعم الجسم والأعصاب في فترات التعب والضغط
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Magnesium benefits card */}
            <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#EAE4D9] space-y-3">
              <div className="flex items-center gap-2 text-[#1B4332]">
                <div className="size-8 rounded-xl bg-[#E8F5E9] text-[#2D6A4F] flex items-center justify-center font-black text-sm">
                  Mg
                </div>
                <h3 className="font-extrabold text-base">Magnésium + Vitamine B6</h3>
              </div>
              <ul className="text-xs sm:text-sm text-[#334E44] space-y-2 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-base leading-none">✅</span>
                  <span>يعاون على نقص التعب والإرهاق اليومي.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-base leading-none">✅</span>
                  <span>يدعم وظيفة العضلات ويقلل من التشنجات.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-base leading-none">✅</span>
                  <span>يساهم في العمل الطبيعي للجهاز العصبي.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-base leading-none">✅</span>
                  <span>مناسب للروتين اليومي وللناس اللي تمارس الرياضة.</span>
                </li>
              </ul>
            </div>

            {/* Ashwagandha benefits card */}
            <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#EAE4D9] space-y-3">
              <div className="flex items-center gap-2 text-[#1B4332]">
                <div className="size-8 rounded-xl bg-[#D8F3DC] text-[#2D6A4F] flex items-center justify-center font-black text-sm">
                  🌿
                </div>
                <h3 className="font-extrabold text-base">Ashwagandha BioTechUSA</h3>
              </div>
              <ul className="text-xs sm:text-sm text-[#334E44] space-y-2 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-base leading-none">✅</span>
                  <span>تساعد على التوازن والراحة في فترات الستراس.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-base leading-none">✅</span>
                  <span>مناسبة للروتين اليومي وتحسين جودة الراحة.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-base leading-none">✅</span>
                  <span>تدعم الحيوية والتعافي الذهني والبدني.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-base leading-none">✅</span>
                  <span>اختيار ممتاز لفترات الخدمة والضغط والتعب.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Synergy Box */}
          <div className="bg-[#E8F5E9] rounded-2xl p-5 border border-[#B7E4C7] text-center space-y-2">
            <h4 className="text-base sm:text-lg font-black text-[#1B4332]">
              علاش ناخذهم مع بعضهم ؟
            </h4>
            <p className="text-xs sm:text-sm text-[#2D6A4F] font-semibold max-w-2xl mx-auto leading-relaxed">
              « Magnésium + B6 و Ashwagandha يكملوا بعضهم في Routine يومية متوازنة وموجهة للتعب، الستراس، الراحة والتعافي اليومي. »
            </p>
          </div>
        </div>
      </section>

      {/* ── VISUAL ROUTINE SECTION ── */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <span className="text-xs uppercase tracking-widest font-black text-[#2D6A4F] bg-[#E8F5E9] px-3 py-1 rounded-full border border-[#B7E4C7]">
            كيفاش تستعملهم ؟
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1B4332] mt-2">
            Routine بسيطة وفعّالة
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Morning Routine */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8E1D5] shadow-sm flex items-start gap-4">
            <div className="size-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Sun className="size-6" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                في الصباح / خلال النهار
              </span>
              <h3 className="font-extrabold text-base text-[#1B4332] mt-1.5">Ashwagandha</h3>
              <p className="text-xs font-bold text-[#2D6A4F] mt-0.5">للراحة والتوازن اليومي</p>
              <p className="text-xs text-[#52796F] mt-2 leading-relaxed">
                خذ كبسولة واحدة مع كأس ماء كبير في الصباح مع الفطور لبداية يوم هادئة ومتوازنة.
              </p>
            </div>
          </div>

          {/* Evening Routine */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8E1D5] shadow-sm flex items-start gap-4">
            <div className="size-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Moon className="size-6" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                في العشية / بعد التمرين
              </span>
              <h3 className="font-extrabold text-base text-[#1B4332] mt-1.5">Magnésium + Vitamine B6</h3>
              <p className="text-xs font-bold text-[#2D6A4F] mt-0.5">للعضلات والتعب والاسترجاع</p>
              <p className="text-xs text-[#52796F] mt-2 leading-relaxed">
                خذ 1 إلى 2 حبات مع وجبة العشاء أو بعد الحصة التدريبية لإرخاء العضلات وتحسين راحة النوم.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 1-STEP QUICK CHECKOUT SECTION ── */}
      <section ref={checkoutRef} id="commander" className="py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-[#2D6A4F] shadow-2xl space-y-6">
          {orderSuccess ? (
            /* Success Order Screen */
            <div className="text-center py-8 space-y-4">
              <div className="size-16 rounded-full bg-[#E8F5E9] text-[#2D6A4F] flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="size-10" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1B4332]">
                مبروك! تم تسجيل طلبك بنجاح 🎉
              </h2>
              <p className="text-sm font-semibold text-[#334E44]">
                رقم الطلب الخاص بك : <span className="font-black text-[#2D6A4F] text-base">{confirmedOrderRef}</span>
              </p>
              <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EAE4D9] max-w-md mx-auto text-xs text-[#52796F] space-y-2">
                <p>
                  <strong>المبلغ الإجمالي :</strong> {confirmedTotal.toFixed(3)} DT (الدفع عند الاستلام).
                </p>
                <p>
                  سيتصل بك فريقنا أو مندوب التوصيل عبر الهاتف لتأكيد موعد استلام طردك في غضون 24 إلى 48 ساعة.
                </p>
              </div>
              <div className="pt-3">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-[#2D6A4F] text-white font-bold text-xs hover:bg-[#1B4332] transition-colors"
                >
                  العودة للرئيسية
                </Link>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <div>
              <div className="text-center border-b border-[#F0EBE1] pb-5">
                <span className="text-xs uppercase tracking-widest font-black text-[#2D6A4F] bg-[#E8F5E9] px-3 py-1 rounded-full border border-[#B7E4C7]">
                  تأكيد فوري بدون حساب
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#1B4332] mt-2">
                  كمّل معلوماتك واطلب توا
                </h2>
                <p className="text-xs sm:text-sm text-[#52796F] font-semibold mt-1">
                  ما يلزمكش تعمل compte • الدفع نقدًا عند استلام الطرد
                </p>
              </div>

              {apiError && (
                <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0 text-rose-600" />
                  <span>{apiError}</span>
                </div>
              )}

              <form onSubmit={handleConfirmOrder} className="mt-6 space-y-4">
                {/* Chosen Offer Preview & Switcher */}
                <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EAE4D9] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#1B4332]">العرض المختار :</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedOption("BOTH")}
                        className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg transition-colors ${
                          selectedOption === "BOTH"
                            ? "bg-[#2D6A4F] text-white shadow-2xs"
                            : "bg-white text-slate-700 border border-slate-200"
                        }`}
                      >
                        الزوز (Pack)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedOption("MAGNESIUM")}
                        className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg transition-colors ${
                          selectedOption === "MAGNESIUM"
                            ? "bg-[#2D6A4F] text-white shadow-2xs"
                            : "bg-white text-slate-700 border border-slate-200"
                        }`}
                      >
                        Magnésium
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedOption("ASHWAGANDHA")}
                        className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg transition-colors ${
                          selectedOption === "ASHWAGANDHA"
                            ? "bg-[#2D6A4F] text-white shadow-2xs"
                            : "bg-white text-slate-700 border border-slate-200"
                        }`}
                      >
                        Ashwagandha
                      </button>
                    </div>
                  </div>

                  {/* Quantity selector */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#EAE4D9]">
                    <span className="text-xs font-bold text-[#52796F]">الكمية (Quantité) :</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="size-8 rounded-lg bg-white border border-[#D8CFC0] text-slate-700 font-black text-sm flex items-center justify-center hover:bg-slate-100 transition-colors"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-black text-sm text-[#1B4332]">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        className="size-8 rounded-lg bg-white border border-[#D8CFC0] text-slate-700 font-black text-sm flex items-center justify-center hover:bg-slate-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-extrabold text-[#1B4332]">
                    الاسم واللقب (Nom & Prénom) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (formErrors.fullName) setFormErrors((prev) => ({ ...prev, fullName: "" }));
                    }}
                    placeholder="مثال: محمد التونسي"
                    className={`w-full px-4 py-3 rounded-xl border bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] transition-all ${
                      formErrors.fullName ? "border-rose-400 bg-rose-50/30" : "border-[#D8CFC0]"
                    }`}
                  />
                  {formErrors.fullName && <p className="text-[11px] font-bold text-rose-600">{formErrors.fullName}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="block text-xs font-extrabold text-[#1B4332]">
                    رقم الهاتف (Numéro de téléphone) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: "" }));
                    }}
                    placeholder="مثال: 99 123 456"
                    className={`w-full px-4 py-3 rounded-xl border bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] transition-all ${
                      formErrors.phone ? "border-rose-400 bg-rose-50/30" : "border-[#D8CFC0]"
                    }`}
                  />
                  {formErrors.phone && <p className="text-[11px] font-bold text-rose-600">{formErrors.phone}</p>}
                </div>

                {/* Governorate */}
                <div className="space-y-1">
                  <label className="block text-xs font-extrabold text-[#1B4332]">
                    الولاية (Gouvernorat) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={gouvernorat}
                      onChange={(e) => {
                        setGouvernorat(e.target.value);
                        if (formErrors.gouvernorat) setFormErrors((prev) => ({ ...prev, gouvernorat: "" }));
                      }}
                      className={`w-full px-4 py-3 rounded-xl border bg-white text-sm font-semibold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] transition-all ${
                        formErrors.gouvernorat ? "border-rose-400 bg-rose-50/30" : "border-[#D8CFC0]"
                      }`}
                    >
                      <option value="">-- اختر الولاية --</option>
                      {GOUVERNORATS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="size-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {formErrors.gouvernorat && (
                    <p className="text-[11px] font-bold text-rose-600">{formErrors.gouvernorat}</p>
                  )}
                </div>

                {/* Full Address */}
                <div className="space-y-1">
                  <label className="block text-xs font-extrabold text-[#1B4332]">
                    العنوان بالتفصيل (Adresse de livraison) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (formErrors.address) setFormErrors((prev) => ({ ...prev, address: "" }));
                    }}
                    placeholder="المدينة، الشارع، رقم المنزل أو معلم معروف..."
                    className={`w-full px-4 py-3 rounded-xl border bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] transition-all ${
                      formErrors.address ? "border-rose-400 bg-rose-50/30" : "border-[#D8CFC0]"
                    }`}
                  />
                  {formErrors.address && <p className="text-[11px] font-bold text-rose-600">{formErrors.address}</p>}
                </div>

                {/* Delivery Note */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#52796F]">
                    ملاحظة للموزع (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    placeholder="مثال: الاتصال بعد الظهر أو قبل الوصول..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D8CFC0] bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F]"
                  />
                </div>

                {/* Order Summary Recap */}
                <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EAE4D9] space-y-2 pt-3">
                  <div className="flex justify-between text-xs text-slate-600 font-medium">
                    <span>
                      {selectedOption === "BOTH"
                        ? "Pack Anti-Stress (Magnésium + Ashwagandha)"
                        : selectedOption === "MAGNESIUM"
                        ? "Magnésium + B6 (90 comp)"
                        : "Ashwagandha (60 gél)"}{" "}
                      × {quantity}
                    </span>
                    <span className="font-bold text-slate-900">{formatPrice(subtotalMillimes)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 font-medium">
                    <span>Frais de livraison :</span>
                    <span className="font-bold text-[#2D6A4F]">
                      {shippingFeeMillimes === 0 ? "GRATUITE 🎉" : formatPrice(shippingFeeMillimes)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#EAE4D9] flex justify-between items-baseline">
                    <span className="text-sm font-black text-[#1B4332]">المجموع النهائي (TOTAL) :</span>
                    <span className="text-2xl font-black text-[#2D6A4F]">{formatPrice(totalMillimes)}</span>
                  </div>
                </div>

                {/* Main Submit CTA */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-2xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-black text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      <span>جاري تسجيل الطلب...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-6" />
                      <span>✅ أكّد الطلب توا ({formatPrice(totalMillimes)})</span>
                    </>
                  )}
                </button>

                {/* Trust promises */}
                <div className="pt-2 text-center text-xs text-[#52796F] font-bold space-y-1">
                  <p>💵 الدفع عند الاستلام (Cash on delivery)</p>
                  <p>🇹🇳 Livraison partout en Tunisie (24 à 48h)</p>
                  <p className="text-[11px] text-[#74A892]">🔒 معلوماتك الشخصية محمية ومشفرة 100%</p>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* ── STICKY MOBILE BOTTOM BAR ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E8E1D5] px-3 py-2 shadow-2xl">
        <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
          {/* Quick Option Selector Pills */}
          <div className="flex gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-[#EAE4D9]">
            <button
              type="button"
              onClick={() => setSelectedOption("BOTH")}
              className={`text-[10px] font-black px-2 py-1.5 rounded-lg transition-colors ${
                selectedOption === "BOTH" ? "bg-[#2D6A4F] text-white" : "text-[#52796F]"
              }`}
            >
              الزوز
            </button>
            <button
              type="button"
              onClick={() => setSelectedOption("MAGNESIUM")}
              className={`text-[10px] font-black px-2 py-1.5 rounded-lg transition-colors ${
                selectedOption === "MAGNESIUM" ? "bg-[#2D6A4F] text-white" : "text-[#52796F]"
              }`}
            >
              Mag
            </button>
            <button
              type="button"
              onClick={() => setSelectedOption("ASHWAGANDHA")}
              className={`text-[10px] font-black px-2 py-1.5 rounded-lg transition-colors ${
                selectedOption === "ASHWAGANDHA" ? "bg-[#2D6A4F] text-white" : "text-[#52796F]"
              }`}
            >
              Ash
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-[10px] text-[#52796F] font-bold">المجموع :</p>
            <p className="text-base font-black text-[#1B4332] leading-none">{formatPrice(totalMillimes)}</p>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={() => scrollToCheckout()}
            className="inline-flex items-center justify-center gap-1.5 bg-[#2D6A4F] active:bg-[#1B4332] text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition-transform"
          >
            <span>اطلب توا</span>
            <ArrowDown className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
