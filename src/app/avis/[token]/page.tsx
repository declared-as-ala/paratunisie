import type { Metadata } from "next";
import { ReviewForm } from "@/components/reviews/review-form";

// Private link: never indexed, never followed, never shared in search results.
export const metadata: Metadata = {
  title: "Votre avis | ParaTunisie",
  robots: { index: false, follow: false, nocache: true },
};

export default async function ReviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:py-14">
      <ReviewForm token={token} />
    </main>
  );
}
