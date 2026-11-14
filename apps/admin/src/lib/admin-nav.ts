import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Tags,
  BookOpen,
  Star,
  Boxes,
  PackageSearch,
  Upload,
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
    ],
  },
  {
    title: "Logistique",
    items: [{ label: "Stocks", href: "/admin/stocks", icon: Boxes }],
  },
  {
    title: "Contenu et SEO",
    items: [
      { label: "Conseils & Articles", href: "/admin/articles", icon: BookOpen },
    ],
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
