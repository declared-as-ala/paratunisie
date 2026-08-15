"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Info, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccountAuthShell } from "./account-auth-shell";
import { PasswordField } from "./password-field";

export function AccountPage() {
  const [notice, setNotice] = React.useState(false);

  const handleSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(true);
  }, []);

  return (
    <AccountAuthShell
      eyebrow="Connexion"
      title="Heureuse de vous revoir."
      description="Retrouvez vos commandes, vos favoris et vos recommandations de soin dans un espace pensé pour vous."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-ink">
            Adresse e-mail
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="vous@exemple.com"
            required
            className="mt-2 h-12 rounded-xl bg-background/70 px-4 text-base placeholder:text-ink-faint focus-visible:border-primary focus-visible:ring-primary/15 md:text-sm"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-4">
            <span className="sr-only">Mot de passe</span>
            <Link href="/compte/mdp-oublie" className="ml-auto text-xs font-semibold text-primary underline-offset-4 hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
          <PasswordField
            id="password"
            name="password"
            label="Mot de passe"
            placeholder="Votre mot de passe"
            autoComplete="current-password"
            required
          />
        </div>

        {notice && (
          <div role="status" className="flex gap-2.5 rounded-xl border border-info/20 bg-info-bg px-3.5 py-3 text-sm leading-5 text-info">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            La connexion client sera disponible prochainement. Vous pouvez continuer à explorer la boutique.
          </div>
        )}

        <Button type="submit" size="lg" className="group h-12 w-full rounded-xl font-semibold shadow-lg shadow-primary/15">
          Se connecter
          <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Button>
      </form>

      <div className="mt-7 flex flex-col items-center justify-between gap-3 rounded-xl border border-border bg-background/65 px-4 py-3.5 text-sm sm:flex-row">
        <p className="text-ink-muted">Première visite chez ParaTunisie ?</p>
        <Link href="/compte/inscription" className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline">
          <LockKeyhole className="size-4" aria-hidden="true" />
          Créer un compte
        </Link>
      </div>
    </AccountAuthShell>
  );
}
