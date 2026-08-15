import { Search, Filter } from "lucide-react";
import { DELIVERY_STATUS_MAP, type Delivery } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

/* ─── Mock data ─────────────────────────────────────────────────────── */

const deliveries: (Delivery & { customerName: string })[] = [
  { id: "d1", orderId: "CMD-2024-0843", orderReference: "#843", customerName: "Nour H.", governorate: "Tunis", delegation: "La Marsa", status: "EN_COURS", carrier: "Tunisie Colis", trackingNumber: "TC-2024-1234", estimatedDate: new Date(Date.now() + 24 * 60 * 60000).toISOString(), createdAt: new Date(Date.now() - 5 * 60 * 60000).toISOString() },
  { id: "d2", orderId: "CMD-2024-0842", orderReference: "#842", customerName: "Ahmed M.", governorate: "Bizerte", delegation: "Bizerte", status: "EN_ATTENTE", createdAt: new Date(Date.now() - 8 * 60 * 60000).toISOString() },
  { id: "d3", orderId: "CMD-2024-0840", orderReference: "#840", customerName: "Karim D.", governorate: "Gabès", delegation: "Gabès", status: "ECHEC", carrier: "ZR Express", notes: "Client injoignable", createdAt: new Date(Date.now() - 24 * 60 * 60000).toISOString() },
  { id: "d4", orderId: "CMD-2024-0838", orderReference: "#838", customerName: "Sami R.", governorate: "Sfax", delegation: "Sfax", status: "LIVREE", carrier: "Tunisie Colis", trackingNumber: "TC-2024-1198", deliveredAt: new Date(Date.now() - 48 * 60 * 60000).toISOString(), createdAt: new Date(Date.now() - 72 * 60 * 60000).toISOString() },
  { id: "d5", orderId: "CMD-2024-0835", orderReference: "#835", customerName: "Leila B.", governorate: "Sousse", delegation: "Sousse", status: "RETOUR", carrier: "ZR Express", notes: "Produit endommagé", createdAt: new Date(Date.now() - 96 * 60 * 60000).toISOString() },
  { id: "d6", orderId: "CMD-2024-0832", orderReference: "#832", customerName: "Hatem F.", governorate: "Kairouan", delegation: "Kairouan", status: "LIVREE", carrier: "Tunisie Colis", deliveredAt: new Date(Date.now() - 120 * 60 * 60000).toISOString(), createdAt: new Date(Date.now() - 144 * 60 * 60000).toISOString() },
];

const statusCounts: Record<Delivery["status"], number> = {
  EN_ATTENTE: 1,
  EN_COURS: 1,
  LIVREE: 2,
  ECHEC: 1,
  RETOUR: 1,
};

/* ─── Helpers ────────────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: Delivery["status"] }) {
  const s = DELIVERY_STATUS_MAP[status];
  return <span className={`badge ${s.badge}`}>{s.label}</span>;
}

/* ─── Page ───────────────────────────────────────────────────────────── */

export default function LivraisonsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink">Livraisons</h1>
          <p className="text-sm text-ink-muted">Suivi des livraisons et retours</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="kpi-card">
          <p className="kpi-label">En attente</p>
          <p className="kpi-value mt-1">{statusCounts.EN_ATTENTE}</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-label">En cours</p>
          <p className="kpi-value mt-1">{statusCounts.EN_COURS}</p>
        </div>
        <div className="kpi-card border-l-2 border-l-red-400">
          <p className="kpi-label">Échecs</p>
          <p className="kpi-value mt-1">{statusCounts.ECHEC}</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-label">Retours</p>
          <p className="kpi-value mt-1">{statusCounts.RETOUR}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            type="search"
            placeholder="Rechercher par commande ou client…"
            className="w-full rounded-md border border-border bg-background pl-8 pr-3 py-1.5 text-sm placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button type="button" className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs text-ink-muted hover:bg-soft-nude">
          <Filter size={12} />
          Statut
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="admin-table w-full">
          <thead>
            <tr>
              <th>Commande</th>
              <th>Client</th>
              <th>Gouvernorat</th>
              <th>Transporteur</th>
              <th>Suivi</th>
              <th>Statut</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((d) => (
              <tr key={d.id} className="cursor-pointer">
                <td className="font-mono text-xs font-medium">{d.orderReference}</td>
                <td>{d.customerName}</td>
                <td>{d.governorate}</td>
                <td className="text-ink-muted">{d.carrier || "—"}</td>
                <td className="font-mono text-xs text-ink-faint">{d.trackingNumber || "—"}</td>
                <td><StatusBadge status={d.status} /></td>
                <td className="text-ink-muted whitespace-nowrap">{timeAgo(d.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
