"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
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
  Package,
  ShoppingBag,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Truck,
  User,
  XCircle,
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

type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  priceMillimes: number;
  product?: {
    name: string;
    image?: string;
    slug?: string;
    brand?: string;
  };
};

type OrderData = {
  id: string;
  status: string;
  totalMillimes: number;
  loyaltyPointsUsed?: number;
  loyaltyDiscountMillimes?: number;
  loyaltyPointsEarned?: number;
  gouvernorat: string;
  fullAddress: string;
  deliveryNote?: string;
  createdAt: string;
  items: OrderItem[];
  shipment?: { carrier?: string; status?: string; trackingNumber?: string };
  payment?: { method?: string; status?: string };
};

const STATUS_MAP: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  EN_ATTENTE: { label: "En attente", bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-700", icon: Clock },
  CONFIRMEE: { label: "Confirmée", bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-700", icon: CheckCircle2 },
  EXPEDIEE: { label: "Expédiée", bg: "bg-purple-500/10 border-purple-500/20", text: "text-purple-700", icon: Truck },
  LIVREE: { label: "Livrée", bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-700", icon: CheckCircle2 },
  ANNULEE: { label: "Annulée", bg: "bg-rose-500/10 border-rose-500/20", text: "text-rose-700", icon: XCircle },
  REFUSEE: { label: "Refusée", bg: "bg-rose-500/10 border-rose-500/20", text: "text-rose-700", icon: XCircle },
  RETOURNEE: { label: "Retournée", bg: "bg-slate-500/10 border-slate-500/20", text: "text-slate-700", icon: XCircle },
};

export function AccountPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "";

  const [session, setSession] = React.useState<CustomerSession | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [authError, setAuthError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  // Customer Profile & Data State
  const [activeTab, setActiveTab] = React.useState<"orders" | "loyalty">("orders");
  const [loyalty, setLoyalty] = React.useState<LoyaltyData | null>(null);
  const [orders, setOrders] = React.useState<OrderData[]>([]);
  const [loadingData, setLoadingData] = React.useState(false);

  // Check existing session
  React.useEffect(() => {
    const current = getCustomerSession();
    setSession(current);
    setLoading(false);
  }, []);

  // Fetch full customer account data (orders + loyalty)
  const loadCustomerData = React.useCallback(async (userId: string) => {
    setLoadingData(true);
    try {
      const [loyaltyRes, customerRes] = await Promise.all([
        fetch(`/api/v1/loyalty/account/${userId}`).catch(() => null),
        fetch(`/api/v1/customers/${userId}`).catch(() => null),
      ]);

      if (loyaltyRes && loyaltyRes.ok) {
        const data = await loyaltyRes.json();
        setLoyalty(data);
      }

      if (customerRes && customerRes.ok) {
        const custData = await customerRes.json();
        if (Array.isArray(custData.orders)) {
          setOrders(custData.orders);
        }
      }
    } catch (err) {
      console.error("Failed to load customer account data:", err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  React.useEffect(() => {
    if (session?.user?.id) {
      loadCustomerData(session.user.id);
    }
  }, [session, loadCustomerData]);

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
    setOrders([]);
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

          <div className="flex items-center gap-3">
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
            >
              <LogOut className="mr-1.5 size-3.5" />
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex border-b border-border/80 gap-6 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
              activeTab === "orders"
                ? "border-primary text-primary"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            <ShoppingBag className="size-4" />
            Mes commandes ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("loyalty")}
            className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
              activeTab === "loyalty"
                ? "border-primary text-primary"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            <Gift className="size-4" />
            Mes points fidélité ({loyalty?.points ?? 0} pts)
          </button>
        </div>

        {/* ── TAB 1: MES COMMANDES ── */}
        {activeTab === "orders" && (
          <section className="mt-6">
            {loadingData ? (
              <div className="py-12 text-center text-sm text-ink-muted">
                <div className="inline-block size-6 animate-spin rounded-full border-2 border-primary border-t-transparent mb-2" />
                <p>Chargement de vos commandes...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
                <Package className="mx-auto size-12 text-ink-muted/40 mb-3" />
                <h3 className="font-serif text-lg font-bold text-ink">Aucune commande pour le moment</h3>
                <p className="mt-1 text-xs text-ink-muted max-w-md mx-auto">
                  Vos commandes passées apparaîtront ici avec leur suivi de livraison et les points fidélité associés.
                </p>
                <div className="mt-6">
                  <Link
                    href="/shop"
                    className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
                  >
                    Découvrir nos produits
                    <ArrowRight className="ml-1.5 size-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const statusInfo = STATUS_MAP[order.status] || {
                    label: order.status,
                    bg: "bg-slate-500/10 border-slate-500/20",
                    text: "text-slate-700",
                    icon: Clock,
                  };
                  const StatusIcon = statusInfo.icon;
                  const dateStr = new Date(order.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });

                  return (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-xs transition-all hover:border-primary/30"
                    >
                      {/* Order Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm sm:text-base text-ink">
                              Commande #PT-{order.id.slice(-6).toUpperCase()}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusInfo.bg} ${statusInfo.text}`}
                            >
                              <StatusIcon className="size-3" />
                              {statusInfo.label}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-ink-muted">Passée le {dateStr}</p>
                        </div>

                        <div className="text-right">
                          <p className="font-tabular font-bold text-base sm:text-lg text-ink">
                            {formatPrice(order.totalMillimes)}
                          </p>
                          {order.loyaltyPointsEarned ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                              <Sparkles className="size-3" />
                              +{order.loyaltyPointsEarned} points gagnés
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="mt-4 space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-xs sm:text-sm">
                            <div className="flex items-center gap-3">
                              {item.product?.image ? (
                                <div className="relative size-12 rounded-lg border border-border overflow-hidden bg-white shrink-0">
                                  <Image
                                    src={item.product.image}
                                    alt={item.product.name}
                                    fill
                                    className="object-contain p-1"
                                  />
                                </div>
                              ) : (
                                <div className="flex size-12 items-center justify-center rounded-lg bg-soft-nude text-ink-muted shrink-0">
                                  <Package className="size-5" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-ink line-clamp-1">
                                  {item.product?.name || "Produit ParaTunisie"}
                                </p>
                                <p className="text-xs text-ink-muted">Quantité : {item.quantity}</p>
                              </div>
                            </div>
                            <span className="font-tabular font-semibold text-ink">
                              {formatPrice(item.priceMillimes * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Order Footer Details */}
                      <div className="mt-4 pt-4 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
                        <div>
                          <span>Livraison : </span>
                          <strong className="text-ink">{order.fullAddress}, {order.gouvernorat}</strong>
                        </div>
                        {order.loyaltyDiscountMillimes ? (
                          <div className="text-amber-700 font-semibold">
                            🎁 Réduction fidélité appliquée : -{formatPrice(order.loyaltyDiscountMillimes)}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ── TAB 2: MES POINTS FIDÉLITÉ ── */}
        {activeTab === "loyalty" && (
          <section className="mt-6">
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

              {loadingData ? (
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
                            className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                              isEarn ? "bg-emerald-500/10 text-emerald-700" : "bg-rose-500/10 text-rose-700"
                            }`}
                          >
                            {isEarn ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                          </div>
                          <div>
                            <p className="font-semibold text-ink">
                              {tx.description || (isEarn ? "Points cumulés" : "Points utilisés")}
                            </p>
                            <p className="text-xs text-ink-muted">
                              {new Date(tx.createdAt).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`font-tabular font-bold ${
                              isEarn ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {isEarn ? `+${tx.points}` : tx.points} pts
                          </span>
                          {tx.monetaryValueMillimes ? (
                            <p className="text-xs text-ink-muted">
                              ({(tx.monetaryValueMillimes / 1000).toFixed(3)} DT)
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    );
  }

  // ── 2. LOGIN / SIGNUP VIEW (Unauthenticated) ──
  return (
    <AccountAuthShell
      eyebrow="Espace Personnel"
      title="Connexion à votre compte"
      description="Suivez vos commandes, consultez vos points fidélité et profitez de réductions exclusives."
    >
      <form onSubmit={handleLogin} className="space-y-4">
        {authError && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <AlertCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
            <p>{authError}</p>
          </div>
        )}

        <div>
          <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
            Adresse e-mail
          </label>
          <Input
            id="login-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="votre-email@exemple.tn"
            className="rounded-xl border-border h-11"
          />
        </div>

        <div>
          <PasswordField
            id="login-password"
            label="Mot de passe"
            name="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="rounded-xl border-border h-11"
          />
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full h-11 rounded-xl text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs mt-2"
        >
          {submitting ? "Connexion en cours..." : "Se connecter"}
          <ArrowRight className="ml-2 size-4" />
        </Button>

        <div className="pt-4 border-t border-border/80 text-center text-xs text-ink-muted">
          Vous n&apos;avez pas encore de compte ?{" "}
          <Link
            href={redirectUrl ? `/compte/inscription?redirect=${encodeURIComponent(redirectUrl)}` : "/compte/inscription"}
            className="font-bold text-primary hover:underline"
          >
            Créer un compte
          </Link>
        </div>
      </form>
    </AccountAuthShell>
  );
}
