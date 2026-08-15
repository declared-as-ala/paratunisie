import Link from "next/link";
import { Check, ShieldCheck, Star, Truck, FileText, Sparkles, Droplets, Info } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { hasConfiguredWhatsApp, whatsappHref } from "@/lib/contact";
import type { ProductSummary } from "@/lib/data/products";
import type { ProductRating, PublicReview } from "@/lib/api/client";

export function ProductTabs({
  product,
  reviews,
  rating,
}: {
  product: ProductSummary;
  reviews: PublicReview[];
  rating: ProductRating;
}) {
  return (
    <div className="mt-10 sm:mt-14">
      {/* ── Mobile Layout (< md): Stacked Sections Under Each Other ── */}
      <div className="block md:hidden space-y-8 divide-y divide-border/60">
        {/* Description Section */}
        <section className="pt-4 first:pt-0">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-ink mb-3 font-serif">
            <FileText className="size-4 text-primary shrink-0" />
            Description
          </h3>
          <p className="leading-6 text-sm text-ink-muted">{product.description || "Aucune description disponible pour ce produit."}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-border/70 bg-soft-nude/40 p-3.5 text-xs">
            <div>
              <dt className="font-semibold text-ink-muted">Catégorie</dt>
              <dd className="mt-0.5 font-bold text-ink">{product.category}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink-muted">Type de peau</dt>
              <dd className="mt-0.5 font-bold text-ink">{product.skinTypes.length ? product.skinTypes.join(", ") : "Tous types"}</dd>
            </div>
          </dl>
        </section>

        {/* Bénéfices Section */}
        {product.benefits && product.benefits.length > 0 && (
          <section className="pt-6">
            <h3 className="flex items-center gap-2 text-base font-extrabold text-ink mb-3 font-serif">
              <Sparkles className="size-4 text-primary shrink-0" />
              Bénéfices
            </h3>
            <ul className="grid gap-2.5">
              {product.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2 text-xs font-medium text-ink">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
                  {benefit}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Utilisation Section */}
        {product.usage && (
          <section className="pt-6">
            <h3 className="flex items-center gap-2 text-base font-extrabold text-ink mb-3 font-serif">
              <Droplets className="size-4 text-primary shrink-0" />
              Conseils d&apos;utilisation
            </h3>
            <p className="leading-6 text-sm text-ink-muted">{product.usage}</p>
          </section>
        )}

        {/* Composition Section */}
        <section className="pt-6">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-ink mb-3 font-serif">
            <Info className="size-4 text-primary shrink-0" />
            Composition &amp; Ingrédients
          </h3>
          <p className="leading-6 text-xs text-ink-muted">
            La liste complète des ingrédients (INCI) figure sur l&apos;emballage du produit. Pour toute question sur la composition avant votre achat,{" "}
            {hasConfiguredWhatsApp ? (
              <a href={whatsappHref} className="text-primary font-bold underline-offset-4 hover:underline">
                contactez notre équipe sur WhatsApp
              </a>
            ) : (
              <a href={whatsappHref} className="text-primary font-bold underline-offset-4 hover:underline">
                contactez notre équipe
              </a>
            )}
            .
          </p>
        </section>

        {/* Livraison & Retours Section */}
        <section className="pt-6">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-ink mb-3 font-serif">
            <Truck className="size-4 text-primary shrink-0" />
            Livraison &amp; Retours
          </h3>
          <ul className="space-y-2 text-xs leading-5 text-ink-muted">
            <li className="flex items-center gap-2">
              <Check className="size-3.5 text-emerald-600 shrink-0" />
              Livraison partout en Tunisie sous 24h/48h.
            </li>
            <li className="flex items-center gap-2">
              <Check className="size-3.5 text-emerald-600 shrink-0" />
              Livraison OFFERTE dès 99 DT de commande.
            </li>
            <li className="flex items-center gap-2">
              <Check className="size-3.5 text-emerald-600 shrink-0" />
              Paiement en espèces à la livraison.
            </li>
          </ul>
        </section>

        {/* Avis Clients Section */}
        <section className="pt-6">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-ink mb-3 font-serif">
            <Star className="size-4 text-amber-500 fill-amber-500 shrink-0" />
            Avis Clients{rating.count > 0 ? ` (${rating.count})` : ""}
          </h3>

          {reviews.length === 0 ? (
            <div className="rounded-xl border border-border/80 bg-soft-nude/50 p-4 text-xs">
              <p className="font-bold text-ink">Aucun avis client pour le moment</p>
              <p className="mt-1 text-ink-muted">Soyez le premier à partager votre avis sur ce soin.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-soft-nude/60 p-4">
                <strong className="text-2xl text-ink font-black">{rating.average.toFixed(1)}</strong>
                <div>
                  <ReviewStars rating={Math.round(rating.average)} />
                  <p className="mt-0.5 text-[0.6875rem] text-ink-muted">{rating.count} avis approuvé{rating.count > 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="divide-y divide-border/60 rounded-xl border border-border bg-white px-4">
                {reviews.map((review) => (
                  <article key={review.id} className="py-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-xs text-ink">{review.user.name || "Client ParaTunisie"}</p>
                        <p className="text-[0.625rem] text-ink-muted">{new Intl.DateTimeFormat("fr-TN", { dateStyle: "long" }).format(new Date(review.createdAt))}</p>
                      </div>
                      <ReviewStars rating={review.rating} />
                    </div>
                    {review.title && <h4 className="mt-2 font-bold text-xs text-ink">{review.title}</h4>}
                    {review.verified && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[0.625rem] font-bold text-emerald-700">
                        <ShieldCheck className="size-3" /> Achat vérifié
                      </span>
                    )}
                    {review.body && <p className="mt-1.5 whitespace-pre-wrap text-xs leading-5 text-ink-muted">{review.body}</p>}
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ── Desktop Layout (>= md): Horizontal Tabbed Navigation ── */}
      <Tabs defaultValue="description" className="hidden md:block">
        <TabsList variant="line" className="w-full justify-start border-b border-border">
          <TabsTrigger value="description">Description</TabsTrigger>
          {product.benefits && product.benefits.length > 0 && <TabsTrigger value="benefits">Bénéfices</TabsTrigger>}
          {product.usage && <TabsTrigger value="usage">Utilisation</TabsTrigger>}
          <TabsTrigger value="composition">Composition</TabsTrigger>
          <TabsTrigger value="delivery">Livraison &amp; retours</TabsTrigger>
          <TabsTrigger value="reviews">Avis{rating.count > 0 ? ` (${rating.count})` : ""}</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="pt-6">
          <p className="max-w-2xl leading-7 text-ink">{product.description || "Aucune description disponible pour ce produit."}</p>
          <dl className="mt-6 grid max-w-md grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-ink-muted">Catégorie</dt>
              <dd className="mt-0.5 text-ink">{product.category}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Type de peau</dt>
              <dd className="mt-0.5 text-ink">{product.skinTypes.length ? product.skinTypes.join(", ") : "Tous types"}</dd>
            </div>
          </dl>
        </TabsContent>

        {product.benefits && product.benefits.length > 0 && (
          <TabsContent value="benefits" className="pt-6">
            <ul className="grid max-w-2xl gap-3 sm:grid-cols-2">
              {product.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2.5 text-sm text-ink">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  {benefit}
                </li>
              ))}
            </ul>
          </TabsContent>
        )}

        {product.usage && (
          <TabsContent value="usage" className="pt-6">
            <p className="max-w-2xl leading-7 text-ink">{product.usage}</p>
          </TabsContent>
        )}

        <TabsContent value="composition" className="pt-6">
          <p className="max-w-2xl leading-7 text-ink-muted">
            La liste complète des ingrédients (INCI) figure sur l&apos;emballage du produit. Pour toute question sur la composition avant votre achat,{" "}
            {hasConfiguredWhatsApp ? (
              <a href={whatsappHref} className="text-primary underline-offset-4 hover:underline font-medium">
                contactez notre équipe sur WhatsApp
              </a>
            ) : (
              <a href={whatsappHref} className="text-primary underline-offset-4 hover:underline font-medium">
                contactez notre équipe
              </a>
            )}
            .
          </p>
        </TabsContent>

        <TabsContent value="delivery" className="pt-6">
          <ul className="max-w-2xl space-y-3 text-sm leading-6 text-ink">
            <li>Livraison partout en Tunisie, avec livraison offerte dès 99 DT de commande.</li>
            <li>Paiement à la livraison disponible.</li>
            <li>
              Une question sur une commande en cours ? Consultez notre{" "}
              <Link href="/aide" className="text-primary underline-offset-4 hover:underline">
                page d&apos;aide
              </Link>
              .
            </li>
          </ul>
        </TabsContent>

        <TabsContent value="reviews" className="pt-6">
          {reviews.length === 0 ? (
            <div className="max-w-xl rounded-xl border border-border bg-soft-nude p-6">
              <p className="font-medium text-ink">Aucun avis client pour le moment</p>
              <p className="mt-2 text-sm leading-6 text-ink-muted">Soyez la première personne à partager votre expérience avec ce produit.</p>
            </div>
          ) : (
            <div className="max-w-3xl space-y-5">
              <div className="flex items-center gap-4 rounded-xl border border-border bg-soft-nude p-5">
                <strong className="text-3xl text-ink">{rating.average.toFixed(1)}</strong>
                <div>
                  <ReviewStars rating={Math.round(rating.average)} />
                  <p className="mt-1 text-xs text-ink-muted">{rating.count} avis approuvé{rating.count > 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="divide-y divide-border rounded-xl border border-border bg-white px-5">
                {reviews.map((review) => (
                  <article key={review.id} className="py-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-ink">{review.user.name || "Client ParaTunisie"}</p>
                        <p className="mt-0.5 text-xs text-ink-muted">{new Intl.DateTimeFormat("fr-TN", { dateStyle: "long" }).format(new Date(review.createdAt))}</p>
                      </div>
                      <ReviewStars rating={review.rating} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {review.title && <h3 className="font-semibold text-ink">{review.title}</h3>}
                      {review.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                          <ShieldCheck className="size-3" /> Achat vérifié
                        </span>
                      )}
                    </div>
                    {review.body && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-muted">{review.body}</p>}
                  </article>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReviewStars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${rating} étoiles sur 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`size-4 ${star <= rating ? "fill-amber-400 text-amber-400" : "fill-transparent text-border"}`}
        />
      ))}
    </span>
  );
}
