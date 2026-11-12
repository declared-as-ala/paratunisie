"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Hourglass,
  Link2,
  MessageCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldOff,
  Trash2,
} from "lucide-react";
import { Drawer, EmptyState } from "@paratunisie/ui";
import { apiClient, ApiError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/toast";
import { ConfirmModal } from "@/components/confirm-modal";
import { notifyOrdersChanged } from "@/lib/order-events";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { FilterChips } from "@/components/ui/filter-chips";

/* ─── Types ─────────────────────────────────────────────────────────── */

type CheckoutStatus = "DRAFT" | "ABANDONED" | "CONVERTED" | "EXPIRED" | "ARCHIVED";

type CheckoutEvent = {
  id: string;
  type: "STATUS_CHANGE" | "NOTE" | "WHATSAPP_OPENED" | "CONVERTED";
  fromStatus: string | null;
  toStatus: string | null;
  staffId: string | null;
  note: string | null;
  createdAt: string;
};

type Checkout = {
  id: string;
  checkoutSessionId: string;
  customerName: string | null;
  phone: string | null;
  email: string | null;
  gouvernorat: string | null;
  fullAddress: string | null;
  deliveryNote: string | null;
  parsedItems: { productId?: string; name?: string; variantLabel?: string; quantity: number; priceMillimes: number }[];
  itemCount: number;
  subtotalMillimes: number;
  shippingFeeMillimes: number;
  totalMillimes: number;
  status: CheckoutStatus;
  statusLabel: string;
  trafficSource: "Meta Ads" | "Organic" | "Direct" | "Autre";
  source: string;
  landingId: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  fbclid: string | null;
  referrerHost: string | null;
  contactConsent: boolean;
  contactConsentAt: string | null;
  privacyNoticeShown: boolean;
  convertedOrderId: string | null;
  anonymizedAt: string | null;
  lastActivityAt: string;
  createdAt: string;
  duplicateCount?: number;
  existingCustomerOrders?: number;
  events?: CheckoutEvent[];
};

type ListResponse = { items: Checkout[]; total: number; page: number; limit: number; pages: number };

type Stats = {
  inProgress: number;
  abandoned: number;
  recovered: number;
  expired: number;
  recoveryRatePct: number;
  abandonedValueMillimes: number;
  recoveredValueMillimes: number;
  withContactConsent: number;
  thresholds: { inactivityMinutes: number; expireDays: number; retentionDays: number };
};

const STATUS: Record<CheckoutStatus, { label: string; tone: StatusTone }> = {
  DRAFT: { label: "En cours", tone: "info" },
  ABANDONED: { label: "Abandonnée", tone: "warning" },
  CONVERTED: { label: "Récupérée", tone: "success" },
  EXPIRED: { label: "Expirée", tone: "neutral" },
  ARCHIVED: { label: "Archivée", tone: "neutral" },
};

const SOURCES = ["Meta Ads", "Organic", "Direct", "Autre"] as const;

const WHATSAPP_TEMPLATE = (name: string | null, product: string) =>
  `عسلامة${name ? ` ${name}` : ""} 👋 معاك فريق ParaTunisie. لاحظنا اللي بديت طلب ${product} وما كملتوش. تحب نعاونك تكمل الكوموند متاعك؟`;

function waLink(phone: string, text: string) {
  const digits = phone.replace(/\D/g, "");
  const full = digits.length === 8 ? `216${digits}` : digits;
  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("fr-TN", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function ago(iso: string) {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 48) return `il y a ${h} h`;
  return `il y a ${Math.round(h / 24)} j`;
}

const control =
  "h-10 rounded-xl border border-border bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";

/* ─── Page ──────────────────────────────────────────────────────────── */

export default function CommandesAbandonneesPage() {
  const { toast } = useToast();
  const [data, setData] = useState<ListResponse | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<{ productId: string; name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState("ALL");
  const [source, setSource] = useState("ALL");
  const [productId, setProductId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [duplicates, setDuplicates] = useState(false);
  const [page, setPage] = useState(1);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Multi-select + bulk delete
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const query = useMemo(() => {
    const q = new URLSearchParams();
    if (debounced) q.set("search", debounced);
    if (status !== "ALL") q.set("status", status);
    if (source !== "ALL") q.set("source", source);
    if (productId) q.set("productId", productId);
    if (from) q.set("from", from);
    if (to) q.set("to", to);
    if (duplicates) q.set("duplicates", "1");
    return q;
  }, [debounced, status, source, productId, from, to, duplicates]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = new URLSearchParams(query);
      list.set("page", String(page));
      list.set("limit", "25");
      const statQ = new URLSearchParams();
      for (const k of ["from", "to", "productId"]) if (query.get(k)) statQ.set(k, query.get(k)!);
      const [l, s] = await Promise.all([
        apiClient.get<ListResponse>(`/abandoned-checkouts/admin/list?${list}`),
        apiClient.get<Stats>(`/abandoned-checkouts/admin/stats?${statQ}`),
      ]);
      setData(l);
      setStats(s);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Impossible de charger les commandes abandonnées.");
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  // Selection only ever refers to rows that are on screen (page/filter changes drop the rest).
  useEffect(() => {
    setSelected((prev) => {
      if (prev.size === 0) return prev;
      const onScreen = new Set(data?.items.map((i) => i.id) ?? []);
      const next = new Set([...prev].filter((id) => onScreen.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [data]);

  const pageIds = data?.items.map((i) => i.id) ?? [];
  const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const toggleAll = () => setSelected(allOnPage ? new Set() : new Set(pageIds));
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const bulkDelete = async () => {
    if (deleting || selected.size === 0) return;
    setDeleting(true);
    try {
      const res = await apiClient.post<{ deleted: number; skippedRecovered: number }>("/abandoned-checkouts/admin/bulk-delete", { ids: [...selected] });
      toast(
        "success",
        `${res.deleted} commande${res.deleted > 1 ? "s" : ""} abandonnée${res.deleted > 1 ? "s" : ""} supprimée${res.deleted > 1 ? "s" : ""}` +
          (res.skippedRecovered ? ` · ${res.skippedRecovered} récupérée${res.skippedRecovered > 1 ? "s" : ""} conservée${res.skippedRecovered > 1 ? "s" : ""}` : ""),
      );
      setSelected(new Set());
      setConfirmDelete(false);
      notifyOrdersChanged();
      await load();
    } catch (e) {
      toast("error", e instanceof ApiError ? e.message : "Suppression impossible");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    apiClient.get<typeof products>("/abandoned-checkouts/admin/products").then(setProducts).catch(() => undefined);
  }, []);

  const chips = [
    ...(debounced ? [{ key: "q", label: `Recherche : ${debounced}`, onRemove: () => setSearch("") }] : []),
    ...(status !== "ALL" ? [{ key: "s", label: `Statut : ${STATUS[status as CheckoutStatus]?.label ?? status}`, onRemove: () => setStatus("ALL") }] : []),
    ...(source !== "ALL" ? [{ key: "src", label: `Source : ${source}`, onRemove: () => setSource("ALL") }] : []),
    ...(productId ? [{ key: "p", label: `Produit : ${products.find((p) => p.productId === productId)?.name ?? "…"}`, onRemove: () => setProductId("") }] : []),
    ...(from ? [{ key: "f", label: `Depuis le ${from}`, onRemove: () => setFrom("") }] : []),
    ...(to ? [{ key: "t", label: `Jusqu'au ${to}`, onRemove: () => setTo("") }] : []),
    ...(duplicates ? [{ key: "d", label: "Doublons uniquement", onRemove: () => setDuplicates(false) }] : []),
  ];
  const reset = () => {
    setSearch("");
    setStatus("ALL");
    setSource("ALL");
    setProductId("");
    setFrom("");
    setTo("");
    setDuplicates(false);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Commandes abandonnées"
        icon={Hourglass}
        description="Visiteurs qui ont commencé une commande sans la confirmer. Ce sont des prospects : ils n'ont aucun effet sur le chiffre d'affaires, le stock ni les expéditions."
        actions={
          <button type="button" onClick={load} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-semibold text-ink hover:bg-soft-nude">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Actualiser
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="En cours" value={stats?.inProgress ?? "–"} tone="info" active={status === "DRAFT"} onClick={() => setStatus(status === "DRAFT" ? "ALL" : "DRAFT")} loading={!stats} hint={`Actifs < ${stats?.thresholds.inactivityMinutes ?? 15} min`} />
        <StatCard label="Abandonnées" value={stats?.abandoned ?? "–"} tone="warning" active={status === "ABANDONED"} onClick={() => setStatus(status === "ABANDONED" ? "ALL" : "ABANDONED")} loading={!stats} hint={stats ? formatCurrency(stats.abandonedValueMillimes / 1000) : undefined} />
        <StatCard label="Récupérées" value={stats?.recovered ?? "–"} tone="success" active={status === "CONVERTED"} onClick={() => setStatus(status === "CONVERTED" ? "ALL" : "CONVERTED")} loading={!stats} hint={stats ? formatCurrency(stats.recoveredValueMillimes / 1000) : undefined} />
        <StatCard label="Expirées" value={stats?.expired ?? "–"} tone="neutral" active={status === "EXPIRED"} onClick={() => setStatus(status === "EXPIRED" ? "ALL" : "EXPIRED")} loading={!stats} hint={`Après ${stats?.thresholds.expireDays ?? 30} j`} />
        <StatCard label="Taux de récupération" value={stats ? `${stats.recoveryRatePct}%` : "–"} tone="primary" loading={!stats} hint="Récupérées / (abandonnées + expirées + récupérées)" />
        <StatCard label="Recontact accepté" value={stats?.withContactConsent ?? "–"} tone="success" icon={ShieldCheck} loading={!stats} hint="Visiteurs ayant coché le consentement" />
      </div>

      <div className="rounded-2xl border border-border bg-white p-3 sm:p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[2fr_1fr_1fr_1.4fr_1fr_1fr]">
          <label className="relative sm:col-span-2 lg:col-span-4 xl:col-span-1">
            <span className="sr-only">Rechercher</span>
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input className={`${control} w-full pl-9`} placeholder="Nom, téléphone, gouvernorat…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
          <select aria-label="Statut" className={control} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ALL">Tous les statuts</option>
            {(["DRAFT", "ABANDONED", "CONVERTED", "EXPIRED", "ARCHIVED"] as const).map((s) => (
              <option key={s} value={s}>{STATUS[s].label}</option>
            ))}
          </select>
          <select aria-label="Source" className={control} value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="ALL">Toutes les sources</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select aria-label="Produit" className={control} value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="">Tous les produits</option>
            {products.map((p) => (
              <option key={p.productId} value={p.productId}>{p.name} ({p.count})</option>
            ))}
          </select>
          <input aria-label="Du" type="date" className={control} value={from} onChange={(e) => setFrom(e.target.value)} />
          <input aria-label="Au" type="date" className={control} value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm text-ink-muted">
          <input type="checkbox" checked={duplicates} onChange={(e) => setDuplicates(e.target.checked)} className="size-4 accent-[var(--color-primary)]" />
          Afficher uniquement les doublons (même numéro sur plusieurs brouillons)
        </label>
        <div className="mt-3">
          <FilterChips chips={chips} onReset={reset} resultCount={data?.total} />
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger-bg p-3 text-sm font-semibold text-danger">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        {selected.size > 0 && (
          <div role="region" aria-label="Actions groupées" className="flex flex-wrap items-center gap-2 bg-ink px-4 py-2.5 text-[0.8125rem] text-white">
            <span className="font-medium tabular-nums">{selected.size} sélectionnée{selected.size > 1 ? "s" : ""}</span>
            <button type="button" onClick={() => setConfirmDelete(true)} className="ml-2 inline-flex h-8 items-center gap-1.5 rounded-lg bg-danger px-3 text-[0.75rem] font-semibold text-white transition-colors hover:opacity-90 active:scale-[0.98]">
              <Trash2 size={13} aria-hidden /> Supprimer
            </button>
            <button type="button" onClick={() => setSelected(new Set())} className="ml-auto inline-flex h-8 items-center rounded-lg px-2.5 text-[0.75rem] font-medium text-white/80 transition-colors hover:bg-white/15">
              Désélectionner
            </button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-soft-nude/60 text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted">
              <tr>
                <th scope="col" className="w-10 py-3 pl-4">
                  <input type="checkbox" checked={allOnPage} onChange={toggleAll} aria-label="Sélectionner toutes les commandes abandonnées de la page" className="size-4 accent-[var(--color-ink)]" />
                </th>
                {["Nom", "Téléphone", "Produit", "Prix", "Gouvernorat", "Adresse", "Statut", "Source", "Dernière activité", "Consentement", "Commande liée"].map((h) => (
                  <th key={h} scope="col" className="whitespace-nowrap px-3 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && !data ? (
                <tr><td colSpan={12} className="p-4"><LoadingSkeleton rows={6} /></td></tr>
              ) : data && data.items.length > 0 ? (
                data.items.map((c) => {
                  const st = STATUS[c.status];
                  const first = c.parsedItems[0];
                  return (
                    <tr key={c.id} onClick={() => setSelectedId(c.id)} aria-selected={selected.has(c.id)} className={`cursor-pointer transition-colors ${selected.has(c.id) ? "bg-primary-soft/40" : "hover:bg-soft-nude/50"}`}>
                      <td className="py-3 pl-4" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleOne(c.id)} aria-label={`Sélectionner ${c.customerName || "cette commande abandonnée"}`} className="size-4 accent-[var(--color-ink)]" />
                      </td>
                      <td className="px-3 py-3 font-semibold text-ink">
                        <button type="button" onClick={() => setSelectedId(c.id)} className="text-left hover:underline">
                          {c.customerName || <span className="text-ink-faint">—</span>}
                        </button>
                        {!!c.duplicateCount && c.duplicateCount > 0 && <span className="ml-2 rounded-full bg-warning-bg px-1.5 py-0.5 text-[0.625rem] font-bold text-warning" title="Même numéro sur d'autres brouillons">+{c.duplicateCount} doublon{c.duplicateCount > 1 ? "s" : ""}</span>}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 tabular-nums" dir="ltr">{c.phone || "—"}</td>
                      <td className="max-w-[14rem] px-3 py-3"><span className="line-clamp-2">{first?.name || "—"}{c.itemCount > 1 ? ` (+${c.itemCount - 1})` : first && first.quantity > 1 ? ` ×${first.quantity}` : ""}</span></td>
                      <td className="whitespace-nowrap px-3 py-3 font-semibold tabular-nums">{formatCurrency(c.totalMillimes / 1000)}</td>
                      <td className="px-3 py-3">{c.gouvernorat || "—"}</td>
                      <td className="max-w-[14rem] px-3 py-3"><span className="line-clamp-2 text-ink-muted">{c.fullAddress || "—"}</span></td>
                      <td className="px-3 py-3"><StatusBadge tone={st.tone}>{st.label}</StatusBadge></td>
                      <td className="whitespace-nowrap px-3 py-3">{c.trafficSource}{c.utmCampaign ? <span className="block text-[0.6875rem] text-ink-faint">{c.utmCampaign}</span> : null}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-ink-muted" title={fmtDate(c.lastActivityAt)}>{ago(c.lastActivityAt)}</td>
                      <td className="px-3 py-3">
                        {c.anonymizedAt ? <span className="text-ink-faint">Anonymisé</span> : c.contactConsent ? (
                          <span className="inline-flex items-center gap-1 text-success"><ShieldCheck size={14} /> Accepté</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-ink-faint"><ShieldOff size={14} /> Non</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {c.convertedOrderId ? <span className="inline-flex items-center gap-1 font-semibold text-primary"><Link2 size={13} /> PT-{c.convertedOrderId.slice(-6).toUpperCase()}</span> : "—"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={12}>
                    <EmptyState
                      icon={<Hourglass size={22} />}
                      title={chips.length ? "Aucun résultat pour ces filtres" : "Aucune commande abandonnée"}
                      description={chips.length ? "Modifiez ou réinitialisez les filtres." : "Un visiteur apparaît ici dès qu'il saisit son nom et un numéro valides, puis quitte la page sans confirmer."}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {data && data.pages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
            <span className="text-ink-muted">Page {data.page} / {data.pages} · {data.total} résultats</span>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="inline-flex size-9 items-center justify-center rounded-lg border border-border disabled:opacity-40" aria-label="Page précédente"><ChevronLeft size={16} /></button>
              <button type="button" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)} className="inline-flex size-9 items-center justify-center rounded-lg border border-border disabled:opacity-40" aria-label="Page suivante"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs leading-5 text-ink-faint">
        Règles : un brouillon passe en « Abandonnée » après {stats?.thresholds.inactivityMinutes ?? 15} min d'inactivité, en « Expirée » après {stats?.thresholds.expireDays ?? 30} jours, et ses données personnelles sont effacées après {stats?.thresholds.retentionDays ?? 90} jours.
      </p>

      <ConfirmModal
        open={confirmDelete}
        title={`Supprimer ${selected.size} commande${selected.size > 1 ? "s" : ""} abandonnée${selected.size > 1 ? "s" : ""} ?`}
        description="Suppression définitive : le nom, le téléphone et l'adresse enregistrés sont effacés. Les commandes déjà récupérées (liées à une vraie commande) sont conservées."
        confirmLabel={deleting ? "Suppression…" : "Supprimer"}
        variant="danger"
        onConfirm={bulkDelete}
        onCancel={() => !deleting && setConfirmDelete(false)}
      />

      <DetailDrawer id={selectedId} onClose={() => setSelectedId(null)} onChanged={load} toast={toast} />
    </div>
  );
}

/* ─── Detail drawer ─────────────────────────────────────────────────── */

function DetailDrawer({
  id,
  onClose,
  onChanged,
  toast,
}: {
  id: string | null;
  onClose: () => void;
  onChanged: () => void;
  toast: (type: "success" | "error" | "info", message: string) => void;
}) {
  const [c, setC] = useState<Checkout | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [note, setNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const reload = useCallback(async () => {
    if (!id) return;
    try {
      const row = await apiClient.get<Checkout>(`/abandoned-checkouts/${id}`);
      setC(row);
      setMessage(WHATSAPP_TEMPLATE(row.customerName, row.parsedItems[0]?.name ?? "Anabolic Whey 80"));
    } catch (e) {
      toast("error", e instanceof ApiError ? e.message : "Chargement impossible");
    }
  }, [id, toast]);

  useEffect(() => {
    setC(null);
    setNote("");
    setConfirmed(false);
    reload();
  }, [reload]);

  async function run<T>(fn: () => Promise<T>, ok: string) {
    setBusy(true);
    try {
      await fn();
      toast("success", ok);
      await reload();
      onChanged();
    } catch (e) {
      toast("error", e instanceof ApiError ? e.message : "Action impossible");
    } finally {
      setBusy(false);
    }
  }

  const st = c ? STATUS[c.status] : null;
  const closed = c?.status === "CONVERTED" || !!c?.anonymizedAt;
  const canWhatsapp = !!c?.phone && c.contactConsent && !c.anonymizedAt && c.status !== "CONVERTED";

  return (
    <Drawer open={!!id} onClose={onClose} title={c?.customerName || "Commande abandonnée"} description={c ? `${st?.label} · ${ago(c.lastActivityAt)}` : undefined}>
      {!c ? (
        <LoadingSkeleton rows={8} />
      ) : (
        <div className="space-y-5 text-sm">
          {c.anonymizedAt && (
            <p className="rounded-xl bg-soft-nude p-3 text-ink-muted">Données personnelles effacées le {fmtDate(c.anonymizedAt)} (politique de rétention).</p>
          )}
          {!!c.duplicateCount && (
            <p className="flex items-start gap-2 rounded-xl bg-warning-bg p-3 font-semibold text-warning"><Copy size={15} className="mt-0.5 shrink-0" /> Ce numéro apparaît sur {c.duplicateCount} autre{c.duplicateCount > 1 ? "s" : ""} brouillon{c.duplicateCount > 1 ? "s" : ""}.</p>
          )}
          {!!c.existingCustomerOrders && (
            <p className="rounded-xl bg-info-bg p-3 font-semibold text-info">Client déjà connu : {c.existingCustomerOrders} commande{c.existingCustomerOrders > 1 ? "s" : ""} réelle{c.existingCustomerOrders > 1 ? "s" : ""}.</p>
          )}

          <section className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl border border-border p-4">
            <Info label="Téléphone"><span dir="ltr">{c.phone || "—"}</span></Info>
            <Info label="Gouvernorat">{c.gouvernorat || "—"}</Info>
            <Info label="Adresse" wide>{c.fullAddress || "—"}</Info>
            <Info label="Statut">{st && <StatusBadge tone={st.tone}>{st.label}</StatusBadge>}</Info>
            <Info label="Dernière activité">{fmtDate(c.lastActivityAt)}</Info>
            <Info label="Commencé le">{fmtDate(c.createdAt)}</Info>
            <Info label="Commande liée">{c.convertedOrderId ? <a className="inline-flex items-center gap-1 font-semibold text-primary hover:underline" href={`/admin/commandes?search=${c.convertedOrderId.slice(-6).toUpperCase()}`}>PT-{c.convertedOrderId.slice(-6).toUpperCase()} <ExternalLink size={12} /></a> : "—"}</Info>
          </section>

          <section className="rounded-2xl border border-border p-4">
            <h3 className="mb-2 font-semibold text-ink">Panier (prix du catalogue)</h3>
            {c.parsedItems.map((it, i) => (
              <div key={i} className="flex justify-between gap-3 py-1">
                <span>{it.name || "Produit"}{it.variantLabel ? ` · ${it.variantLabel}` : ""} × {it.quantity}</span>
                <span className="tabular-nums">{formatCurrency((it.priceMillimes * it.quantity) / 1000)}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t border-border pt-2 text-ink-muted"><span>Livraison</span><span>{c.shippingFeeMillimes === 0 ? "Offerte" : formatCurrency(c.shippingFeeMillimes / 1000)}</span></div>
            <div className="flex justify-between font-bold"><span>Total estimé</span><span className="tabular-nums">{formatCurrency(c.totalMillimes / 1000)}</span></div>
          </section>

          <section className="rounded-2xl border border-border p-4">
            <h3 className="mb-2 font-semibold text-ink">Origine & consentement</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <Info label="Source">{c.trafficSource}</Info>
              <Info label="Page">{c.landingId || c.source}</Info>
              <Info label="utm_source">{c.utmSource || "—"}</Info>
              <Info label="utm_medium">{c.utmMedium || "—"}</Info>
              <Info label="utm_campaign">{c.utmCampaign || "—"}</Info>
              <Info label="utm_content">{c.utmContent || "—"}</Info>
              <Info label="Clic Meta (fbclid)">{c.fbclid ? "Oui" : "Non"}</Info>
              <Info label="Référent">{c.referrerHost || "—"}</Info>
              <Info label="Information affichée">{c.privacyNoticeShown ? "Oui" : "Non"}</Info>
              <Info label="Recontact">{c.contactConsent ? <span className="font-semibold text-success">Accepté{c.contactConsentAt ? ` le ${fmtDate(c.contactConsentAt)}` : ""}</span> : "Non accepté"}</Info>
            </div>
          </section>

          {/* WhatsApp follow-up: only with the shopper's explicit opt-in; never automatic. */}
          <section className="rounded-2xl border border-border p-4">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-ink"><MessageCircle size={16} /> Relance WhatsApp</h3>
            {canWhatsapp ? (
              <>
                <textarea dir="rtl" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="w-full rounded-xl border border-border p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" aria-label="Message WhatsApp" />
                <p className="mt-1 text-xs text-ink-faint">Message pré-rempli, modifiable. Il n'est jamais envoyé automatiquement : vous l'envoyez vous-même depuis WhatsApp.</p>
                <button
                  type="button"
                  disabled={busy || !message.trim()}
                  onClick={async () => {
                    window.open(waLink(c.phone!, message), "_blank", "noopener,noreferrer");
                    await run(() => apiClient.post(`/abandoned-checkouts/${c.id}/whatsapp-opened`), "Ouverture WhatsApp enregistrée");
                  }}
                  className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-bold text-white disabled:opacity-50"
                >
                  <MessageCircle size={16} /> Ouvrir WhatsApp
                </button>
              </>
            ) : (
              <p className="rounded-xl bg-soft-nude p-3 text-ink-muted">
                {c.status === "CONVERTED" ? "Commande déjà récupérée." : c.anonymizedAt ? "Données effacées." : "Le visiteur n'a pas accepté d'être recontacté : la relance WhatsApp et l'appel sont désactivés pour respecter son choix."}
              </p>
            )}
          </section>

          {!closed && (
            <section className="rounded-2xl border border-border p-4">
              <h3 className="mb-2 font-semibold text-ink">Suivi</h3>
              <div className="flex flex-wrap gap-2">
                {(["ABANDONED", "EXPIRED", "ARCHIVED"] as const).filter((s) => s !== c.status).map((s) => (
                  <button key={s} type="button" disabled={busy} onClick={() => run(() => apiClient.post(`/abandoned-checkouts/${c.id}/status`, { status: s, note: note.trim() || undefined }), `Statut : ${STATUS[s].label}`)} className="h-9 rounded-lg border border-border px-3 text-xs font-semibold hover:bg-soft-nude disabled:opacity-50">
                    Marquer « {STATUS[s].label} »
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note interne (ex. appelé, injoignable…)" maxLength={500} className={`${control} flex-1`} aria-label="Note interne" />
                <button type="button" disabled={busy || !note.trim()} onClick={() => run(async () => { await apiClient.post(`/abandoned-checkouts/${c.id}/note`, { note: note.trim() }); setNote(""); }, "Note ajoutée")} className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-white disabled:opacity-50">Ajouter</button>
              </div>
            </section>
          )}

          {!closed && c.phone && c.gouvernorat && c.fullAddress && (
            <section className="rounded-2xl border border-primary/30 bg-primary-soft/30 p-4">
              <h3 className="mb-1 font-semibold text-ink">Créer la commande</h3>
              <p className="text-xs text-ink-muted">Uniquement après que le client a explicitement confirmé. La commande est créée « En attente » avec les prix actuels du catalogue ; le stock est réservé quand vous la confirmez dans Commandes.</p>
              <label className="mt-3 flex cursor-pointer items-start gap-2 text-sm">
                <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5 size-4 accent-[var(--color-primary)]" />
                Le client a explicitement confirmé cette commande (appel ou WhatsApp).
              </label>
              <button
                type="button"
                disabled={busy || !confirmed}
                onClick={() => run(async () => { const r = await apiClient.post<{ orderReference: string }>(`/abandoned-checkouts/${c.id}/convert`, { customerConfirmed: true, note: note.trim() || undefined }); toast("success", `Commande ${r.orderReference} créée`); }, "Commande créée")}
                className="mt-3 h-10 rounded-xl bg-primary px-4 text-sm font-bold text-white disabled:opacity-50"
              >
                Créer la commande
              </button>
            </section>
          )}

          <section className="rounded-2xl border border-border p-4">
            <h3 className="mb-2 font-semibold text-ink">Historique</h3>
            {c.events && c.events.length > 0 ? (
              <ol className="space-y-2">
                {c.events.map((e) => (
                  <li key={e.id} className="flex gap-3 text-xs">
                    <span className="w-28 shrink-0 text-ink-faint">{fmtDate(e.createdAt)}</span>
                    <span className="text-ink">
                      {e.type === "STATUS_CHANGE" && `Statut : ${STATUS[e.fromStatus as CheckoutStatus]?.label ?? e.fromStatus ?? "—"} → ${STATUS[e.toStatus as CheckoutStatus]?.label ?? e.toStatus}`}
                      {e.type === "NOTE" && "Note"}
                      {e.type === "WHATSAPP_OPENED" && "WhatsApp ouvert"}
                      {e.type === "CONVERTED" && "Commande créée / récupérée"}
                      {e.note ? ` — ${e.note}` : ""}
                      {e.staffId ? <span className="text-ink-faint"> (équipe)</span> : <span className="text-ink-faint"> (système)</span>}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs text-ink-faint">Aucun événement.</p>
            )}
          </section>
        </div>
      )}
    </Drawer>
  );
}

function Info({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2" : undefined}>
      <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-faint">{label}</p>
      <div className="mt-0.5 break-words text-ink">{children}</div>
    </div>
  );
}
