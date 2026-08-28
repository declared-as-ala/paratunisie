"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Gift,
  History,
  LockKeyhole,
  LogOut,
  ShoppingBag,
  Sparkles,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccountAuthShell } from "./account-auth-shell";
import { PasswordField } from "./password-field";
import {
  clearCustomerSession,
  getCustomerSession,
  setCustomerSession,
  type CustomerSession,
} from "@/lib/customer-auth";
import { formatPrice } from "@/lib/data/products";

type LoyaltyTransaction = {
  id: string;
  points: number;
  type: string;
  description: string | null;
  createdAt: string;
  monetaryValueMillimes?: number | null;
};

type LoyaltyData = {
  points: number;
  tier: string;
  availableValueTnd: number;
  availableValueMillimes: number;
  transactions: LoyaltyTransaction[];
};

export function AccountPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "";

  const [session, setSession] = React.useState<CustomerSession | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [authError, setAuthError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  // Loyalty Data State
  const [loyalty, setLoyalty] = React.useState<LoyaltyData | null>(null);
  const [loadingLoyalty, setLoadingLoyalty] = React.useState(false);

  // Check existing session
  React.useEffect(() => {
    const current = getCustomerSession();
    setSession(current);
    setLoading(false);
  }, []);

  // Fetch loyalty data when session is active
  const loadLoyalty = React.useCallback(async (userId: string) => {
    setLoadingLoyalty(true);
    try {
      const res = await fetch(`/api/v1/loyalty/account/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setLoyalty(data);
      }
    } catch (err) {
      console.error("Failed to load loyalty account:", err);
    } finally {
      setLoadingLoyalty(false);
    }
  }, []);

  React.useEffect(() => {
    if (session?.user?.id) {
      loadLoyalty(session.user.id);
    }
  }, [session, loadLoyalty]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    try {
      const res = await fetch("/api/v1/customers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Identifiants incorrects.");
      }

      const user = await res.json();
      const newSession = { user };
      setCustomerSession(newSession);
      setSession(newSession);

      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    } catch (err: any) {
      setAuthError(err.message || "Erreur de connexion. Veuillez vérifier votre e-mail et mot de passe.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    clearCustomerSession();
    setSession(null);
    setLoyalty(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // ── 1. LOGGED-IN CUSTOMER DASHBOARD ──
  if (session) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Profile Bar */}
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-xl">
              {session.user.name ? session.user.name[0].toUpperCase() : "C"}
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-ink">
                Bonjour, {session.user.name || "Client ParaTunisie"}
              </h1>
              <p className="text-sm text-ink-muted">{session.user.email}</p>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="self-start sm:self-auto rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
          >
            <LogOut className="mr-1.5 size-3.5" />
            Déconnexion
          </Button>
        </div>

        {/* Loyalty Points Section */}
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="size-5 text-amber-600" />
            <h2 className="font-serif text-xl font-bold text-ink">Mes points fidélité</h2>
          </div>

          {/* Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Card 1: Balance */}
            <div className="rounded-2xl border border-amber-500/20 bg-linear-to-br from-amber-500/10 via-amber-500/5 to-white p-6">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Solde de points
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-ink sm:text-4xl font-tabular">
                  {loyalty?.points?.toLocaleString("fr-FR") ?? 0}
                </span>
                <span className="text-sm font-semibold text-amber-800">points</span>
              </div>
              <p className="mt-2 text-xs text-ink-muted">
                Statut : <strong className="text-amber-800">{loyalty?.tier || "Bronze"}</strong>
              </p>
            </div>

            {/* Card 2: Value in DT */}
            <div className="rounded-2xl border border-emerald-500/20 bg-linear-to-br from-emerald-500/10 via-emerald-500/5 to-white p-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Valeur disponible
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-ink sm:text-4xl font-tabular">
                  {loyalty?.availableValueTnd ? loyalty.availableValueTnd.toFixed(3) : "0.000"}
                </span>
                <span className="text-sm font-semibold text-emerald-800">DT</span>
              </div>
              <p className="mt-2 text-xs text-ink-muted">
                Déductible directement lors du paiement
              </p>
            </div>

            {/* Card 3: Rule */}
            <div className="rounded-2xl border border-primary/20 bg-linear-to-br from-primary/10 via-primary/5 to-white p-6">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Barème de fidélité
              </span>
              <p className="mt-2 text-sm font-bold text-ink">
                1 DT dépensé = 1 point
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                20 points = 1 DT de réduction immédiate à chaque commande.
              </p>
            </div>
          </div>

          {/* Transactions Ledger */}
          <div className="mt-6 rounded-2xl border border-border bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <History className="size-4 text-ink-muted" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink">
                Historique des points
              </h3>
            </div>

            {loadingLoyalty ? (
              <div className="py-8 text-center text-sm text-ink-muted">
                Chargement de votre historique...
              </div>
            ) : !loyalty?.transactions || loyalty.transactions.length === 0 ? (
              <div className="rounded-xl bg-soft-nude/40 p-6 text-center text-xs text-ink-muted">
                Vous n&apos;avez pas encore de transaction de fidélité. Vos points s&apos;accumuleront automatiquement dès vos premières commandes confirmées.
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {loyalty.transactions.map((tx) => {
                  const isEarn = tx.points > 0;
                  return (
                    <div key={tx.id} className="flex items-center justify-between py-3.5 text-xs sm:text-sm">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                            isEarn
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          {isEarn ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                        </div>
                        <div>
                          <p className="font-semibold text-ink">
                            {tx.description || (isEarn ? "Points cumulés" : "Utilisation de points")}
                          </p>
                          <p className="text-[0.6875rem] text-ink-muted flex items-center gap-1 mt-0.5">
                            <Clock className="size-3" />
                            {new Intl.DateTimeFormat("fr-TN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }).format(new Date(tx.createdAt))}
                          </p>
                        </div>
                      </div>

                      <div className="text-right font-bold">
                        <span
                          className={`text-sm sm:text-base font-tabular ${
                            isEarn ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {isEarn ? `+${tx.points}` : tx.points} pts
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  // ── 2. LOGIN FORM FOR UNAUTHENTICATED VISITORS ──
  return (
    <AccountAuthShell
      eyebrow="Connexion"
      title="Heureux de vous revoir."
      description="Connectez-vous pour retrouver vos points fidélité, vos commandes et vos avis clients."
    >
      {redirectUrl && (
        <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
          Veuillez vous connecter pour poursuivre votre action.
        </div>
      )}

      {authError && (
        <div role="alert" className="mb-4 flex gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm leading-5 text-rose-700">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {authError}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
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
            <Link
              href="/compte/mdp-oublie"
              className="ml-auto text-xs font-semibold text-primary underline-offset-4 hover:underline"
            >
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

        <Button
          type="submit"
          disabled={submitting}
          size="lg"
          className="group h-12 w-full rounded-xl font-semibold shadow-lg shadow-primary/15"
        >
          {submitting ? "Connexion..." : "Se connecter"}
          <ArrowRight
            className="ml-1 size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Button>
      </form>

      <div className="mt-7 flex flex-col items-center justify-between gap-3 rounded-xl border border-border bg-background/65 px-4 py-3.5 text-sm sm:flex-row">
        <p className="text-ink-muted">Première visite chez ParaTunisie ?</p>
        <Link
          href={`/compte/inscription${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
          className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline"
        >
          <LockKeyhole className="size-4" aria-hidden="true" />
          Créer un compte
        </Link>
      </div>
    </AccountAuthShell>
  );
}
