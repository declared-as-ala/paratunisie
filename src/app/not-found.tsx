import Link from "next/link";
import { Compass, Home, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { primaryCategories, secondaryNav } from "@/lib/data/navigation";

const categoryHighlights = primaryCategories.slice(0, 4);

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-[1100px] flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-border bg-surface-alt p-8 shadow-xl shadow-slate-900/5 sm:p-10">
        <div className="grid gap-10 lg:grid-cols-[auto_minmax(0,380px)] lg:items-center lg:gap-12">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/90">
              404 — Page introuvable
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl">
              Oups, cette page a pris un chemin différent.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-ink-muted sm:text-lg">
              Nous n’avons pas trouvé le contenu demandé. Retournez à l’accueil, explorez nos catégories de soins ou repartez vers votre routine beauté.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button size="lg" render={<Link href="/" />}>
                <Home className="size-4" aria-hidden />
                Accueil
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/shop" />}>
                <ShoppingBag className="size-4" aria-hidden />
                Boutique
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-3xl bg-background p-6 shadow-sm shadow-slate-900/5">
              <p className="text-sm font-medium text-ink">À découvrir en priorité</p>
              <ul className="mt-5 grid gap-3">
                {categoryHighlights.map((category) => (
                  <li key={category.href}>
                    <Link
                      href={category.href}
                      className="group flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-4 text-sm text-ink transition hover:border-primary hover:bg-primary/5"
                    >
                      <span>{category.label}</span>
                      <span className="text-primary transition-transform group-hover:translate-x-0.5">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-3xl bg-primary/5 p-6">
              <p className="text-sm font-medium text-primary">Navigation rapide</p>
              <ul className="mt-5 space-y-3 text-sm text-ink-muted">
                {secondaryNav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-foreground transition hover:text-ink">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
