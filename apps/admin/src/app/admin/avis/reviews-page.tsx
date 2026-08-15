"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check, ChevronLeft, ChevronRight, Clock3, Eye, MessageSquareText,
  Search, ShieldCheck, Star, Trash2, X, XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ConfirmModal, Drawer, Skeleton } from "@paratunisie/ui";
import { apiClient, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/toast";

type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";
type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  status: ReviewStatus;
  verified: boolean;
  createdAt: string;
  user: { id: string; name: string | null; email: string; phone: string | null };
  product: {
    id: string; name: string; slug: string; image: string;
    brand: { name: string }; category: { name: string };
  };
  order: { id: string; status: string; createdAt: string } | null;
};
type ListResponse = {
  items: Review[];
  pagination: { page: number; pageSize: number; total: number; pageCount: number };
};
type Stats = { total: number; pending: number; approved: number; rejected: number; averageRating: number };
type PendingAction = { review: Review; kind: "approve" | "reject" | "delete" } | null;
type Kpi = { label: string; value: string | number | undefined; icon: LucideIcon; colors: string };

const statusMeta: Record<ReviewStatus, { label: string; className: string }> = {
  PENDING: { label: "En attente", className: "border-amber-200 bg-amber-50 text-amber-700" },
  APPROVED: { label: "Approuvé", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  REJECTED: { label: "Refusé", className: "border-rose-200 bg-rose-50 text-rose-700" },
};

const selectClass = "h-11 rounded-xl border border-border bg-white px-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";

function initials(name: string | null, email: string) {
  return (name || email).split(/\s|@/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function Stars({ rating, compact = false }: { rating: number; compact?: boolean }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} étoiles sur 5`}>
      <span className="flex gap-0.5" aria-hidden>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={`size-3.5 ${star <= rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"}`} />
        ))}
      </span>
      {!compact && <span className="text-xs font-semibold text-ink-muted">{rating}/5</span>}
    </div>
  );
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  const meta = statusMeta[status];
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.className}`}>{meta.label}</span>;
}

function VerifiedBadge() {
  return <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700"><ShieldCheck className="size-3" />Achat vérifié</span>;
}

function ActionButtons({ review, onView, onAction, busy }: { review: Review; onView: () => void; onAction: (kind: NonNullable<PendingAction>["kind"]) => void; busy: boolean }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button type="button" title="Voir l’avis" aria-label="Voir l’avis" onClick={onView} className="rounded-lg p-2 text-ink-muted hover:bg-slate-100 hover:text-ink"><Eye className="size-4" /></button>
      {review.status !== "APPROVED" && <button type="button" disabled={busy} title="Approuver" aria-label="Approuver" onClick={() => onAction("approve")} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 disabled:opacity-40"><Check className="size-4" /></button>}
      {review.status !== "REJECTED" && <button type="button" disabled={busy} title="Refuser" aria-label="Refuser" onClick={() => onAction("reject")} className="rounded-lg p-2 text-amber-600 hover:bg-amber-50 disabled:opacity-40"><X className="size-4" /></button>}
      <button type="button" disabled={busy} title="Supprimer" aria-label="Supprimer" onClick={() => onAction("delete")} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-40"><Trash2 className="size-4" /></button>
    </div>
  );
}

export function ReviewsPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<ListResponse["pagination"]>({ page: 1, pageSize: 20, total: 0, pageCount: 1 });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [rating, setRating] = useState("");
  const [date, setDate] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Review | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [mutating, setMutating] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: "20", date, sort });
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
    if (status) params.set("status", status);
    if (rating) params.set("rating", rating);
    return params.toString();
  }, [page, debouncedSearch, status, rating, date, sort]);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError("");
    try {
      const [list, nextStats] = await Promise.all([
        apiClient.get<ListResponse>(`/reviews/admin?${query}`),
        apiClient.get<Stats>("/reviews/admin/stats"),
      ]);
      setItems(list.items);
      setPagination(list.pagination);
      setStats(nextStats);
      setSelected((current) => current ? list.items.find((item) => item.id === current.id) ?? null : null);
    } catch (cause) {
      const message = cause instanceof ApiError ? cause.message : "Impossible de charger les avis.";
      setError(message);
      if (quiet) toast("error", message);
    } finally {
      setLoading(false);
    }
  }, [query, toast]);

  useEffect(() => { void load(); }, [load]);

  function updateFilter(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  async function confirmAction() {
    if (!pendingAction || mutating) return;
    setMutating(true);
    try {
      if (pendingAction.kind === "delete") {
        await apiClient.delete(`/reviews/admin/${pendingAction.review.id}`);
        toast("success", "Avis supprimé avec succès");
      } else {
        const nextStatus = pendingAction.kind === "approve" ? "APPROVED" : "REJECTED";
        await apiClient.patch(`/reviews/admin/${pendingAction.review.id}/status`, { status: nextStatus });
        toast("success", pendingAction.kind === "approve" ? "Avis approuvé avec succès" : "Avis refusé avec succès");
      }
      setPendingAction(null);
      await load(true);
    } catch (cause) {
      toast("error", cause instanceof ApiError ? cause.message : "L’action n’a pas pu être effectuée.");
    } finally {
      setMutating(false);
    }
  }

  const filtered = Boolean(debouncedSearch || status || rating || date !== "all");
  const actionText = pendingAction?.kind === "approve"
    ? { title: "Approuver cet avis ?", description: "Il deviendra visible sur la fiche produit.", label: "Approuver", variant: "success" as const }
    : pendingAction?.kind === "reject"
      ? { title: "Refuser cet avis ?", description: "Il restera invisible sur la boutique.", label: "Refuser", variant: "warning" as const }
      : { title: "Supprimer définitivement cet avis ?", description: "Cette action est irréversible.", label: "Supprimer", variant: "danger" as const };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Avis</h1>
        <p className="mt-1 text-sm text-ink-muted">Gestion des avis clients</p>
      </div>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Statistiques des avis">
        {([
          { label: "Total des avis", value: stats?.total, icon: MessageSquareText, colors: "bg-rose-50 text-primary" },
          { label: "En attente", value: stats?.pending, icon: Clock3, colors: "bg-amber-50 text-amber-600" },
          { label: "Approuvés", value: stats?.approved, icon: ShieldCheck, colors: "bg-emerald-50 text-emerald-600" },
          { label: "Note moyenne", value: stats ? `${stats.averageRating.toFixed(1)} / 5` : undefined, icon: Star, colors: "bg-violet-50 text-violet-600" },
        ] satisfies Kpi[]).map(({ label, value, icon: Icon, colors }) => (
          <div key={label} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div><p className="text-xs font-medium text-ink-muted">{label}</p>{value === undefined ? <Skeleton className="mt-2 h-7 w-16" /> : <p className="mt-1 text-2xl font-bold text-ink">{String(value)}</p>}</div>
              <span className={`rounded-xl p-2 ${colors}`}><Icon className="size-4" /></span>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_repeat(4,minmax(140px,auto))]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un client, produit ou avis..." className={`${selectClass} w-full pl-10`} />
          </label>
          <select aria-label="Statut" value={status} onChange={(event) => updateFilter(setStatus, event.target.value)} className={selectClass}><option value="">Tous les statuts</option><option value="PENDING">En attente</option><option value="APPROVED">Approuvé</option><option value="REJECTED">Refusé</option></select>
          <select aria-label="Note" value={rating} onChange={(event) => updateFilter(setRating, event.target.value)} className={selectClass}><option value="">Toutes les notes</option>{[5,4,3,2,1].map((number) => <option key={number} value={number}>{number} étoile{number > 1 ? "s" : ""}</option>)}</select>
          <select aria-label="Date" value={date} onChange={(event) => updateFilter(setDate, event.target.value)} className={selectClass}><option value="all">Toutes les dates</option><option value="today">Aujourd’hui</option><option value="7d">7 derniers jours</option><option value="30d">30 derniers jours</option></select>
          <select aria-label="Tri" value={sort} onChange={(event) => updateFilter(setSort, event.target.value)} className={selectClass}><option value="newest">Plus récents</option><option value="oldest">Plus anciens</option><option value="rating_desc">Meilleure note</option><option value="rating_asc">Plus mauvaise note</option></select>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center"><XCircle className="mx-auto size-8 text-rose-500" /><p className="mt-3 font-semibold text-ink">Impossible de charger les avis</p><p className="mt-1 text-sm text-ink-muted">{error}</p><button type="button" onClick={() => void load()} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Réessayer</button></div>
      ) : loading ? (
        <div className="space-y-2 rounded-2xl border border-border bg-white p-4">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-16 w-full rounded-xl" />)}</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center"><MessageSquareText className="mx-auto size-10 text-ink-faint" /><p className="mt-4 font-semibold text-ink">{status === "PENDING" && !debouncedSearch && !rating ? "Tous les avis ont été modérés." : filtered ? "Aucun avis ne correspond à vos filtres." : "Aucun avis client pour le moment."}</p><p className="mt-1 text-sm text-ink-muted">Les nouveaux avis apparaîtront ici dès leur envoi.</p></div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-border bg-white shadow-sm lg:block">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="border-b border-border bg-[#fbf8f8] text-xs uppercase tracking-wide text-ink-muted"><tr><th className="w-[20%] px-5 py-3">Client</th><th className="w-[20%] px-5 py-3">Produit</th><th className="w-[11%] px-5 py-3">Note</th><th className="w-[22%] px-5 py-3">Avis</th><th className="w-[12%] px-5 py-3">Date</th><th className="w-[9%] px-5 py-3">Statut</th><th className="w-[12%] px-5 py-3 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-border">
                {items.map((review) => (
                  <tr key={review.id} className="transition hover:bg-[#fdfafa]">
                    <td className="px-5 py-4"><div className="flex min-w-0 items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{initials(review.user.name, review.user.email)}</span><div className="min-w-0"><p className="truncate font-semibold text-ink">{review.user.name || "Client"}</p><p className="truncate text-xs text-ink-muted">{review.user.email}</p></div></div></td>
                    <td className="px-5 py-4"><Link href={`/admin/produits?product=${review.product.id}`} className="flex min-w-0 items-center gap-3 hover:text-primary"><span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-white"><img src={review.product.image} alt="" className="size-full object-contain" /></span><span className="truncate font-medium">{review.product.name}</span></Link></td>
                    <td className="px-5 py-4"><Stars rating={review.rating} /><div className="mt-1">{review.verified && <VerifiedBadge />}</div></td>
                    <td className="px-5 py-4"><button type="button" onClick={() => setSelected(review)} className="line-clamp-2 text-left leading-5 text-ink-muted hover:text-primary">{review.body || review.title || "Sans commentaire"}</button></td>
                    <td className="px-5 py-4 text-xs text-ink-muted">{new Intl.DateTimeFormat("fr-TN", { dateStyle: "short", timeStyle: "short" }).format(new Date(review.createdAt))}</td>
                    <td className="px-5 py-4"><StatusBadge status={review.status} /></td>
                    <td className="px-5 py-4"><ActionButtons review={review} onView={() => setSelected(review)} onAction={(kind) => setPendingAction({ review, kind })} busy={mutating} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 lg:hidden">
            {items.map((review) => (
              <article key={review.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{initials(review.user.name, review.user.email)}</span><div className="min-w-0"><p className="truncate font-semibold text-ink">{review.user.name || "Client"}</p><p className="truncate text-xs text-ink-muted">{review.user.email}</p></div></div><StatusBadge status={review.status} /></div>
                <div className="mt-4 flex items-center justify-between gap-3"><Stars rating={review.rating} />{review.verified && <VerifiedBadge />}</div>
                <Link href={`/admin/produits?product=${review.product.id}`} className="mt-3 block truncate text-sm font-semibold text-primary">{review.product.name}</Link>
                <button type="button" onClick={() => setSelected(review)} className="mt-2 line-clamp-2 text-left text-sm leading-6 text-ink-muted">{review.body || review.title || "Sans commentaire"}</button>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3"><span className="text-xs text-ink-faint">{new Intl.DateTimeFormat("fr-TN", { dateStyle: "medium" }).format(new Date(review.createdAt))}</span><ActionButtons review={review} onView={() => setSelected(review)} onAction={(kind) => setPendingAction({ review, kind })} busy={mutating} /></div>
              </article>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-border bg-white px-4 py-3 sm:flex-row">
            <p className="text-sm text-ink-muted">{pagination.total} résultat{pagination.total > 1 ? "s" : ""} · Page {pagination.page} sur {pagination.pageCount}</p>
            <div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium disabled:opacity-40"><ChevronLeft className="size-4" />Précédent</button><button type="button" disabled={page >= pagination.pageCount} onClick={() => setPage((current) => current + 1)} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium disabled:opacity-40">Suivant<ChevronRight className="size-4" /></button></div>
          </div>
        </>
      )}

      <Drawer open={Boolean(selected)} title="Détail de l’avis" description={selected ? `${selected.product.name} · ${statusMeta[selected.status].label}` : undefined} onClose={() => setSelected(null)} footer={selected && <ActionButtons review={selected} onView={() => undefined} onAction={(kind) => setPendingAction({ review: selected, kind })} busy={mutating} />}>
        {selected && <ReviewDetail review={selected} />}
      </Drawer>
      <ConfirmModal open={Boolean(pendingAction)} title={actionText.title} description={mutating ? "Traitement en cours…" : actionText.description} confirmLabel={mutating ? "Traitement…" : actionText.label} variant={actionText.variant} onConfirm={() => void confirmAction()} onCancel={() => { if (!mutating) setPendingAction(null); }} />
    </div>
  );
}

function ReviewDetail({ review }: { review: Review }) {
  const date = new Intl.DateTimeFormat("fr-TN", { dateStyle: "long", timeStyle: "short" });
  return <div className="space-y-5">
    <section className="rounded-2xl border border-border bg-white p-4"><h3 className="text-xs font-bold uppercase tracking-wide text-ink-muted">Client</h3><dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2"><Info label="Nom" value={review.user.name || "Non renseigné"} /><Info label="Email" value={review.user.email} /><Info label="Téléphone" value={review.user.phone || "Non renseigné"} /><Info label="ID client" value={review.user.id} mono /></dl></section>
    <section className="rounded-2xl border border-border bg-white p-4"><h3 className="text-xs font-bold uppercase tracking-wide text-ink-muted">Produit</h3><div className="mt-3 flex gap-4"><span className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border"><img src={review.product.image} alt={review.product.name} className="size-full object-contain" /></span><div><p className="font-semibold text-ink">{review.product.name}</p><p className="mt-1 text-sm text-ink-muted">{review.product.brand.name} · {review.product.category.name}</p><Link href={`/admin/produits?product=${review.product.id}`} className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">Ouvrir le produit</Link></div></div></section>
    <section className="rounded-2xl border border-border bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-xs font-bold uppercase tracking-wide text-ink-muted">Avis</h3><StatusBadge status={review.status} /></div><div className="mt-3 flex flex-wrap items-center gap-2"><Stars rating={review.rating} />{review.verified && <VerifiedBadge />}</div>{review.title && <h4 className="mt-4 font-semibold text-ink">{review.title}</h4>}<p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink">{review.body || "Aucun commentaire."}</p><p className="mt-4 text-xs text-ink-faint">Publié le {date.format(new Date(review.createdAt))}</p></section>
    {review.order && <section className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4"><div className="flex items-center justify-between gap-2"><h3 className="text-xs font-bold uppercase tracking-wide text-sky-800">Commande associée</h3>{review.verified && <VerifiedBadge />}</div><dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2"><Info label="Numéro" value={`#${review.order.id}`} mono /><Info label="Statut" value={review.order.status} /><Info label="Date" value={date.format(new Date(review.order.createdAt))} /></dl></section>}
  </div>;
}

function Info({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div><dt className="text-xs text-ink-faint">{label}</dt><dd className={`mt-0.5 break-words font-medium text-ink ${mono ? "font-mono text-xs" : ""}`}>{value}</dd></div>;
}
