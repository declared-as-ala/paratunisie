"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, Eye, MapPin, ReceiptText, RefreshCw,
  Search, ShoppingBag, TrendingUp, UserRoundCheck, UsersRound,
} from "lucide-react";
import { Drawer, Skeleton } from "@paratunisie/ui";
import { apiClient, ApiError } from "@/lib/api-client";

type Order = {
  id: string; status: string; totalMillimes: number; gouvernorat: string;
  createdAt: string; items: { quantity: number }[];
};
type Customer = {
  id: string; name: string | null; email: string; phone: string | null; createdAt: string;
  orders: Order[]; ordersCount: number; totalSpentMillimes: number;
  averageBasketMillimes: number; lastOrderDate: string | null; governorates: string[];
};
type Response = {
  items: Customer[];
  stats: { totalCustomers: number; repeatCustomers: number; totalRevenueMillimes: number; averageBasketMillimes: number };
  governorates: string[];
  pagination: { page: number; pageSize: number; total: number; pageCount: number };
};

const empty: Response = {
  items: [], stats: { totalCustomers: 0, repeatCustomers: 0, totalRevenueMillimes: 0, averageBasketMillimes: 0 },
  governorates: [], pagination: { page: 1, pageSize: 20, total: 0, pageCount: 1 },
};

function money(millimes: number) {
  return new Intl.NumberFormat("fr-TN", { style: "currency", currency: "TND", minimumFractionDigits: 3 }).format(millimes / 1000);
}

function date(value: string | null, long = false) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-TN", long ? { dateStyle: "long", timeStyle: "short" } : { dateStyle: "medium" }).format(new Date(value));
}

function initials(customer: Customer) {
  return (customer.name || customer.email).split(/\s|@/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

const statusLabel: Record<string, string> = {
  EN_ATTENTE: "En attente", TENTATIVE_CONTACT: "Tentative", CONFIRMEE: "Confirmée",
  PREPARATION: "Préparation", PRETE_EXPEDITION: "Prête", EXPEDIEE: "Expédiée",
  LIVREE: "Livrée", ANNULEE: "Annulée", REFUSEE: "Refusée", RETOURNEE: "Retournée",
};

export default function ClientsPage() {
  const [data, setData] = useState<Response>(empty);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => { setDebounced(search.trim()); setPage(1); }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: "20", sort });
    if (debounced) params.set("search", debounced);
    if (governorate) params.set("governorate", governorate);
    return params.toString();
  }, [page, sort, debounced, governorate]);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setData(await apiClient.get<Response>(`/customers/admin/list?${query}`)); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : "Impossible de charger les clients."); }
    finally { setLoading(false); }
  }, [query]);

  useEffect(() => { void load(); }, [load]);

  const kpis = [
    { label: "Clients acheteurs", value: data.stats.totalCustomers, icon: UsersRound, colors: "bg-rose-50 text-primary" },
    { label: "Clients récurrents", value: data.stats.repeatCustomers, icon: UserRoundCheck, colors: "bg-violet-50 text-violet-600" },
    { label: "CA des clients", value: money(data.stats.totalRevenueMillimes), icon: TrendingUp, colors: "bg-emerald-50 text-emerald-600" },
    { label: "Panier moyen", value: money(data.stats.averageBasketMillimes), icon: ShoppingBag, colors: "bg-amber-50 text-amber-600" },
  ];

  return <div className="space-y-6">
    <header className="flex items-start gap-3">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-md"><UsersRound className="size-6" /></span>
      <div><h1 className="text-2xl font-black tracking-tight text-[#881337]">Clients</h1><p className="mt-1 text-sm font-medium text-ink-muted">Clients réels issus des commandes ParaTunisie</p></div>
    </header>

    <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Statistiques clients">
      {kpis.map(({ label, value, icon: Icon, colors }) => <article key={label} className="rounded-2xl border border-border bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-2"><div><p className="text-xs font-semibold text-ink-muted">{label}</p>{loading ? <Skeleton className="mt-2 h-7 w-20" /> : <p className="mt-1 text-xl font-black tabular-nums text-ink sm:text-2xl">{value}</p>}</div><span className={`rounded-xl p-2 ${colors}`}><Icon className="size-4" /></span></div></article>)}
    </section>

    <section className="grid gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm md:grid-cols-[minmax(260px,1fr)_180px_190px]">
      <label className="relative"><span className="sr-only">Rechercher un client</span><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nom, email ou téléphone…" className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" /></label>
      <select aria-label="Filtrer par gouvernorat" value={governorate} onChange={(event) => { setGovernorate(event.target.value); setPage(1); }} className="h-11 rounded-xl border border-border bg-white px-3 text-sm font-medium outline-none focus:border-primary"><option value="">Tous les gouvernorats</option>{data.governorates.map((item) => <option key={item}>{item}</option>)}</select>
      <select aria-label="Trier les clients" value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} className="h-11 rounded-xl border border-border bg-white px-3 text-sm font-medium outline-none focus:border-primary"><option value="recent">Commande la plus récente</option><option value="oldest">Commande la plus ancienne</option><option value="spent">Plus gros acheteurs</option><option value="orders">Plus de commandes</option><option value="name">Nom A–Z</option></select>
    </section>

    {error ? <section className="rounded-2xl border border-rose-200 bg-rose-50 p-10 text-center"><p className="font-bold text-rose-900">{error}</p><button type="button" onClick={() => void load()} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white"><RefreshCw className="size-4" />Réessayer</button></section>
    : loading ? <section className="space-y-2 rounded-2xl border border-border bg-white p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</section>
    : data.items.length === 0 ? <section className="rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center"><UsersRound className="mx-auto size-10 text-ink-faint" /><h2 className="mt-4 font-bold text-ink">{debounced || governorate ? "Aucun client ne correspond à vos filtres." : "Aucun client ayant passé une commande."}</h2><p className="mt-1 text-sm text-ink-muted">Les clients apparaîtront ici automatiquement après leur première commande.</p></section>
    : <>
      <section className="hidden overflow-hidden rounded-2xl border border-border bg-white shadow-sm lg:block"><table className="w-full text-left text-sm"><thead className="border-b border-border bg-[#fbf8f8] text-xs uppercase tracking-wide text-ink-muted"><tr><th className="px-5 py-3">Client</th><th className="px-5 py-3">Localisation</th><th className="px-5 py-3">Commandes</th><th className="px-5 py-3">Total commandé</th><th className="px-5 py-3">Panier moyen</th><th className="px-5 py-3">Dernière commande</th><th className="px-5 py-3 text-right">Détails</th></tr></thead><tbody className="divide-y divide-border">{data.items.map((customer) => <tr key={customer.id} className="transition hover:bg-rose-50/30"><td className="px-5 py-4"><CustomerIdentity customer={customer} /></td><td className="px-5 py-4"><span className="inline-flex items-center gap-1.5 text-ink-muted"><MapPin className="size-3.5" />{customer.governorates.join(", ")}</span></td><td className="px-5 py-4"><span className="font-black tabular-nums text-ink">{customer.ordersCount}</span>{customer.ordersCount > 1 && <span className="ml-2 rounded-full bg-violet-50 px-2 py-1 text-[11px] font-bold text-violet-700">Récurrent</span>}</td><td className="px-5 py-4 font-bold tabular-nums text-ink">{money(customer.totalSpentMillimes)}</td><td className="px-5 py-4 tabular-nums text-ink-muted">{money(customer.averageBasketMillimes)}</td><td className="px-5 py-4 text-ink-muted">{date(customer.lastOrderDate)}</td><td className="px-5 py-4 text-right"><button type="button" onClick={() => setSelected(customer)} aria-label={`Voir ${customer.name || customer.email}`} className="inline-flex size-11 items-center justify-center rounded-xl text-primary hover:bg-rose-50"><Eye className="size-4" /></button></td></tr>)}</tbody></table></section>
      <section className="grid gap-3 lg:hidden">{data.items.map((customer) => <button key={customer.id} type="button" onClick={() => setSelected(customer)} className="rounded-2xl border border-border bg-white p-4 text-left shadow-sm transition active:bg-rose-50"><div className="flex items-start justify-between gap-3"><CustomerIdentity customer={customer} /><Eye className="mt-2 size-4 shrink-0 text-primary" /></div><div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm"><Metric label="Commandes" value={String(customer.ordersCount)} /><Metric label="Total" value={money(customer.totalSpentMillimes)} /><Metric label="Panier moyen" value={money(customer.averageBasketMillimes)} /><Metric label="Dernière commande" value={date(customer.lastOrderDate)} /></div></button>)}</section>
      <nav className="flex flex-col items-center justify-between gap-3 rounded-xl border border-border bg-white px-4 py-3 sm:flex-row" aria-label="Pagination"><p className="text-sm text-ink-muted">{data.pagination.total} client{data.pagination.total > 1 ? "s" : ""} · Page {data.pagination.page} sur {data.pagination.pageCount}</p><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-border px-3 text-sm font-semibold disabled:opacity-40"><ChevronLeft className="size-4" />Précédent</button><button type="button" disabled={page >= data.pagination.pageCount} onClick={() => setPage((value) => value + 1)} className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-border px-3 text-sm font-semibold disabled:opacity-40">Suivant<ChevronRight className="size-4" /></button></div></nav>
    </>}

    <Drawer open={Boolean(selected)} title={selected?.name || "Client ParaTunisie"} description={selected?.email} onClose={() => setSelected(null)}>{selected && <CustomerDrawer customer={selected} />}</Drawer>
  </div>;
}

function CustomerIdentity({ customer }: { customer: Customer }) {
  return <div className="flex min-w-0 items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">{initials(customer)}</span><div className="min-w-0"><p className="truncate font-bold text-ink">{customer.name || "Client ParaTunisie"}</p><p className="truncate text-xs text-ink-muted">{customer.email}</p>{customer.phone && <p className="mt-0.5 text-xs text-ink-faint">{customer.phone}</p>}</div></div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-ink-faint">{label}</p><p className="mt-0.5 font-bold tabular-nums text-ink">{value}</p></div>; }

function CustomerDrawer({ customer }: { customer: Customer }) {
  return <div className="space-y-5"><section className="rounded-2xl border border-border bg-white p-4"><div className="flex items-center gap-4"><span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-base font-black text-primary">{initials(customer)}</span><div><h3 className="font-bold text-ink">{customer.name || "Client ParaTunisie"}</h3><p className="text-sm text-ink-muted">{customer.email}</p><p className="text-sm text-ink-muted">{customer.phone || "Téléphone non renseigné"}</p></div></div><dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4"><Metric label="Client depuis" value={date(customer.createdAt)} /><Metric label="Gouvernorats" value={customer.governorates.join(", ")} /><Metric label="Commandes" value={String(customer.ordersCount)} /><Metric label="Total commandé" value={money(customer.totalSpentMillimes)} /></dl></section><section><div className="mb-3 flex items-center gap-2"><ReceiptText className="size-4 text-primary" /><h3 className="font-bold text-ink">Historique des commandes</h3></div><div className="space-y-2">{customer.orders.map((order) => <Link key={order.id} href={`/admin/commandes?view=${order.id}`} className="block rounded-xl border border-border bg-white p-4 transition hover:border-primary/30 hover:bg-rose-50/30"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-xs font-bold text-primary">#{order.id.slice(-8)}</p><p className="mt-1 text-xs text-ink-muted">{date(order.createdAt, true)} · {order.gouvernorat}</p></div><span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700">{statusLabel[order.status] || order.status}</span></div><div className="mt-3 flex items-center justify-between text-sm"><span className="text-ink-muted">{order.items.reduce((sum, item) => sum + item.quantity, 0)} article(s)</span><strong className="tabular-nums text-ink">{money(order.totalMillimes)}</strong></div></Link>)}</div></section></div>;
}
