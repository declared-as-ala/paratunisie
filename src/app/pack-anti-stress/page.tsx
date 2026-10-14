import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Pack Anti-Stress indisponible",
  description: "Ce pack n’est pas actuellement proposé dans le catalogue ParaTunisie.",
  path: "/pack-anti-stress", noindex: true,
});

export default function PackAntiStressPage() {
  return <main className="mx-auto max-w-3xl space-y-5 px-4 py-16">
    <h1 className="font-serif text-3xl">Ce pack est indisponible</h1>
    <p>Les références nécessaires à ce pack ne sont pas actuellement proposées ensemble. Aucun prix ni stock de pack n’est disponible.</p>
    <Link href="/complements-alimentaires" className="inline-flex rounded-xl bg-primary px-5 py-3 text-white">Voir les compléments alimentaires</Link>
  </main>;
}