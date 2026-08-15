"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccountAuthShell } from "./account-auth-shell";
import { PasswordField } from "./password-field";

export function SignupPage() {
  const [message, setMessage] = React.useState<{ type: "error" | "info"; text: string } | null>(null);

  const handleSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmPassword") ?? "");

    if (password.length < 8) {
      setMessage({ type: "error", text: "Votre mot de passe doit contenir au moins 8 caractères." });
      return;
    }
    if (password !== confirmation) {
      setMessage({ type: "error", text: "Les deux mots de passe ne correspondent pas." });
      return;
    }
    setMessage({ type: "info", text: "La création de compte sera disponible prochainement. Merci pour votre intérêt." });
  }, []);

  return (
    <AccountAuthShell
      eyebrow="Créer un compte"
      title="Votre espace beauté commence ici."
      description="Créez votre profil pour commander plus vite et retrouver tout ce qui prend soin de vous."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="text-sm font-medium text-ink">Prénom</label>
            <Input id="firstName" name="firstName" type="text" autoComplete="given-name" placeholder="Amira" required className="mt-2 h-12 rounded-xl bg-background/70 px-4 text-base placeholder:text-ink-faint focus-visible:border-primary focus-visible:ring-primary/15 md:text-sm" />
          </div>
          <div>
            <label htmlFor="lastName" className="text-sm font-medium text-ink">Nom</label>
            <Input id="lastName" name="lastName" type="text" autoComplete="family-name" placeholder="Ben Ali" required className="mt-2 h-12 rounded-xl bg-background/70 px-4 text-base placeholder:text-ink-faint focus-visible:border-primary focus-visible:ring-primary/15 md:text-sm" />
          </div>
        </div>

        <div>
          <label htmlFor="signup-email" className="text-sm font-medium text-ink">Adresse e-mail</label>
          <Input id="signup-email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="vous@exemple.com" required className="mt-2 h-12 rounded-xl bg-background/70 px-4 text-base placeholder:text-ink-faint focus-visible:border-primary focus-visible:ring-primary/15 md:text-sm" />
        </div>

        <PasswordField id="signup-password" name="password" label="Mot de passe" placeholder="8 caractères minimum" autoComplete="new-password" minLength={8} required hint="Utilisez au moins 8 caractères pour sécuriser votre compte." />
        <PasswordField id="confirmPassword" name="confirmPassword" label="Confirmer le mot de passe" placeholder="Saisissez-le à nouveau" autoComplete="new-password" minLength={8} required />

        {message && (
          <div role={message.type === "error" ? "alert" : "status"} className={`flex gap-2.5 rounded-xl border px-3.5 py-3 text-sm leading-5 ${message.type === "error" ? "border-danger/20 bg-danger-bg text-danger" : "border-info/20 bg-info-bg text-info"}`}>
            {message.type === "error" ? <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> : <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
            {message.text}
          </div>
        )}

        <Button type="submit" size="lg" className="group h-12 w-full rounded-xl font-semibold shadow-lg shadow-primary/15">
          Créer mon compte
          <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Button>
      </form>

      <p className="mt-4 text-xs leading-5 text-ink-muted">
        En créant un compte, vous acceptez nos conditions générales de vente et notre politique de confidentialité.
      </p>

      <div className="mt-5 text-center text-sm text-ink-muted">
        Déjà cliente ?{" "}
        <Link href="/compte" className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline">
          Connectez-vous
        </Link>
      </div>
    </AccountAuthShell>
  );
}
