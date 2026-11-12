import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  Tags,
  BookOpen,
  Star,
  Boxes,
  BarChart3,
  Wallet,
  Gift,
  FileBarChart,
  PackageSearch,
  Upload,
  Home,
  Hourglass,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
};

export type NavSection = { title: string; items: NavItem[] };

/** Single source for the sidebar, the breadcrumbs and the Ctrl+K command palette. */
export const navSections: NavSection[] = [
  {
    title: "Vue d'ensemble",
    items: [{ label: "Tableau de bord", href: "/admin", icon: LayoutDashboard }],
  },
  {
    title: "Analyse et rapports",
    items: [
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { label: "Rapports", href: "/admin/rapports", icon: FileBarChart },
      { label: "Rentabilité", href: "/admin/rentabilite", icon: Wallet },
    ],
  },
  {
    title: "Commandes",
    items: [
      { label: "Commandes", href: "/admin/commandes", icon: ShoppingCart },
      { label: "Commandes abandonnées", href: "/admin/commandes-abandonnees", icon: Hourglass },
      { label: "Demandes produits", href: "/admin/demandes", icon: PackageSearch },
    ],
  },
  {
    title: "Catalogue",
    items: [
      { label: "Produits", href: "/admin/produits", icon: Package },
      { label: "Marques", href: "/admin/marques", icon: Tags },
      { label: "Catégories", href: "/admin/categories", icon: Tags },
      { label: "Importation", href: "/admin/importation", icon: Upload },
    ],
  },
  {
    title: "Clients",
    items: [
      { label: "Clients", href: "/admin/clients", icon: Users },
      { label: "Avis", href: "/admin/avis", icon: Star },
      { label: "Fidélité", href: "/admin/fidelite", icon: Gift },
    ],
  },
  {
    title: "Logistique",
    items: [{ label: "Stocks", href: "/admin/stocks", icon: Boxes }],
  },
  {
    title: "Contenu et SEO",
    items: [
      { label: "Page d'accueil", href: "/admin/page-accueil", icon: Home },
      { label: "Conseils & Articles", href: "/admin/articles", icon: BookOpen },
    ],
  },
  {
    title: "Paramètres",
    items: [{ label: "Paramètres", href: "/admin/parametres", icon: Settings }],
  },
];

export function findNavItem(pathname: string) {
  let best: { section: NavSection; item: NavItem } | null = null;
  for (const section of navSections) {
    for (const item of section.items) {
      const match = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
      if (match && (!best || item.href.length > best.item.href.length)) best = { section, item };
    }
  }
  return best;
}
