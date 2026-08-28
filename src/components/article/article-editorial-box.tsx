import * as React from "react";
import Link from "next/link";
import { AlertTriangle, BookOpen, CheckCircle2, ShieldCheck, Sparkles, UserCheck } from "lucide-react";

export function ArticleTakeawayBox({ points }: { points: string[] }) {
  if (!points || points.length === 0) return null;

  return (
    <aside
      aria-label="Points essentiels à retenir"
      className="my-6 rounded-2xl border border-primary/20 bg-linear-to-br from-primary/10 via-primary/5 to-white p-5 sm:p-6 shadow-xs"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="size-4 text-primary" />
        <h3 className="font-serif text-base font-bold text-ink sm:text-lg">
          À retenir en bref
        </h3>
      </div>
      <ul className="space-y-2 text-xs sm:text-sm text-ink leading-relaxed">
        {points.map((pt, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
            <span>{pt}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function ArticleDisclaimerBox() {
  return (
    <aside
      aria-label="Avertissement médical et informations réglementaires"
      className="my-8 rounded-2xl border border-amber-200/80 bg-amber-50/50 p-5 sm:p-6 text-amber-950 text-xs sm:text-sm leading-relaxed"
    >
      <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold font-serif text-sm">
        <AlertTriangle className="size-4 text-amber-700" />
        Avertissement Médical & Réglementaire
      </div>
      <p>
        Les conseils et informations partagés dans ce guide sont délivrés à titre purement informatif et éducatif. Ils ne se substituent en aucun cas à un diagnostic, un suivi médical personnalisé ou une prescription de professionnel de santé. Les compléments alimentaires doivent être consommés dans le cadre d’un mode de vie équilibré et d’une alimentation variée.
      </p>
      <div className="mt-2 text-[11px] text-amber-800">
        Pour en savoir plus sur notre rigueur d’information :{" "}
        <Link href="/politique-editoriale" className="underline font-semibold hover:text-amber-950">
          Consulter notre politique éditoriale
        </Link>
        .
      </div>
    </aside>
  );
}

export function ArticleSourcesBox({ sources }: { sources: { title: string; url?: string; org?: string }[] }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="my-8 rounded-2xl border border-border/80 bg-white p-5 sm:p-6 shadow-xs">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="size-4 text-ink-muted" />
        <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-ink">
          Sources & Références Scientifiques
        </h3>
      </div>
      <ul className="space-y-2 text-xs text-ink-muted leading-relaxed">
        {sources.map((s, idx) => (
          <li key={idx} className="flex items-baseline gap-2">
            <span className="font-mono text-[10px] text-primary font-bold">[{idx + 1}]</span>
            <div>
              <span className="font-medium text-ink">{s.title}</span>
              {s.org && <span className="italic text-ink-muted"> — {s.org}</span>}
              {s.url && (
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="ml-1.5 text-primary hover:underline text-[11px]"
                >
                  [Consulter]
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ArticleEditorialAuthorBox({
  publishedAt,
  updatedAt,
  authorName = "Équipe éditoriale ParaTunisie",
  reviewerName,
}: {
  publishedAt?: string;
  updatedAt?: string;
  authorName?: string;
  reviewerName?: string;
}) {
  return (
    <div className="mt-10 rounded-2xl border border-border/80 bg-soft-nude/30 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-white font-serif font-bold text-lg">
          P
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Rédigé par
          </p>
          <p className="font-serif font-bold text-sm text-ink">{authorName}</p>
          {reviewerName && (
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
              ✓ Revue scientifique : {reviewerName}
            </p>
          )}
        </div>
      </div>

      <div className="text-xs text-ink-muted sm:text-right border-t sm:border-t-0 border-border/60 pt-3 sm:pt-0 w-full sm:w-auto">
        {publishedAt && (
          <p>
            Publié le :{" "}
            <time dateTime={publishedAt}>
              {new Date(publishedAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          </p>
        )}
        {updatedAt && updatedAt !== publishedAt && (
          <p className="text-[11px] text-ink-muted mt-0.5">
            Dernière mise à jour :{" "}
            <time dateTime={updatedAt}>
              {new Date(updatedAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          </p>
        )}
      </div>
    </div>
  );
}
