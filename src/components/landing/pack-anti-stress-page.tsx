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
  Play,
  Pause,
  Volume2,
  VolumeX,
  User,
  MapPin,
  FileText,
  BadgeCheck,
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

  // Video state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [confirmedOrderRef, setConfirmedOrderRef] = useState("");
  const [confirmedTotal, setConfirmedTotal] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);

  const formTopRef = useRef<HTMLDivElement>(null);

  // Prices calculation
  const magPrice = magnesium?.priceMillimes || 89000;
  const ashPrice = ashwagandha?.priceMillimes || 95000;
  const normalCombinedPrice = 184000; // 184 DT crossed out
  const bundlePrice = 159000; // 159 DT pack bundle price

  const currentUnitSubtotal = useMemo(() => {
    if (selectedOption === "BOTH") return bundlePrice;
    if (selectedOption === "MAGNESIUM") return magPrice;
    return ashPrice;
  }, [selectedOption, bundlePrice, magPrice, ashPrice]);

  const subtotalMillimes = currentUnitSubtotal * quantity;
  // User requested: livraison Aramex à 10 DT pour faire total pack 159 + 10 = 169 DT
  const shippingFeeMillimes = 10000; // 10 DT (10000 millimes)
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
      const magUnit = Math.round((magPrice / normalCombinedPrice) * bundlePrice);
      const ashUnit = bundlePrice - magUnit;
      return [
        {
          productId: magnesium.id,
          productVariantId: magnesium.variantId,
          name: magnesium.name,
          image: magnesium.image,
          variantLabel: "90 comprimés",
          quantity: quantity,
          priceMillimes: magUnit,
        },
        {
          productId: ashwagandha.id,
          productVariantId: ashwagandha.variantId,
          name: ashwagandha.name,
          image: ashwagandha.image,
          variantLabel: "60 gélules",
          quantity: quantity,
          priceMillimes: ashUnit,
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
  }, [selectedOption, quantity, magnesium, ashwagandha, magPrice, ashPrice, bundlePrice, normalCombinedPrice]);

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

  const scrollToForm = (opt?: SelectedOption) => {
    if (opt) {
      setSelectedOption(opt);
    }
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) {
      errors.fullName = "Veuillez saisir votre nom et prénom";
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 8) {
      errors.phone = "Veuillez saisir un numéro de téléphone valide (8 chiffres)";
    }
    if (!gouvernorat) {
      errors.gouvernorat = "Veuillez sélectionner votre gouvernorat";
    }
    if (!address.trim()) {
      errors.address = "Veuillez saisir votre adresse de livraison complète";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || isSubmittingRef.current) return;
    if (!validateForm()) {
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
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
        shippingFeeMillimes,
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
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err: any) {
      setApiError(err.message || "Une erreur est survenue lors de l'enregistrement de votre commande.");
    } finally {
      setSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const renderProductPhotoCard = () => (
    <div className="relative bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-[#E8DFD8] shadow-sm overflow-hidden w-full">
      <div className="flex items-center justify-between mb-2.5 sm:mb-4">
        <span className="inline-flex items-center gap-1.5 bg-[#8B263E] text-white text-[10px] sm:text-xs font-black px-2 sm:px-3 py-1 rounded-full shadow-xs">
          <Flame className="size-3 sm:size-3.5" />
          PACK COMPLET DUO ANTI-STRESS
        </span>
        <span className="inline-flex items-center gap-1 bg-[#15803D] text-white text-[10px] sm:text-xs font-black px-2 sm:px-2.5 py-1 rounded-full shadow-xs">
          <Sparkles className="size-3 sm:size-3.5" />
          Économisez 25 DT
        </span>
      </div>

      {/* Main Pack Image */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#FAF7F5] border border-[#F0EAE4]">
        {selectedOption === "BOTH" ? (
          <Image
            src="/assets/pack-anti-stress.jpg"
            alt="Pack Anti-Stress Tunisie - Magnésium B6 et Ashwagandha"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 650px"
            className="object-cover object-center"
          />
        ) : selectedOption === "MAGNESIUM" ? (
          <Image
            src={magnesium.image || "/assets/pack-anti-stress.jpg"}
            alt="Magnésium + Vitamine B6 Muscle Care 90 comprimés"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 650px"
            className="object-contain p-4 sm:p-6"
          />
        ) : (
          <Image
            src={ashwagandha.image || "/assets/pack-anti-stress.jpg"}
            alt="Ashwagandha BioTechUSA 60 gélules"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 650px"
            className="object-contain p-4 sm:p-6"
          />
        )}
      </div>

      {/* Option Selector Thumbnails */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-3 pt-2.5 sm:pt-4">
        <button
          type="button"
          onClick={() => setSelectedOption("BOTH")}
          className={`rounded-xl sm:rounded-2xl p-1.5 sm:p-2 border-2 transition-all text-center ${
            selectedOption === "BOTH"
              ? "border-[#8B263E] bg-[#FAF0F2] ring-2 ring-[#8B263E]/20"
              : "border-[#E8DFD8] bg-[#FAF7F5] hover:border-slate-300"
          }`}
        >
          <p className="text-[10px] sm:text-[11px] font-black text-[#5E203C]">Pack Duo (159 DT)</p>
          <p className="text-[8px] sm:text-[10px] text-[#15803D] font-bold">-25 DT d&apos;économie</p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedOption("MAGNESIUM")}
          className={`rounded-xl sm:rounded-2xl p-1.5 sm:p-2 border-2 transition-all text-center ${
            selectedOption === "MAGNESIUM"
              ? "border-[#8B263E] bg-[#FAF0F2] ring-2 ring-[#8B263E]/20"
              : "border-[#E8DFD8] bg-[#FAF7F5] hover:border-slate-300"
          }`}
        >
          <p className="text-[10px] sm:text-[11px] font-black text-[#5E203C]">Mag B6 ({formatPrice(magPrice)})</p>
          <p className="text-[8px] sm:text-[10px] text-slate-500 font-medium">90 comp</p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedOption("ASHWAGANDHA")}
          className={`rounded-xl sm:rounded-2xl p-1.5 sm:p-2 border-2 transition-all text-center ${
            selectedOption === "ASHWAGANDHA"
              ? "border-[#8B263E] bg-[#FAF0F2] ring-2 ring-[#8B263E]/20"
              : "border-[#E8DFD8] bg-[#FAF7F5] hover:border-slate-300"
          }`}
        >
          <p className="text-[10px] sm:text-[11px] font-black text-[#5E203C]">Ashwa ({formatPrice(ashPrice)})</p>
          <p className="text-[8px] sm:text-[10px] text-slate-500 font-medium">60 gél</p>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#FAF7F5] text-[#2D2424] font-sans antialiased selection:bg-[#7B2F52] selection:text-white pb-28 lg:pb-16">
      {/* ── Top Announcement Bar ── */}
      <div className="w-full overflow-hidden bg-[#5E203C] text-white py-1.5 px-2.5 text-[11px] sm:text-xs font-semibold text-center border-b border-[#7B2F52]/40">
        <div className="flex items-center justify-center gap-1.5 max-w-full mx-auto truncate">
          <Truck className="size-3.5 text-[#F7E7E9] shrink-0" />
          <span className="truncate">🚚 Livraison Rapide Aramex partout en Tunisie • 💵 Paiement à la livraison</span>
        </div>
      </div>

      {/* ── Clean Single Landing Header (Fully responsive on all mobile screens) ── */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E8DFD8] py-2 px-2.5 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 shrink-0 min-w-0">
            <Link href="/" className="inline-flex items-center gap-1 hover:opacity-90 transition-opacity">
              <span className="text-base sm:text-2xl font-black tracking-tight text-[#5E203C]">
                Para<span className="text-[#8B263E]">Tunisie</span>
              </span>
            </Link>
            <span className="text-[9px] sm:text-[11px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full bg-[#FAF0F2] text-[#8B263E] border border-[#F3D3DB] shrink-0">
              Anti-Stress
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <a
              href="tel:+21697991266"
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-[#5E203C] bg-[#FAF7F5] hover:bg-[#F3EBE6] border border-[#E0D4CC] px-2 sm:px-3 py-1.5 rounded-full transition-colors"
            >
              <Phone className="size-3 sm:size-3.5 text-[#8B263E] shrink-0" />
              <span className="hidden sm:inline">+216 97 991 266</span>
              <span className="sm:hidden font-extrabold">Appel</span>
            </a>
            <button
              type="button"
              onClick={() => scrollToForm()}
              className="inline-flex items-center gap-1 bg-[#8B263E] hover:bg-[#5E203C] text-white font-black text-xs sm:text-sm px-2.5 sm:px-4 py-1.5 rounded-full shadow-md transition-all active:scale-95"
            >
              <span>Commander</span>
              <ArrowDown className="size-3" />
            </button>
          </div>
        </div>
      </header>

      {/* ── TOP SECTION: MOBILE FIRST LAYOUT ── */}
      {/* On mobile: 1) Product photo at top, 2) Checkout form under it, 3) Video & details below */}
      {/* On desktop: 2-column layout (Media on left col-span-7, Form on right sticky col-span-5) */}
      <main className="w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-12 overflow-x-hidden">
        <div className="w-full flex flex-col lg:grid lg:grid-cols-12 gap-5 lg:gap-8 items-start">
          
          {/* ── 1. PRODUCT PHOTO AT TOP ON MOBILE (ORDER-1 ON MOBILE, HIDDEN ON DESKTOP) ── */}
          <div className="order-1 block lg:hidden w-full">
            {renderProductPhotoCard()}
          </div>

          {/* ── 2. DIRECT CHECKOUT FORM (ORDER-2 ON MOBILE, ORDER-2 ON DESKTOP) ── */}
          <div ref={formTopRef} className="order-2 lg:order-2 w-full min-w-0 max-w-full lg:col-span-5 lg:sticky lg:top-20 space-y-3 sm:space-y-4">
            <div className="w-full bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-7 border-2 border-[#8B263E] shadow-xl overflow-hidden">
              {orderSuccess ? (
                /* Success Screen */
                <div className="text-center py-6 space-y-4">
                  <div className="size-16 rounded-full bg-[#FAF0F2] text-[#8B263E] flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="size-10" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#5E203C]">
                    Commande confirmée avec succès ! 🎉
                  </h2>
                  <p className="text-xs sm:text-sm font-semibold text-slate-700">
                    Référence : <span className="font-black text-[#8B263E] text-base">{confirmedOrderRef}</span>
                  </p>
                  <div className="p-3.5 sm:p-4 bg-[#FCF8F6] rounded-2xl border border-[#EBDAD8] text-xs text-slate-600 space-y-1.5 text-left">
                    <p><strong>Total à payer :</strong> {confirmedTotal.toFixed(3)} DT (Produit + 10 DT Livraison Aramex)</p>
                    <p><strong>Paiement :</strong> En espèces à la livraison</p>
                    <p>Notre équipe vous contactera par téléphone pour confirmer l&apos;expédition de votre colis.</p>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/"
                      className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-[#8B263E] text-white font-bold text-xs hover:bg-[#5E203C] transition-colors"
                    >
                      Retourner à la boutique
                    </Link>
                  </div>
                </div>
              ) : (
                /* Top Direct Form */
                <div className="w-full">
                  {/* Header info */}
                  <div className="border-b border-[#F0EBE6] pb-3 sm:pb-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF0F2] text-[#8B263E] border border-[#F3D3DB] text-[10px] sm:text-xs font-extrabold uppercase tracking-wider mb-1.5">
                      <Sparkles className="size-3 sm:size-3.5" />
                      Commande Express
                    </div>
                    <h1 className="text-lg sm:text-2xl font-black text-[#5E203C] leading-snug">
                      PACK ANTI-STRESS
                    </h1>
                    <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 sm:mt-1">
                      Retrouvez votre équilibre au quotidien avec le duo Magnésium B6 et Ashwagandha.
                    </p>
                  </div>

                  {apiError && (
                    <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="size-4 shrink-0 text-rose-600" />
                      <span>{apiError}</span>
                    </div>
                  )}

                  {/* 3 Formule Cards */}
                  <div className="mt-3 space-y-2">
                    <label className="block text-xs font-extrabold text-[#5E203C]">
                      1. Choisissez votre offre :
                    </label>

                    {/* Duo Pack Option */}
                    <div
                      onClick={() => setSelectedOption("BOTH")}
                      className={`relative rounded-2xl p-2.5 sm:p-3.5 transition-all cursor-pointer border-2 ${
                        selectedOption === "BOTH"
                          ? "bg-[#FCF8F6] border-[#8B263E] shadow-sm ring-2 ring-[#8B263E]/20"
                          : "bg-white border-[#E8DFD8] hover:border-[#8B263E]/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`size-4 sm:size-4.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            selectedOption === "BOTH" ? "border-[#8B263E] bg-[#8B263E] text-white" : "border-slate-300"
                          }`}>
                            {selectedOption === "BOTH" && <Check className="size-2.5 sm:size-3 stroke-[3]" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="font-extrabold text-xs sm:text-sm text-[#5E203C] truncate">Pack Duo Anti-Stress</span>
                              <span className="bg-[#8B263E] text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase shrink-0">
                                Top Choix
                              </span>
                            </div>
                            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">Magnésium B6 + Ashwagandha</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] text-slate-400 line-through">184 DT</p>
                          <p className="text-sm sm:text-base font-black text-[#8B263E]">159 DT</p>
                        </div>
                      </div>
                    </div>

                    {/* Magnesium Option */}
                    <div
                      onClick={() => setSelectedOption("MAGNESIUM")}
                      className={`rounded-2xl p-2 sm:p-3 transition-all cursor-pointer border-2 ${
                        selectedOption === "MAGNESIUM"
                          ? "bg-[#FCF8F6] border-[#8B263E] shadow-sm ring-2 ring-[#8B263E]/20"
                          : "bg-white border-[#E8DFD8] hover:border-[#8B263E]/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`size-4 sm:size-4.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            selectedOption === "MAGNESIUM" ? "border-[#8B263E] bg-[#8B263E] text-white" : "border-slate-300"
                          }`}>
                            {selectedOption === "MAGNESIUM" && <Check className="size-2.5 sm:size-3 stroke-[3]" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-xs sm:text-sm text-[#5E203C] truncate">Magnésium + B6 seul</p>
                            <p className="text-[10px] text-slate-500 font-medium truncate">90 comprimés Muscle Care</p>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm font-black text-[#5E203C] shrink-0">{formatPrice(magPrice)}</p>
                      </div>
                    </div>

                    {/* Ashwagandha Option */}
                    <div
                      onClick={() => setSelectedOption("ASHWAGANDHA")}
                      className={`rounded-2xl p-2 sm:p-3 transition-all cursor-pointer border-2 ${
                        selectedOption === "ASHWAGANDHA"
                          ? "bg-[#FCF8F6] border-[#8B263E] shadow-sm ring-2 ring-[#8B263E]/20"
                          : "bg-white border-[#E8DFD8] hover:border-[#8B263E]/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`size-4 sm:size-4.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            selectedOption === "ASHWAGANDHA" ? "border-[#8B263E] bg-[#8B263E] text-white" : "border-slate-300"
                          }`}>
                            {selectedOption === "ASHWAGANDHA" && <Check className="size-2.5 sm:size-3 stroke-[3]" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-xs sm:text-sm text-[#5E203C] truncate">Ashwagandha seul</p>
                            <p className="text-[10px] text-slate-500 font-medium truncate">60 gélules BioTechUSA</p>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm font-black text-[#5E203C] shrink-0">{formatPrice(ashPrice)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Form fields */}
                  <form onSubmit={handleConfirmOrder} className="mt-3.5 space-y-2.5">
                    <label className="block text-xs font-extrabold text-[#5E203C]">
                      2. Vos informations de livraison :
                    </label>

                    {/* Name */}
                    <div className="space-y-1">
                      <div className="relative">
                        <User className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (formErrors.fullName) setFormErrors((prev) => ({ ...prev, fullName: "" }));
                          }}
                          placeholder="Nom et prénom *"
                          className={`w-full pl-9 pr-3 py-2.5 rounded-xl border bg-white text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B263E]/20 focus:border-[#8B263E] transition-all ${
                            formErrors.fullName ? "border-rose-400 bg-rose-50/30" : "border-[#D8CFC0]"
                          }`}
                        />
                      </div>
                      {formErrors.fullName && <p className="text-[10px] font-bold text-rose-600">{formErrors.fullName}</p>}
                    </div>

                    {/* Phone */}
                    <div className="space-y-1">
                      <div className="relative">
                        <Phone className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          inputMode="numeric"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: "" }));
                          }}
                          placeholder="Numéro de téléphone (+216) *"
                          className={`w-full pl-9 pr-3 py-2.5 rounded-xl border bg-white text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B263E]/20 focus:border-[#8B263E] transition-all ${
                            formErrors.phone ? "border-rose-400 bg-rose-50/30" : "border-[#D8CFC0]"
                          }`}
                        />
                      </div>
                      {formErrors.phone && <p className="text-[10px] font-bold text-rose-600">{formErrors.phone}</p>}
                    </div>

                    {/* Governorate */}
                    <div className="space-y-1">
                      <div className="relative">
                        <MapPin className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <select
                          required
                          value={gouvernorat}
                          onChange={(e) => {
                            setGouvernorat(e.target.value);
                            if (formErrors.gouvernorat) setFormErrors((prev) => ({ ...prev, gouvernorat: "" }));
                          }}
                          className={`w-full pl-9 pr-8 py-2.5 rounded-xl border bg-white text-xs sm:text-sm font-semibold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#8B263E]/20 focus:border-[#8B263E] transition-all ${
                            formErrors.gouvernorat ? "border-rose-400 bg-rose-50/30" : "border-[#D8CFC0]"
                          }`}
                        >
                          <option value="">Gouvernorat *</option>
                          {GOUVERNORATS.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="size-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      {formErrors.gouvernorat && (
                        <p className="text-[10px] font-bold text-rose-600">{formErrors.gouvernorat}</p>
                      )}
                    </div>

                    {/* Address */}
                    <div className="space-y-1">
                      <div className="relative">
                        <FileText className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => {
                            setAddress(e.target.value);
                            if (formErrors.address) setFormErrors((prev) => ({ ...prev, address: "" }));
                          }}
                          placeholder="Adresse détaillée (Ville, rue...) *"
                          className={`w-full pl-9 pr-3 py-2.5 rounded-xl border bg-white text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B263E]/20 focus:border-[#8B263E] transition-all ${
                            formErrors.address ? "border-rose-400 bg-rose-50/30" : "border-[#D8CFC0]"
                          }`}
                        />
                      </div>
                      {formErrors.address && <p className="text-[10px] font-bold text-rose-600">{formErrors.address}</p>}
                    </div>

                    {/* Recap & Total */}
                    <div className="bg-[#FAF7F5] p-3 rounded-2xl border border-[#E8DFD8] space-y-1.5 pt-2.5">
                      <div className="flex justify-between text-xs text-slate-600 font-medium">
                        <span>Sous-total produit :</span>
                        <span className="font-bold text-slate-900">{formatPrice(subtotalMillimes)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600 font-medium">
                        <span>Livraison express Aramex :</span>
                        <span className="font-bold text-[#8B263E]">{formatPrice(shippingFeeMillimes)}</span>
                      </div>
                      <div className="pt-1.5 border-t border-[#E8DFD8] flex justify-between items-baseline">
                        <span className="text-xs font-black text-[#5E203C]">TOTAL À PAYER :</span>
                        <span className="text-lg sm:text-xl font-black text-[#8B263E]">{formatPrice(totalMillimes)}</span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 sm:py-3.5 px-4 rounded-xl bg-[#8B263E] hover:bg-[#5E203C] text-white font-black text-sm sm:text-base shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span>Validation en cours...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="size-5" />
                          <span>Confirmer ma commande ({formatPrice(totalMillimes)})</span>
                        </>
                      )}
                    </button>

                    <p className="text-center text-[10px] text-slate-500 font-medium pt-1">
                      🔒 Paiement 100% en espèces à la livraison • Expédition sous 24-48h
                    </p>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* ── 3. LEFT COLUMN: VISUAL MEDIA & VIDEO (ORDER-3 ON MOBILE, ORDER-1 ON DESKTOP) ── */}
          <div className="order-3 lg:order-1 w-full lg:col-span-7 space-y-5 sm:space-y-6">
            {/* Main Product Presentation Card on Desktop */}
            <div className="hidden lg:block w-full">
              {renderProductPhotoCard()}
            </div>

            {/* PROMOTIONAL VIDEO */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#E8DFD8] shadow-sm space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-[#8B263E] bg-[#FAF0F2] px-2.5 py-0.5 rounded-full border border-[#F3D3DB]">
                    Vidéo explicative
                  </span>
                  <h3 className="text-sm sm:text-lg font-black text-[#5E203C] mt-1">
                    Découvrez le Pack Anti-Stress en action
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => scrollToForm()}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#8B263E] hover:underline"
                >
                  <span>Commander</span>
                  <ArrowDown className="size-3" />
                </button>
              </div>

              {/* Vertical Video Frame */}
              <div className="relative mx-auto max-w-[300px] sm:max-w-[360px] rounded-2xl overflow-hidden shadow-md border-2 border-[#FAF0F2] bg-black">
                <video
                  ref={videoRef}
                  src="/assets/pack-anti-stress.mp4"
                  poster="/assets/pack-anti-stress-poster.jpg"
                  playsInline
                  preload="metadata"
                  controls
                  className="w-full h-auto aspect-[9/16] object-cover"
                />
              </div>
            </div>

            {/* Trust Highlights Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-[#E8DFD8] text-center">
                <ShieldCheck className="size-5 text-[#8B263E] mx-auto mb-1" />
                <p className="text-[11px] sm:text-xs font-bold text-[#5E203C]">100% Authentique</p>
                <p className="text-[9px] sm:text-[10px] text-slate-500">Marques certifiées</p>
              </div>
              <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-[#E8DFD8] text-center">
                <Truck className="size-5 text-[#8B263E] mx-auto mb-1" />
                <p className="text-[11px] sm:text-xs font-bold text-[#5E203C]">Livraison Aramex</p>
                <p className="text-[9px] sm:text-[10px] text-slate-500">24–48h en Tunisie</p>
              </div>
              <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-[#E8DFD8] text-center">
                <Lock className="size-5 text-[#8B263E] mx-auto mb-1" />
                <p className="text-[11px] sm:text-xs font-bold text-[#5E203C]">Paiement à la livraison</p>
                <p className="text-[9px] sm:text-[10px] text-slate-500">En espèces au livreur</p>
              </div>
              <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-[#E8DFD8] text-center">
                <CheckCircle2 className="size-5 text-[#8B263E] mx-auto mb-1" />
                <p className="text-[11px] sm:text-xs font-bold text-[#5E203C]">En Stock Réel</p>
                <p className="text-[9px] sm:text-[10px] text-slate-500">Expédition du jour</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── BENEFITS & SCIENTIFIC SYNERGY SECTION ── */}
        <section className="mt-8 sm:mt-12 max-w-5xl mx-auto space-y-6 sm:space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[10px] sm:text-xs uppercase tracking-widest font-black text-[#8B263E] bg-[#FAF0F2] px-3.5 py-1 rounded-full border border-[#F3D3DB]">
              Synergie Scientifique
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-[#5E203C] mt-2">
              Pourquoi associer Magnésium et Ashwagandha ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Chaque composant cible des mécanismes complémentaires pour une action globale jour et nuit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8DFD8] shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-9 sm:size-10 rounded-2xl bg-[#FAF0F2] text-[#8B263E] flex items-center justify-center font-black text-sm">
                  Mg
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#5E203C]">Magnésium + Vitamine B6</h3>
                  <p className="text-[11px] sm:text-xs text-slate-500">Muscle Care • 90 comprimés</p>
                </div>
              </div>
              <ul className="text-xs sm:text-sm text-slate-700 space-y-2 font-medium">
                <li className="flex items-start gap-2">
                  <Check className="size-4 text-[#8B263E] shrink-0 mt-0.5" />
                  <span><strong>Réduction de la fatigue :</strong> contribue au métabolisme énergétique normal.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="size-4 text-[#8B263E] shrink-0 mt-0.5" />
                  <span><strong>Fonction musculaire optimale :</strong> aide à prévenir les crampes et tensions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="size-4 text-[#8B263E] shrink-0 mt-0.5" />
                  <span><strong>Équilibre nerveux :</strong> la B6 potentialise l&apos;action du magnésium dans les cellules.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8DFD8] shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-9 sm:size-10 rounded-2xl bg-[#FAF0F2] text-[#8B263E] flex items-center justify-center font-black text-sm">
                  🌿
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#5E203C]">Ashwagandha BioTechUSA</h3>
                  <p className="text-[11px] sm:text-xs text-slate-500">Plante adaptogène • 60 gélules</p>
                </div>
              </div>
              <ul className="text-xs sm:text-sm text-slate-700 space-y-2 font-medium">
                <li className="flex items-start gap-2">
                  <Check className="size-4 text-[#8B263E] shrink-0 mt-0.5" />
                  <span><strong>Plante adaptogène majeure :</strong> soutient la résistance de l&apos;organisme au stress.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="size-4 text-[#8B263E] shrink-0 mt-0.5" />
                  <span><strong>Sérénité et clarté mentale :</strong> apaise l&apos;esprit sans provoquer de somnolence.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="size-4 text-[#8B263E] shrink-0 mt-0.5" />
                  <span><strong>Sommeil profond et réparateur :</strong> favorise une récupération nocturne optimale.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* ── STICKY BOTTOM MOBILE ORDER BAR ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E8DFD8] px-2 py-2 shadow-2xl safe-area-pb">
        <div className="flex items-center justify-between gap-1.5 w-full max-w-md mx-auto">
          <div className="flex gap-0.5 bg-[#FAF7F5] p-0.5 rounded-xl border border-[#E8DFD8] shrink-0">
            <button
              type="button"
              onClick={() => setSelectedOption("BOTH")}
              className={`text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-1 rounded-lg transition-colors ${
                selectedOption === "BOTH" ? "bg-[#8B263E] text-white" : "text-slate-600"
              }`}
            >
              Pack Duo
            </button>
            <button
              type="button"
              onClick={() => setSelectedOption("MAGNESIUM")}
              className={`text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-1 rounded-lg transition-colors ${
                selectedOption === "MAGNESIUM" ? "bg-[#8B263E] text-white" : "text-slate-600"
              }`}
            >
              Mag B6
            </button>
            <button
              type="button"
              onClick={() => setSelectedOption("ASHWAGANDHA")}
              className={`text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-1 rounded-lg transition-colors ${
                selectedOption === "ASHWAGANDHA" ? "bg-[#8B263E] text-white" : "text-slate-600"
              }`}
            >
              Ashwa
            </button>
          </div>

          <div className="text-right shrink-0">
            <p className="text-[8px] sm:text-[9px] text-slate-500 font-bold leading-tight">Total :</p>
            <p className="text-xs sm:text-sm font-black text-[#8B263E] leading-none">{formatPrice(totalMillimes)}</p>
          </div>

          <button
            type="button"
            onClick={() => scrollToForm()}
            className="inline-flex items-center justify-center gap-1 bg-[#8B263E] active:bg-[#5E203C] text-white font-black text-xs px-2.5 sm:px-3.5 py-2 rounded-xl shadow-md transition-transform shrink-0"
          >
            <span>Commander</span>
            <ArrowDown className="size-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
