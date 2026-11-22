"use client";

import { useState } from "react";
import { Copy, LoaderCircle, Send } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";

type Link = { productId: string; productName: string; url: string; status: string };
type Result = { orderId: string; customer: string | null; links: Link[]; note: string };

/**
 * Prepares the private review links of ONE shipped or delivered order. Nothing is sent from here: staff copy a link and contact
 * only customers who agreed to be contacted, without asking for a positive rating.
 */
export function ReviewInvitationsPanel() {
  const [orderId, setOrderId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState("");

  async function prepare(event: React.FormEvent) {
    event.preventDefault();
    if (!orderId.trim()) return;
    setBusy(true); setError(""); setResult(null);
    try { setResult(await apiClient.post<Result>(`/reviews/admin/invitations/${encodeURIComponent(orderId.trim())}`)); }
    catch (e) { setError(e instanceof ApiError ? e.message : "Impossible de préparer les liens."); }
    finally { setBusy(false); }
  }
  async function copy(url: string) {
    try { await navigator.clipboard.writeText(url); setCopied(url); window.setTimeout(() => setCopied(""), 2000); } catch { setError("Copie impossible : sélectionnez le lien manuellement."); }
  }

  return (
    <section className="space-y-3 rounded-xl border border-border bg-white p-4" aria-label="Inviter un client à donner son avis">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink"><Send className="size-4 text-primary" aria-hidden /> Inviter un acheteur vérifié</h2>
        <p className="mt-0.5 max-w-3xl text-xs text-ink-muted">Générez un lien privé par produit pour une commande expédiée ou livrée. Aucun message n&apos;est envoyé automatiquement : contactez uniquement les clients qui ont accepté d&apos;être contactés, sans les inciter à laisser une bonne note.</p>
      </div>
      <form onSubmit={prepare} className="flex flex-wrap items-center gap-2">
        <label htmlFor="inv-order" className="sr-only">Identifiant de la commande</label>
        <input id="inv-order" value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="Identifiant de la commande" className="h-11 w-72 rounded-lg border border-border px-3 text-sm" />
        <button type="submit" disabled={busy || !orderId.trim()} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-900 px-4 text-xs font-bold text-white disabled:opacity-50">
          {busy ? <LoaderCircle className="size-4 animate-spin" /> : null} Préparer les liens
        </button>
      </form>
      {error ? <p role="alert" className="text-xs font-semibold text-red-700">{error}</p> : null}
      {result ? (
        <div className="space-y-2 text-xs" role="status">
          <p className="font-bold text-ink">{result.customer ? `Client : ${result.customer}` : "Commande"} · {result.links.length} produit(s)</p>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {result.links.map((l) => (
              <li key={l.productId} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                <span className="font-semibold text-ink">{l.productName}</span>
                {l.url ? (
                  <span className="flex items-center gap-2"><code className="max-w-[18rem] truncate rounded bg-slate-100 px-1.5 py-0.5">{l.url}</code>
                    <button type="button" onClick={() => copy(l.url)} className="inline-flex min-h-9 items-center gap-1 rounded-md border border-border px-2 font-bold"><Copy className="size-3.5" aria-hidden />{copied === l.url ? "Copié" : "Copier"}</button></span>
                ) : <span className="text-ink-muted">{l.status}</span>}
              </li>
            ))}
          </ul>
          <p className="text-ink-muted">{result.note}</p>
        </div>
      ) : null}
    </section>
  );
}
