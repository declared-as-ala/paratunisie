"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Tag, Sparkles, Sun, Droplets, Baby, Activity, Heart, Palette } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { fetchCategories } from "@/lib/api/client";
import { featuredBrands } from "@/lib/data/navigation";

type CategoryGroup = {
  title: string;
  slug: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  description: string;
  subcategories: { name: string; slug: string }[];
};

const MAIN_CATEGORY_GROUPS: CategoryGroup[] = [
  {
    title: "Visage",
    slug: "visage",
    icon: Sparkles,
    description: "Nettoyants, sérums, crèmes et soins ciblés.",
    subcategories: [
      { name: "Sérums & Huiles", slug: "serums" },
      { name: "Peaux Mixtes, Grasses & Acné", slug: "peaux-mixtes-grasses-acne-et-imperfections" },
      { name: "Soin Anti-Âge & Liftant", slug: "soin-anti-age" },
      { name: "Anti-Taches & Dépigmentants", slug: "concentre-anti-tache-depigmentant" },
      { name: "Hydratants & Crèmes", slug: "hydratant" },
      { name: "Démaquillants & Eau Micellaire", slug: "demaquillant-sous-la-douche" },
    ],
  },
  {
    title: "Solaire",
    slug: "solaire",
    icon: Sun,
    description: "Protection solaire visage et corps SPF 50+.",
    subcategories: [
      { name: "Indice Solaire Fort (SPF 40 à 50+)", slug: "indice-solaire-fort-40-a-50" },
      { name: "Maquillage Solaire", slug: "maquillage-solaire" },
      { name: "Protection Visage & Corps", slug: "protection-solaire" },
      { name: "Crèmes Solaires", slug: "creme-solaire" },
    ],
  },
  {
    title: "Cheveux",
    slug: "cheveux",
    icon: Droplets,
    description: "Shampoings, masques et soins anti-chute.",
    subcategories: [
      { name: "Shampoings", slug: "shampooing" },
      { name: "Soins Capillaires & Masques", slug: "soins-cheveux" },
      { name: "Huiles Végétales", slug: "huiles-vegetales" },
      { name: "Cheveux Colorés & Secs", slug: "cheveux-secs-apres-shampooing" },
      { name: "Traitements Anti-Chute & Minoxidil", slug: "minoxidil" },
    ],
  },
  {
    title: "Bébé & Maternité",
    slug: "bebe-maman",
    icon: Baby,
    description: "Soins doux pour bébé et maman.",
    subcategories: [
      { name: "Sucettes & Attache-sucettes", slug: "sucette" },
      { name: "Biberons & Tasses", slug: "biberon" },
      { name: "Toilette & Bain Bébé", slug: "toilette-et-bain-bebe" },
      { name: "Change de Bébé", slug: "change-de-bebe" },
      { name: "Marque NUK", slug: "nuk" },
      { name: "Marque CHICCO", slug: "chicco" },
      { name: "Marque Tommee Tippee", slug: "tommee-tippee" },
    ],
  },
  {
    title: "Santé & Orthopédie",
    slug: "sante-orthopedie",
    icon: Activity,
    description: "Vitamines, orthopédie Tynor et bien-être.",
    subcategories: [
      { name: "Orthopédie & Attelles (Tynor)", slug: "tynor" },
      { name: "Vitamines & Minéraux", slug: "vitamines" },
      { name: "Compléments Alimentaires", slug: "complements-alimentaires" },
      { name: "Chaussures & Sandales Confort", slug: "chaussure" },
      { name: "Produits Orthopédiques", slug: "produits-orthopediques" },
    ],
  },
  {
    title: "Hygiène & Corps",
    slug: "hygiene-corps",
    icon: Heart,
    description: "Toilette intime, gels douche et savons.",
    subcategories: [
      { name: "Toilette Intime", slug: "toilette-intime" },
      { name: "Gels Douche & Savons Surgras", slug: "gel-douche-savon-surgras" },
      { name: "Soins des Mains, Pieds & Déodorants", slug: "deodorant-pieds-soin-des-pieds-corps-7" },
    ],
  },
  {
    title: "Maquillage",
    slug: "maquillage",
    icon: Palette,
    description: "Vernis à ongles, rouges à lèvres et teint.",
    subcategories: [
      { name: "Gamme Maquillage Topface", slug: "topface" },
      { name: "Vernis à Ongles", slug: "vernis-a-ongles" },
      { name: "Rouges à Lèvres", slug: "rouges-a-levres" },
      { name: "Marque Pierre Cardin", slug: "pierre-cardin" },
      { name: "Marque Lollis", slug: "lollis" },
    ],
  },
];

export function MegaMenu() {
  const [dbCategories, setDbCategories] = useState<{ name: string; slug: string }[]>([]);

  useEffect(() => {
    fetchCategories()
      .then((cats) => setDbCategories(cats))
      .catch(() => {});
  }, []);

  return (
    <NavigationMenu className="hidden lg:flex">
      <NavigationMenuList className="gap-1">
        {/* Dynamic All-Categories Dropdown */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="font-bold text-ink text-primary bg-primary/5 hover:bg-primary/10">
            <Tag size={14} className="mr-1.5 text-primary" /> Toutes les Catégories
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-[580px] p-6">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  Catalogue Complet ({dbCategories.length || "1 700+"} catégories)
                </p>
                <Link
                  href="/shop"
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  Voir tout le shop <ArrowRight size={12} />
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-x-4 gap-y-2 max-h-[360px] overflow-y-auto pr-2">
                {(dbCategories.length > 0
                  ? dbCategories.slice(0, 36)
                  : [
                      { name: "Visage", slug: "visage" },
                      { name: "Sérums", slug: "serums" },
                      { name: "Solaire", slug: "solaire" },
                      { name: "Shampoings", slug: "shampooing" },
                      { name: "Bébé & Maman", slug: "bebe-maman" },
                      { name: "Sucette", slug: "sucette" },
                      { name: "Orthopédie (Tynor)", slug: "tynor" },
                      { name: "Toilette intime", slug: "toilette-intime" },
                      { name: "Vitamines", slug: "vitamines" },
                      { name: "Vernis à ongles", slug: "vernis-a-ongles" },
                    ]
                ).map((cat) => (
                  <NavigationMenuLink key={cat.slug} render={<Link href={`/shop?category=${encodeURIComponent(cat.slug)}`} />}>
                    <span className="text-xs font-medium text-ink hover:text-primary transition-colors block truncate py-1.5 px-2 rounded-md hover:bg-soft-nude">
                      {cat.name}
                    </span>
                  </NavigationMenuLink>
                ))}
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Main Categories with Hover Subcategory Dropdowns */}
        {MAIN_CATEGORY_GROUPS.map((group) => {
          const Icon = group.icon;
          return (
            <NavigationMenuItem key={group.slug}>
              <NavigationMenuTrigger className="font-semibold text-ink text-xs hover:text-primary">
                <Icon size={14} className="mr-1 text-primary/80" />
                {group.title}
              </NavigationMenuTrigger>

              <NavigationMenuContent>
                <div className="grid w-[480px] grid-cols-[1.1fr_1.4fr] gap-6 p-5">
                  {/* Left Column: Category Description & All-Products Button */}
                  <div className="flex flex-col justify-between border-r border-border pr-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon size={18} className="text-primary" />
                        <h4 className="text-sm font-extrabold text-ink font-serif">{group.title}</h4>
                      </div>
                      <p className="text-xs leading-5 text-ink-muted">{group.description}</p>
                    </div>

                    <NavigationMenuLink
                      render={
                        <Link
                          href={`/shop?category=${encodeURIComponent(group.slug)}`}
                          className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                        />
                      }
                    >
                      Voir tous les produits {group.title.toLowerCase()}
                      <ArrowRight size={12} />
                    </NavigationMenuLink>
                  </div>

                  {/* Right Column: Subcategories List */}
                  <div>
                    <p className="text-[0.6875rem] font-bold tracking-wider text-primary uppercase mb-2.5">
                      Sous-catégories
                    </p>
                    <ul className="space-y-1">
                      {group.subcategories.map((sub) => (
                        <li key={sub.slug}>
                          <NavigationMenuLink
                            render={<Link href={`/shop?category=${encodeURIComponent(sub.slug)}`} />}
                          >
                            <span className="text-xs font-medium text-ink hover:text-primary hover:bg-soft-nude/70 transition-all block py-1.5 px-2 rounded-lg truncate">
                              {sub.name}
                            </span>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}

        {/* Direct Link to Marques Page */}
        <NavigationMenuItem>
          <Link
            href="/marques"
            className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-3 py-2 text-xs font-semibold text-ink transition-colors hover:bg-soft-nude hover:text-primary focus:bg-soft-nude focus:text-primary focus:outline-none"
          >
            Marques
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
