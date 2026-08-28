"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, Check, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccountAuthShell } from "./account-auth-shell";
import { PasswordField } from "./password-field";
import { setCustomerSession } from "@/lib/customer-auth";

export function SignupPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "";

  const [message, setMessage] = React.useState<{ type: "error" | "success"; text: string } | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const firstName = String(form.get("firstName") || "").trim();
    const lastName = String(form.get("lastName") || "").trim();
    const email = String(form.get("email") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const password = String(form.get("password") || "");
    const confirmation = String(form.get("confirmPassword") || "");

    if (password.length < 8) {
      setMessage({ type: "error", text: "Votre mot de passe doit contenir au moins 8 caractères." });
      return;
    }
    if (password !== confirmation) {
      setMessage({ type: "error", text: "Les deux mots de passe ne correspondent pas." });
      return;
    }

    const name = `${firstName} ${lastName}`.trim() || firstName || "Client ParaTunisie";
    setSubmitting(true);

    try {
      const res = await fetch("/api/v1/customers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, phone, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Erreur lors de la création du compte.");
      }

      const user = await res.json();
      setCustomerSession({ user });
      setMessage({ type: "success", text: "Compte créé avec succès ! Redirection en cours..." });

      setTimeout(() => {
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          window.location.href = "/compte";
        }
      }, 1000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Impossible de créer le compte. Veuillez réessayer." });
      setSubmitting(false);
    }
  };

  return (
    <AccountAuthShell
      eyebrow="Créer un compte"
      title="Votre espace santé & beauté commence ici."
      description="Créez votre profil pour cumuler des points fidélité (1 DT = 1 point), commander plus vite et donner vos avis."
    >
      {redirectUrl && (
        <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
          Créez votre compte pour poursuivre votre action.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="text-sm font-medium text-ink">Prénom *</label>
            <Input id="firstName" name="firstName" type="text" autoComplete="given-name" placeholder="Yassine" required className="mt-2 h-12 rounded-xl bg-background/70 px-4 text-base placeholder:text-ink-faint focus-visible:border-primary focus-visible:ring-primary/15 md:text-sm" />
          </div>
          <div>
            <label htmlFor="lastName" className="text-sm font-medium text-ink">Nom *</label>
            <Input id="lastName" name="lastName" type="text" autoComplete="family-name" placeholder="Trabelsi" required className="mt-2 h-12 rounded-xl bg-background/70 px-4 text-base placeholder:text-ink-faint focus-visible:border-primary focus-visible:ring-primary/15 md:text-sm" />
          </div>
        </div>

        <div>
          <label htmlFor="signup-email" className="text-sm font-medium text-ink">Adresse e-mail *</label>
          <Input id="signup-email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="vous@exemple.com" required className="mt-2 h-12 rounded-xl bg-background/70 px-4 text-base placeholder:text-ink-faint focus-visible:border-primary focus-visible:ring-primary/15 md:text-sm" />
        </div>

        <div>
          <label htmlFor="signup-phone" className="text-sm font-medium text-ink">Téléphone (optionnel)</label>
          <Input id="signup-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="22 123 456" className="mt-2 h-12 rounded-xl bg-background/70 px-4 text-base placeholder:text-ink-faint focus-visible:border-primary focus-visible:ring-primary/15 md:text-sm" />
        </div>

        <PasswordField id="signup-password" name="password" label="Mot de passe *" placeholder="8 caractères minimum" autoComplete="new-password" minLength={8} required hint="Utilisez au moins 8 caractères pour sécuriser votre compte." />
        <PasswordField id="confirmPassword" name="confirmPassword" label="Confirmer le mot de passe *" placeholder="Saisissez-le à nouveau" autoComplete="new-password" minLength={8} required />

        {message && (
          <div role={message.type === "error" ? "alert" : "status"} className={`flex gap-2.5 rounded-xl border px-3.5 py-3 text-sm leading-5 ${message.type === "error" ? "border-danger/20 bg-danger-bg text-danger" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
            {message.type === "error" ? <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> : <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
            {message.text}
          </div>
        )}

        <Button type="submit" disabled={submitting} size="lg" className="group h-12 w-full rounded-xl font-semibold shadow-lg shadow-primary/15">
          {submitting ? "Création en cours..." : "Créer mon compte"}
          <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Button>
      </form>

      <p className="mt-4 text-xs leading-5 text-ink-muted">
        En créant un compte, vous profitez automatiquement du programme de fidélité ParaTunisie (1 DT = 1 point).
      </p>

      <div className="mt-5 text-center text-sm text-ink-muted">
        Déjà client(e) ?{" "}
        <Link href={`/compte${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`} className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline">
          Connectez-vous
        </Link>
      </div>
    </AccountAuthShell>
  );
}
