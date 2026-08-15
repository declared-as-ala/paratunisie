"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { Button, Field, Input } from "@paratunisie/ui";
import { ApiError, useAuth } from "@/lib/auth-context";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#f8f2ef] lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(460px,0.92fr)]">
      <section className="relative hidden min-h-dvh overflow-hidden lg:block" aria-label="Univers ParaTunisie">
        <Image
          src="/assets/hero-paratunisie.webp"
          alt="Soin dermocosmétique ParaTunisie"
          fill
          priority
          sizes="55vw"
          className="object-cover object-[58%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(39,19,28,0.08)_0%,rgba(39,19,28,0.16)_48%,rgba(39,19,28,0.82)_100%)]" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-10 xl:p-12">
          <BrandMark light />
          <span className="rounded-full border border-white/30 bg-white/15 px-4 py-2 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
            Espace direction
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 max-w-2xl p-10 text-white xl:p-12">
          <div className="mb-5 h-px w-12 bg-[#dfc08d]" />
          <p className="max-w-xl font-[Georgia,serif] text-4xl leading-[1.12] tracking-[-0.025em] xl:text-5xl">
            Pilotez l’excellence, en toute sérénité.
          </p>
          <p className="mt-5 max-w-lg text-sm leading-6 text-white/75">
            Votre espace confidentiel pour orchestrer le catalogue, les commandes et l’expérience ParaTunisie.
          </p>
        </div>
      </section>

      <section className="relative flex min-h-dvh items-center justify-center px-5 py-8 sm:px-10 lg:px-12 xl:px-20">
        <div aria-hidden="true" className="absolute -right-28 -top-28 size-80 rounded-full bg-[#ead2dc]/55 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-36 -left-28 size-96 rounded-full bg-[#e9d9c0]/45 blur-3xl" />

        <div className="relative w-full max-w-[27rem]">
          <div className="mb-12 flex items-center justify-between lg:hidden">
            <BrandMark />
            <div className="flex size-10 items-center justify-center rounded-full border border-[#ddcbc5] bg-white/65 text-[#7b2f52] shadow-sm backdrop-blur">
              <LockKeyhole aria-hidden="true" className="size-4" strokeWidth={1.8} />
            </div>
          </div>

          <div className="mb-9">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#dfd0cb] bg-white/65 px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-[#7b2f52] shadow-[0_8px_30px_rgba(76,38,53,0.05)] backdrop-blur">
              <span className="size-1.5 rounded-full bg-[#c8a46b]" />
              Portail sécurisé
            </div>
            <h1 className="font-[Georgia,serif] text-[2.35rem] leading-[1.05] tracking-[-0.035em] text-[#2b2326] sm:text-[2.75rem]">
              Heureuse de vous revoir.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#716268]">
              Connectez-vous pour accéder à votre espace d’administration ParaTunisie.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
            <Field label="Adresse e-mail" htmlFor="email" required>
              <Input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="nom@paratunisie.tn"
                required
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "login-error" : undefined}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-[3.25rem] rounded-xl border-[#d9c9c4] bg-white/75 px-4 text-base shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] placeholder:text-[#a89a9f] focus-visible:border-[#7b2f52] focus-visible:ring-[#7b2f52]/15 md:text-sm"
              />
            </Field>

            <Field label="Mot de passe" htmlFor="password" required>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Votre mot de passe"
                  required
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "login-error" : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-[3.25rem] rounded-xl border-[#d9c9c4] bg-white/75 px-4 pr-13 text-base shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] placeholder:text-[#a89a9f] focus-visible:border-[#7b2f52] focus-visible:ring-[#7b2f52]/15 md:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-1 top-1 flex size-11 cursor-pointer items-center justify-center rounded-lg text-[#716268] transition-colors duration-200 hover:bg-[#f5ece8] hover:text-[#7b2f52] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7b2f52]"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff aria-hidden="true" className="size-[1.125rem]" /> : <Eye aria-hidden="true" className="size-[1.125rem]" />}
                </button>
              </div>
            </Field>

            {error && (
              <div id="login-error" role="alert" className="flex items-start gap-2.5 rounded-xl border border-[#e5bdb5] bg-[#fbebe7] px-3.5 py-3 text-sm leading-5 text-[#8e2f20]">
                <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="mt-2 h-[3.25rem] w-full cursor-pointer rounded-xl bg-[#7b2f52] px-5 text-sm font-semibold tracking-[0.01em] text-white shadow-[0_12px_30px_rgba(123,47,82,0.22)] transition-[background-color,box-shadow,transform] duration-200 hover:bg-[#5e203c] hover:shadow-[0_16px_34px_rgba(94,32,60,0.28)] active:translate-y-px disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                  Connexion en cours…
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight aria-hidden="true" className="ml-1 size-4 transition-transform duration-200 group-hover/button:translate-x-0.5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-9 flex items-center gap-3 text-xs leading-5 text-[#716268]">
            <ShieldCheck aria-hidden="true" className="size-4 shrink-0 text-[#7b2f52]" strokeWidth={1.8} />
            <span>Accès réservé au personnel autorisé · Connexion chiffrée</span>
          </div>
        </div>

        <p className="absolute bottom-5 right-6 hidden text-[0.625rem] font-medium uppercase tracking-[0.18em] text-[#a89a9f] sm:block">
          ParaTunisie · Administration
        </p>
      </section>
    </main>
  );
}

function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-3" aria-label="ParaTunisie">
      <div className={`relative flex size-10 items-center justify-center rounded-full border ${light ? "border-white/35 bg-white/15" : "border-[#d9c3ca] bg-white/70"}`}>
        <span className={`font-[Georgia,serif] text-lg italic ${light ? "text-white" : "text-[#7b2f52]"}`}>P</span>
        <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-current bg-[#c8a46b] text-transparent" />
      </div>
      <div className={light ? "text-white" : "text-[#2b2326]"}>
        <p className="font-[Georgia,serif] text-xl leading-none tracking-[-0.025em]">ParaTunisie</p>
        <p className={`mt-1 text-[0.5625rem] font-semibold uppercase tracking-[0.22em] ${light ? "text-white/65" : "text-[#8c7b81]"}`}>Administration</p>
      </div>
    </div>
  );
}
