import { HomePage } from "@/components/home/home-page";
import { fetchHomepageCategoryRows } from "@/lib/api/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const categoryRows = await fetchHomepageCategoryRows();
  return <HomePage categoryRows={categoryRows} />;
}
