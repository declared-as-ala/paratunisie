"use client";

import { Sparkles, ShieldCheck, DollarSign, Heart, Camera } from "lucide-react";

interface ProfileSummaryProps {
  profile: any;
  onReset: () => void;
}

export function ProfileSummary({ profile, onReset }: ProfileSummaryProps) {
  if (!profile) return null;

  const budgetDT = profile.budgetMaxMillimes ? `${(profile.budgetMaxMillimes / 1000).toFixed(0)} DT` : "Non spécifié";

  return (
    <div className="rounded-2xl border border-border/80 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <h3 className="flex items-center gap-2 font-serif text-base font-semibold text-primary">
          <Sparkles className="size-4 text-brand-gold" />
          Votre Profil Beauté
        </h3>
        <button onClick={onReset} className="text-xs text-ink-muted underline hover:text-primary transition-colors">
          Nouveau diagnostic
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3 text-xs">
        {/* Domain */}
        <div className="flex items-center justify-between">
          <span className="text-ink-muted">Domaine</span>
          <span className="font-semibold text-ink">{profile.domain === "HAIR" ? "Cheveux & Cuir chevelu" : "Visage & Peau"}</span>
        </div>

        {/* Skin Type */}
        {profile.skinType && (
          <div className="flex items-center justify-between">
            <span className="text-ink-muted">Type de peau</span>
            <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 font-semibold text-primary capitalize">
              {profile.skinType}
            </span>
          </div>
        )}

        {/* Priority Needs */}
        {profile.needs && profile.needs.length > 0 && (
          <div>
            <span className="text-ink-muted block mb-1">Priorités identifiées</span>
            <div className="flex flex-wrap gap-1">
              {profile.needs.map((need: string, i: number) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-md bg-soft-nude/70 px-2 py-0.5 text-[0.7rem] font-medium text-ink">
                  <Heart className="size-2.5 text-primary" />
                  {need}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Budget */}
        <div className="flex items-center justify-between">
          <span className="text-ink-muted flex items-center gap-1">
            <DollarSign className="size-3 text-emerald-600" /> Budget souhaité
          </span>
          <span className="font-semibold text-ink">{budgetDT}</span>
        </div>

        {/* Photo Analysis Badge */}
        {profile.photoObservations && (
          <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5 text-[0.75rem] text-emerald-900 flex items-center gap-2">
            <Camera className="size-4 text-emerald-600 shrink-0" />
            <span>Analyse photo visuelle associée au profil</span>
          </div>
        )}
      </div>

      <div className="mt-5 border-t border-border/40 pt-3 text-[0.7rem] text-ink-muted flex items-center gap-1.5">
        <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
        <span>Produits actuellement publiés dans le catalogue ParaTunisie</span>
      </div>
    </div>
  );
}
