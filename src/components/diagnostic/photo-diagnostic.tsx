"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Camera, Upload, ShieldCheck, AlertCircle, CheckCircle2, ShoppingBag, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { formatPrice, type ProductSummary } from "@/lib/data/products";
import { useCart } from "@/hooks/use-cart";

type DomainType = "SKIN" | "HAIR";

export function PhotoDiagnostic() {
  const [domain, setDomain] = useState<DomainType>("SKIN");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { addItem } = useCart();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image au format JPG, PNG ou WebP.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("L'image est trop volumineuse (maximum 10 Mo).");
      return;
    }

    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !consentGiven || analyzing) return;

    setAnalyzing(true);
    setError(null);

    try {
      // 1. Create a session
      const createRes = await fetch("http://localhost:3001/api/v1/diagnostic/chat/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const session = await createRes.json();

      if (!session.sessionToken) {
        throw new Error("Impossible d'initialiser la session d'analyse.");
      }

      // 2. Upload photo for OpenRouter vision analysis
      const formData = new FormData();
      formData.append("photo", selectedFile);

      const uploadRes = await fetch(`http://localhost:3001/api/v1/diagnostic/chat/${session.sessionToken}/photo`, {
        method: "POST",
        body: formData,
      });

      const data = await uploadRes.json();
      if (data && data.message) {
        setResult({
          observations: data.profile?.photoObservations || {},
          recommendation: data.message.recommendation,
          assistantText: data.message.content,
          redFlag: data.redFlag,
          redFlagReason: data.redFlagReason,
        });
      }
    } catch (err) {
      console.error("Photo analysis failed:", err);
      setError("Une erreur est survenue lors de l'analyse. Veuillez réessayer avec une autre photo.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Title & Concept Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-champagne/40 bg-brand-champagne/15 px-3 py-1 text-xs font-semibold text-primary mb-3">
          <Sparkles className="size-3.5 text-brand-champagne" />
          Analyse visuelle par IA
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-primary">Analyse beauté par photo</h1>
        <p className="mt-2 text-xs sm:text-sm text-ink-muted leading-relaxed">
          Ajoutez une photo pour obtenir une analyse cosmétique personnalisée et découvrir les produits ParaTunisie les plus adaptés à vos besoins.
        </p>
      </div>

      {!result ? (
        <div className="space-y-6">
          {/* Domain Selection Tabs */}
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            <button
              onClick={() => setDomain("SKIN")}
              className={`flex items-center justify-center gap-2 rounded-2xl border p-3.5 text-xs font-semibold transition-all ${
                domain === "SKIN"
                  ? "border-primary bg-primary text-white shadow-sm"
                  : "border-border/80 bg-white text-ink-muted hover:border-primary/40 hover:text-primary"
              }`}
            >
              <span>👤</span>
              <span>Visage & peau</span>
            </button>
            <button
              onClick={() => setDomain("HAIR")}
              className={`flex items-center justify-center gap-2 rounded-2xl border p-3.5 text-xs font-semibold transition-all ${
                domain === "HAIR"
                  ? "border-primary bg-primary text-white shadow-sm"
                  : "border-border/80 bg-white text-ink-muted hover:border-primary/40 hover:text-primary"
              }`}
            >
              <span>💇</span>
              <span>Cheveux & cuir chevelu</span>
            </button>
          </div>

          {/* Photo Dropzone Box */}
          <div className="rounded-3xl border-2 border-dashed border-border/80 bg-white p-6 sm:p-8 text-center shadow-xs">
            {previewUrl ? (
              <div className="relative mx-auto size-48 overflow-hidden rounded-2xl border border-border shadow-sm mb-4">
                <Image src={previewUrl} alt="Aperçu photo" fill className="object-cover" />
                <button
                  onClick={handleReset}
                  className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs hover:bg-black/80"
                  title="Changer de photo"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="py-4">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-champagne/20 text-primary mb-3">
                  <Camera className="size-7 text-primary" />
                </div>
                <h3 className="font-bold text-sm text-primary">
                  {domain === "SKIN" ? "Ajoutez une photo de votre visage" : "Ajoutez une photo de vos cheveux"}
                </h3>
                <p className="mt-1 text-xs text-ink-muted">Format JPG, PNG ou WebP (max 10 Mo)</p>

                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-hover active:scale-95">
                    <Upload className="size-4" />
                    <span>Choisir une photo</span>
                    <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-xs font-semibold text-primary shadow-xs hover:border-primary/40 active:scale-95 sm:hidden">
                    <Camera className="size-4" />
                    <span>Prendre une photo</span>
                    <input type="file" accept="image/*" capture="user" onChange={handleFileSelect} className="hidden" />
                  </label>
                </div>
              </div>
            )}

            {/* Photo Guidelines Box */}
            <div className="mt-6 rounded-2xl bg-soft-nude/40 p-4 text-left border border-border/40">
              <h4 className="font-semibold text-xs text-primary flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                Conseils pour une meilleure analyse :
              </h4>
              <ul className="grid gap-1.5 text-[0.75rem] text-ink-muted sm:grid-cols-2">
                <li>• Lumière naturelle si possible</li>
                <li>• Visage ou cheveux sans filtre</li>
                <li>• Photo nette et bien cadrée</li>
                <li>• Éviter les ombres trop fortes</li>
              </ul>
            </div>

            {/* Privacy & Consent Checkbox */}
            <div className="mt-4 flex items-start gap-2.5 text-left max-w-lg mx-auto">
              <input
                type="checkbox"
                id="consent-check"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-0.5 size-4 rounded-md border-border text-primary focus:ring-primary"
              />
              <label htmlFor="consent-check" className="text-[0.75rem] text-ink-muted leading-tight">
                J'accepte que ma photo soit analysée par l'IA afin de personnaliser mes recommandations cosmétiques. La photo est supprimée immédiatement après l'analyse (stockage privé sans conservation).
              </label>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || !consentGiven || analyzing}
              className="mt-6 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-primary-hover disabled:opacity-40 active:scale-95"
            >
              {analyzing ? (
                <>
                  <Loader2 className="size-4 animate-spin text-white" />
                  <span>Analyse OpenRouter Vision en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-4 text-brand-champagne" />
                  <span>Lancer l'analyse beauté</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Analysis Results Section */
        <div className="space-y-6">
          {/* Header Action */}
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <h2 className="font-serif text-xl font-bold text-primary">Votre bilan d'analyse beauté</h2>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <RefreshCw className="size-3.5" />
              <span>Refaire une analyse</span>
            </button>
          </div>

          {/* Assistant Executive Summary */}
          <div className="rounded-2xl border border-border/80 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 text-primary font-bold text-xs mb-2">
              <Sparkles className="size-4 text-brand-champagne" />
              <span>Résultat de l'analyse visuelle cosmétique</span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">{result.assistantText}</p>
          </div>

          {/* Recommendations Grid */}
          {result.recommendation && result.recommendation.products?.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-serif text-base font-bold text-primary">
                {result.recommendation.title || "Soins recommandés pour votre profil"}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {result.recommendation.products.map((prod: any) => (
                  <div key={prod.id} className="flex flex-col justify-between rounded-2xl border border-border/80 bg-white p-4 shadow-xs">
                    <div>
                      {prod.image && (
                        <div className="relative mb-3 h-32 w-full overflow-hidden rounded-xl bg-soft-nude/30">
                          <Image src={prod.image} alt={prod.name} fill className="object-contain p-2" />
                        </div>
                      )}
                      <p className="text-[0.65rem] font-bold tracking-wider uppercase text-ink-muted">{prod.brandName}</p>
                      <h4 className="font-serif text-xs font-bold text-primary line-clamp-2 mt-0.5">{prod.name}</h4>
                      <p className="mt-2 text-xs font-bold text-primary">{prod.priceDT}</p>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/produits/${prod.slug}`}
                        className="flex flex-1 items-center justify-center rounded-xl border border-border bg-white py-2 text-[0.7rem] font-semibold text-primary hover:bg-soft-nude/40"
                      >
                        Voir PDP
                      </Link>
                      <button
                        onClick={() =>
                          addItem({
                            id: prod.id,
                            slug: prod.slug,
                            name: prod.name,
                            brand: prod.brandName || "",
                            benefit: prod.description || "",
                            size: "",
                            priceMillimes: prod.priceMillimes,
                            category: prod.categoryName || "",
                            concerns: [],
                            skinTypes: [],
                            image: prod.image || "/assets/placeholder-product.webp",
                            description: prod.description || "",
                            benefits: [],
                            usage: "",
                            sizes: [],
                            routineTime: ["AM", "PM"],
                          })
                        }
                        className="flex items-center justify-center rounded-xl bg-primary px-3 text-[0.7rem] font-semibold text-white hover:bg-primary-hover"
                        title="Ajouter au panier"
                      >
                        <ShoppingBag className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cosmetic Disclaimer Box */}
          <div className="rounded-2xl bg-amber-50/60 p-4 border border-amber-200/60 text-[0.75rem] text-amber-900 leading-snug">
            💡 <strong>Avis cosmétique :</strong> Cette analyse est destinée uniquement à personnaliser le choix de vos soins cosmétiques et ne remplace pas un diagnostic médical spécialisé. En cas de douleur, lésion ou symptôme persistant, consultez un dermatologue.
          </div>
        </div>
      )}
    </div>
  );
}
