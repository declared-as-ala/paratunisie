import { redirect, permanentRedirect } from "next/navigation";

const CATEGORY_REDIRECTS: Record<string, string> = {
  "bien-etre": "/bien-etre",
  "creatine": "/creatine",
  "whey-proteine": "/whey-proteine",
  "mass-gainer": "/gainers-proteines",
  "pre-workout": "/pre-workout",
  "acides-amines": "/acides-amines",
  "l-carnitine": "/l-carnitine",
  "vitamines": "/vitamines",
  "mineraux": "/mineraux",
  "vitamines-mineraux": "/vitamines",
  "soins": "/soins",
  "accessoires": "/accessoires",
};

export default async function CategoryCatchAllPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const target = CATEGORY_REDIRECTS[slug] || `/${slug}`;
  permanentRedirect(target);
}
