"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";

type Info = { status: "valid" | "used" | "expired"; product: { name: string; slug: string; image: string | null; brand: string | null } | null };

/**
 * Review form opened from a private link (one per real order line). It only reaches the API with that secret token, which is
 * what ties the review to a genuine purchase. Wording is neutral on purpose: no incentive, no request for a positive rating.
 */
export function ReviewForm({ token }: { token: string }) {
  const [info, setInfo] = useState<Info | null>(null);
  const [loadError, setLoadError] = useState("");
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  useEffect(() => {
    let alive = true;
    fetch(`/api/v1/reviews/invitation/${encodeURIComponent(token)}`, { signal: AbortSignal.timeout(20000) })
      .then(async (res) => { if (!res.ok) throw new Error("invalid"); return (await res.json()) as Info; })
      .then((data) => { if (alive) setInfo(data); })
      .catch(() => { if (alive) setLoadError("Ce lien d'avis est invalide ou a expiré."); });
    return () => { alive = false; };
  }, [token]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (rating < 1) { setError("Choisissez une note de 1 à 5."); return; }
    setSending(true);
    try {
      const res = await fetch(`/api/v1/reviews/invitation/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, title, body }),
        signal: AbortSignal.timeout(20000),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(Array.isArray(json?.message) ? json.message.join(" ") : json?.message || "Envoi impossible. Réessayez.");
      setDone(json.message || "Merci ! Votre avis a bien été reçu.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Envoi impossible. Réessayez.");
    } finally {
      setSending(false);
    }
  }

  if (loadError) return <p role="alert" className="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-900">{loadError}</p>;
  if (!info) return <p role="status" className="text-sm text-ink-muted">Chargement…</p>;
  if (done) return <div role="status" className="rounded-2xl border border-border bg-white p-6 text-center"><h1 className="font-serif text-2xl font-semibold text-ink">Merci pour votre avis</h1><p className="mt-2 text-sm text-ink-muted">{done}</p></div>;
  if (info.status !== "valid") {
    return <p role="alert" className="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-900">{info.status === "used" ? "Vous avez déjà donné votre avis pour ce produit. Merci !" : "Ce lien d'avis a expiré."}</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-6 rounded-2xl border border-border bg-white p-5 shadow-2xs sm:p-8" noValidate>
      <header className="flex items-center gap-4">
        {info.product?.image ? <Image src={info.product.image} alt="" width={72} height={72} className="size-[72px] rounded-xl bg-primary-soft/50 object-contain p-1" /> : null}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Votre avis sur</p>
          <h1 className="font-serif text-xl font-semibold leading-snug text-ink">{info.product?.name}</h1>
          {info.product?.brand ? <p className="text-xs text-ink-muted">{info.product.brand}</p> : null}
        </div>
      </header>

      <fieldset>
        <legend className="text-sm font-bold text-ink">Votre note</legend>
        <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Note de 1 à 5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} sur 5`} onClick={() => setRating(n)}
              className="flex size-11 items-center justify-center rounded-full text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              <Star className={`size-7 ${n <= rating ? "fill-primary" : ""}`} aria-hidden />
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="review-title" className="text-sm font-bold text-ink">Titre <span className="font-normal text-ink-muted">(facultatif)</span></label>
        <input id="review-title" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-border px-3 text-sm focus-visible:outline-2 focus-visible:outline-primary" />
      </div>
      <div>
        <label htmlFor="review-body" className="text-sm font-bold text-ink">Votre commentaire <span className="font-normal text-ink-muted">(facultatif, 15 caractères minimum)</span></label>
        <textarea id="review-body" value={body} maxLength={2000} rows={5} onChange={(e) => setBody(e.target.value)} className="mt-1.5 w-full rounded-lg border border-border p-3 text-sm focus-visible:outline-2 focus-visible:outline-primary" />
        <p className="mt-1 text-xs text-ink-muted">Décrivez votre expérience avec le produit. Les liens, adresses e-mail et numéros de téléphone ne sont pas acceptés.</p>
      </div>

      {error ? <p role="alert" className="text-sm font-semibold text-red-700">{error}</p> : null}
      <button type="submit" disabled={sending} className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
        {sending ? "Envoi…" : "Envoyer mon avis"}
      </button>
      <p className="text-xs leading-relaxed text-ink-muted">Votre avis sera publié après vérification par notre équipe, qu&apos;il soit positif ou négatif. Aucune récompense n&apos;est liée à la note donnée.</p>
    </form>
  );
}
