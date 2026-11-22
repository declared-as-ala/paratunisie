import type { Metadata } from "next";

import { LocalRoute, localMetadata } from "@/lib/local/route";

type Props = { params: Promise<{ gouvernorat: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return localMetadata("parapharmacie", (await params).gouvernorat);
}

export default async function Page({ params }: Props) {
  return <LocalRoute cluster="parapharmacie" slug={(await params).gouvernorat} />;
}
