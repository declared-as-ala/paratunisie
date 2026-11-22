import type { Metadata } from "next";

import { LocalHub } from "@/components/local/local-hub";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

// Directory page: kept noindex until the regional pages it lists have proven useful in Search Console.
export const metadata: Metadata = buildPageMetadata({
  title: "Protéine et nutrition sportive par gouvernorat",
  description: "Choisissez votre gouvernorat pour consulter la whey, la créatine et les gainers en stock et les conditions de livraison.",
  path: "/proteine",
  noindex: true,
});

export default function Page() {
  return <LocalHub cluster="proteine" title="Protéine et nutrition sportive par gouvernorat" intro="Choisissez votre gouvernorat pour consulter la whey, la créatine et les gainers en stock et les conditions de livraison. ParaTunisie est une boutique en ligne : la livraison couvre les 24 gouvernorats." />;
}
