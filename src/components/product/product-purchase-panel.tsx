"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { BadgeCheck, Check, Heart, Minus, Plus, Truck, Wallet, Zap, X, ShoppingBag, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { formatPrice, type ProductSummary } from "@/lib/data/products";
import { createExpressOrder } from "@/lib/api/client";

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

export function ProductPurchasePanel({ product }: { product: ProductSummary }) {
  const defaultIndex = Math.max(
    0,
    product.sizes.findIndex((size) => size.label === product.size),
  );
  const [sizeIndex, setSizeIndex] = useState(defaultIndex);
  const [quantity, setQuantity] = useState(1);
  const [saved, setSaved] = useState(false);
  const [quickOrderOpen, setQuickOrderOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [orderSuccess, setOrderSuccess] = useState<{ id: string; name: string; phone: string } | null>(null);

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
  }, [addItem, product, selected.label, quantity]);

  const subtotalMillimes = selected.priceMillimes * quantity;
  const deliveryFeeMillimes = subtotalMillimes >= 99_000 ? 0 : 10_000;
  const totalMillimes = subtotalMillimes + deliveryFeeMillimes;

  const handleQuickOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setErrorMsg("Veuillez remplir tous les champs obligatoires (*)");
      return;
    }

    setSubmitting(true);

    const { order, error } = await createExpressOrder({
      userId: "guest",
      gouvernorat,
      fullAddress: `${address} (Tel: ${phone}, Nom: ${fullName})`,
      deliveryNote: note,
      items: [
        {
          productId: product.id,
          quantity,
          priceMillimes: selected.priceMillimes,
        },
      ],
    });

    setSubmitting(false);

    if (order?.id) {
      setOrderSuccess({ id: `PT-${order.id.slice(-6).toUpperCase()}`, name: fullName, phone });
    } else {
      setErrorMsg(error || "Une erreur s'est produite lors de la validation de la commande. Veuillez réessayer.");
    }
  };

  return (
    <div>
      <Link
        href={`/marques/${product.brand.toLowerCase().replace(/\s+/g, "-")}`}
        className="text-xs font-semibold tracking-[0.14em] text-primary uppercase hover:underline"
      >
        {product.brand}
      </Link>
      <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl">
        {product.name}
      </h1>
      <p className="mt-2 text-base leading-6 text-ink-muted">{product.benefit}</p>

      <p className="font-tabular mt-5 text-2xl font-semibold text-ink">
        {formatPrice(selected.priceMillimes)}
      </p>

      {product.sizes.length > 1 && (
        <div className="mt-6">
          <p className="text-sm font-medium text-ink" id="size-label">
            Format
          </p>
          <div role="radiogroup" aria-labelledby="size-label" className="mt-2 flex flex-wrap gap-2">
            {product.sizes.map((size, index) => (
              <button
                key={size.label}
                type="button"
                role="radio"
                aria-checked={index === sizeIndex}
                onClick={() => setSizeIndex(index)}
                className={`min-h-11 rounded-lg border px-4 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none ${
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

      <div className="mt-6 flex items-center gap-3">
        <p className="text-sm font-medium text-ink" id="quantity-label">
          Quantité
        </p>
        <div className="flex items-center rounded-lg border border-border bg-white">
          <button
            type="button"
            aria-label="Diminuer la quantité"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            className="flex size-11 items-center justify-center text-ink-muted transition-transform duration-100 hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:scale-90"
          >
            <Minus className="size-4" aria-hidden />
          </button>
          <span aria-labelledby="quantity-label" className="font-tabular w-8 text-center text-sm font-bold text-ink">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Augmenter la quantité"
            onClick={() => setQuantity((current) => current + 1)}
            className="flex size-11 items-center justify-center text-ink-muted transition-transform duration-100 hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:scale-90"
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      {/* Main Desktop/Tablet Purchase Buttons: Stacked Vertically */}
      <div className="mt-7 hidden flex-col gap-3 max-w-md sm:flex">
        {/* 1. Ajouter au panier */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            size="lg"
            variant={added ? "secondary" : "default"}
            onClick={handleAdd}
            className="flex-1 rounded-xl font-bold py-6 text-base shadow-xs"
          >
            {added ? <Check /> : <ShoppingBag className="size-5" />}
            {added ? "Ajouté au panier" : "Ajouter au panier"}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            aria-label={saved ? "Retirer des favoris" : "Ajouter aux favoris"}
            aria-pressed={saved}
            onClick={() => setSaved((current) => !current)}
            className="rounded-xl h-13 w-13 shrink-0"
          >
            <Heart className={saved ? "fill-primary text-primary" : ""} />
          </Button>
        </div>

        {/* 2. Acheter maintenant (Directly under Ajouter au panier) */}
        <Button
          type="button"
          size="lg"
          onClick={() => setQuickOrderOpen(true)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl py-6 text-base gap-2 shadow-md transition-all active:scale-[0.98]"
        >
          <Zap size={20} className="fill-white" />
          Acheter maintenant · {formatPrice(selected.priceMillimes * quantity)}
        </Button>
      </div>

      <ul className="mt-8 space-y-3 border-t border-border pt-6">
        {reassurance.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-3 text-sm text-ink">
            <Icon className="size-4.5 shrink-0 text-primary" aria-hidden />
            {label}
          </li>
        ))}
      </ul>

      {/* Mobile Sticky Action Bar: Stacked Vertically */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex flex-col gap-2 border-t border-border bg-white/95 p-3 backdrop-blur-md sm:hidden shadow-2xl">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            aria-label={saved ? "Retirer des favoris" : "Ajouter aux favoris"}
            aria-pressed={saved}
            onClick={() => setSaved((current) => !current)}
            className="shrink-0 rounded-xl"
          >
            <Heart className={saved ? "fill-primary text-primary" : ""} />
          </Button>
          <Button
            type="button"
            size="lg"
            variant={added ? "secondary" : "default"}
            onClick={handleAdd}
            className="flex-1 text-xs font-bold rounded-xl h-11"
          >
            {added ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
            {added ? "Ajouté au panier" : "Ajouter au panier"}
          </Button>
        </div>
        <Button
          type="button"
          size="lg"
          onClick={() => setQuickOrderOpen(true)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs gap-1.5 rounded-xl h-11 shadow-sm"
        >
          <Zap size={15} className="fill-white" />
          Acheter maintenant · {formatPrice(selected.priceMillimes * quantity)}
        </Button>
      </div>

      {/* ── Express 1-Click Order Modal Form ────────────────────────────── */}
      {quickOrderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-border max-h-[90dvh] overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                setQuickOrderOpen(false);
                setOrderSuccess(null);
                setErrorMsg("");
              }}
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
                    <Zap size={20} className="text-emerald-600 fill-emerald-600" />
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
                    className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm gap-2 shadow-md transition-all active:scale-[0.98]"
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
