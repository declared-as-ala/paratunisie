"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  Package,
  Clock,
  CheckCircle2,
  PhoneCall,
  ShoppingCart,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

type ProductRequest = {
  id: string;
  productId: string;
  fullName: string;
  phone: string;
  email: string | null;
  quantity: number;
  message: string | null;
  status: "NOUVELLE" | "CONTACTE" | "COMMANDE" | "TERMINE" | "ANNULE";
  adminNotes: string | null;
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    image: string;
    brand: { name: string } | null;
  };
};

const STATUS_CONFIG: Record<
  ProductRequest["status"],
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  NOUVELLE: {
    label: "Nouvelle",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: Clock,
  },
  CONTACTE: {
    label: "Contacté",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: PhoneCall,
  },
  COMMANDE: {
    label: "Commandé",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    icon: ShoppingCart,
  },
  TERMINE: {
    label: "Terminé",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: CheckCircle2,
  },
  ANNULE: {
    label: "Annulé",
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
    icon: XCircle,
  },
};

export default function DemandesPage() {
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams: Record<string, string> = {
        page: page.toString(),
        limit: "25",
      };
      if (statusFilter !== "ALL") {
        queryParams.status = statusFilter;
      }
      if (search.trim()) {
        queryParams.search = search.trim();
      }
      const qs = new URLSearchParams(queryParams).toString();
      const res = await apiClient.get<any>(`/product-requests?${qs}`);
      if (res?.data) {
        setRequests(res.data);
        setTotalPages(res.meta?.totalPages || 1);
        setTotalCount(res.meta?.total || 0);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des demandes:", err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleStatusChange = async (id: string, newStatus: ProductRequest["status"]) => {
    setUpdatingId(id);
    try {
      await apiClient.patch(`/product-requests/${id}`, { status: newStatus });
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demandes Produits</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestion des demandes clients pour les produits sur commande ({totalCount} total)
          </p>
        </div>
        <button
          type="button"
          onClick={fetchRequests}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50 active:scale-95 transition-all"
        >
          <RefreshCw size={15} className={loading ? "animate-spin text-primary" : ""} />
          Actualiser
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "ALL", label: "Toutes" },
            { id: "NOUVELLE", label: "Nouvelles" },
            { id: "CONTACTE", label: "Contactées" },
            { id: "COMMANDE", label: "Commandées" },
            { id: "TERMINE", label: "Terminées" },
            { id: "ANNULE", label: "Annulées" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                statusFilter === tab.id
                  ? "bg-gray-900 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-64">
          <Search className="absolute start-3 top-2.5 size-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par client, tél, produit..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-gray-300 bg-white py-2 ps-9 pe-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 focus:outline-none"
          />
        </div>
      </div>

      {/* Demands Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="border-b border-gray-200 bg-gray-50/80 font-bold uppercase tracking-wider text-gray-500 text-[0.6875rem]">
              <tr>
                <th className="px-4 py-3.5">Client & Contact</th>
                <th className="px-4 py-3.5">Produit Demandé</th>
                <th className="px-4 py-3.5 text-center">Qté</th>
                <th className="px-4 py-3.5">Message</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-primary" />
                    Chargement des demandes...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Aucune demande trouvée pour ces critères.
                  </td>
                </tr>
              ) : (
                requests.map((req) => {
                  const statusInfo = STATUS_CONFIG[req.status] || STATUS_CONFIG.NOUVELLE;
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr key={req.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Customer info */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-gray-900 text-sm">{req.fullName}</div>
                        <div className="mt-1 flex items-center gap-1.5 text-gray-600 font-semibold">
                          <Phone size={12} className="text-gray-400" />
                          <a href={`tel:${req.phone}`} className="hover:underline hover:text-primary">
                            {req.phone}
                          </a>
                        </div>
                        {req.email && (
                          <div className="mt-0.5 flex items-center gap-1.5 text-gray-500">
                            <Mail size={12} className="text-gray-400" />
                            <a href={`mailto:${req.email}`} className="hover:underline hover:text-primary">
                              {req.email}
                            </a>
                          </div>
                        )}
                      </td>

                      {/* Product info */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="size-12 rounded-lg bg-gray-100 p-1 border border-gray-200 flex items-center justify-center shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={req.product?.image || "/assets/product-tube.webp"}
                              alt={req.product?.name || "Produit"}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/assets/product-tube.webp";
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            {req.product?.brand && (
                              <p className="text-[0.625rem] font-extrabold uppercase tracking-wider text-primary truncate">
                                {req.product.brand.name}
                              </p>
                            )}
                            <a
                              href={`https://paratunisie.com/produits/${req.product?.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-gray-900 hover:text-primary transition-colors line-clamp-1 inline-flex items-center gap-1"
                            >
                              {req.product?.name || "Produit indisponible"}
                              <ExternalLink size={11} className="text-gray-400" />
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="px-4 py-3.5 text-center font-bold text-gray-900">
                        <span className="inline-flex items-center justify-center size-7 rounded-full bg-gray-100 font-tabular">
                          {req.quantity}
                        </span>
                      </td>

                      {/* Message */}
                      <td className="px-4 py-3.5 max-w-xs text-gray-600">
                        <p className="line-clamp-2 text-xs italic">
                          {req.message ? `"${req.message}"` : <span className="text-gray-400">Aucun message</span>}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-gray-400" />
                          {new Date(req.createdAt).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[0.6875rem] text-gray-400 mt-0.5">
                          {new Date(req.createdAt).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* Status Selector */}
                      <td className="px-4 py-3.5 text-center">
                        <select
                          value={req.status}
                          disabled={updatingId === req.id}
                          onChange={(e) => handleStatusChange(req.id, e.target.value as any)}
                          className={`rounded-xl px-2.5 py-1.5 text-xs font-bold border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                        >
                          <option value="NOUVELLE">Nouvelle</option>
                          <option value="CONTACTE">Contacté</option>
                          <option value="COMMANDE">Commandé</option>
                          <option value="TERMINE">Terminé</option>
                          <option value="ANNULE">Annulé</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50/50 px-4 py-3">
            <p className="text-xs text-gray-500">
              Page <span className="font-bold">{page}</span> sur <span className="font-bold">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-xs hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft size={14} />
                Précédent
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-xs hover:bg-gray-50 disabled:opacity-50"
              >
                Suivant
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
