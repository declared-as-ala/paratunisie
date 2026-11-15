import { ReviewsPage } from "./reviews-page";
import { ReviewInvitationsPanel } from "@/components/review-invitations-panel";

export default function AvisPage() {
  return (
    <div className="space-y-6">
      <ReviewInvitationsPanel />
      <ReviewsPage />
    </div>
  );
}
