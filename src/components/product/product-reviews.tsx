"use client";

import { useState } from "react";
import { ShieldCheck, Star } from "lucide-react";

import type { ProductSummary } from "@/lib/data/products";
import type { ProductRating, PublicReview } from "@/lib/api/client";
import { ProductReviewModal } from "./product-review-modal";

/** Customer reviews of the product, with the write-a-review dialog. */
export function ProductReviews({
  product,
  reviews,
  rating,
}: {
  product: ProductSummary;
  reviews: PublicReview[];
  rating: ProductRating;
}) {
  const [open, setOpen] = useState(false);
  const button =
    "inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover cursor-pointer";

  return (
    <section aria-labelledby="reviews-title" className="mt-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="reviews-title" className="font-serif text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
          Avis clients{rating.count > 0 ? ` (${rating.count})` : ""}
        </h2>
        <button type="button" onClick={() => setOpen(true)} className={button}>
          Donner votre avis
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="mt-5 rounded-3xl bg-card p-6 ring-1 ring-border-strong/60">
          <p className="font-bold text-foreground">Aucun avis client pour le moment</p>
          <p className="mt-1 text-sm text-ink-muted">Soyez la première personne à partager votre expérience avec ce produit.</p>
        </div>
      ) : (
        <div className="mt-5 grid gap-5 lg:grid-cols-[18rem_1fr]">
          <div className="self-start rounded-3xl bg-card p-6 ring-1 ring-border-strong/60">
            <strong className="font-serif text-5xl font-extrabold text-foreground">{rating.average.toFixed(1)}</strong>
            <ReviewStars rating={Math.round(rating.average)} />
            <p className="mt-2 text-xs text-ink-muted">
              {rating.count} avis approuvé{rating.count > 1 ? "s" : ""}
            </p>
          </div>
          <div className="divide-y divide-border/60 rounded-3xl bg-card px-6 ring-1 ring-border-strong/60">
            {reviews.map((review) => (
              <article key={review.id} className="py-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-foreground">{review.user.name || "Client ParaTunisie"}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {new Intl.DateTimeFormat("fr-TN", { dateStyle: "long" }).format(new Date(review.createdAt))}
                    </p>
                  </div>
                  <ReviewStars rating={review.rating} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {review.title && <h3 className="text-sm font-bold text-foreground">{review.title}</h3>}
                  {review.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                      <ShieldCheck className="size-3" aria-hidden /> Achat vérifié
                    </span>
                  )}
                </div>
                {review.body && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-muted">{review.body}</p>}
              </article>
            ))}
          </div>
        </div>
      )}

      <ProductReviewModal
        isOpen={open}
        onClose={() => setOpen(false)}
        productId={product.id}
        productName={product.name}
        productSlug={product.slug}
      />
    </section>
  );
}

function ReviewStars({ rating }: { rating: number }) {
  return (
    <span className="mt-1 flex gap-0.5" aria-label={`${rating} étoiles sur 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`size-4 ${star <= rating ? "fill-amber-400 text-amber-400" : "fill-transparent text-border-strong"}`} />
      ))}
    </span>
  );
}
