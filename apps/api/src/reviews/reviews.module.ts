import { Module } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { ReviewInvitationsService } from "./review-invitations.service";
import { ReviewsController } from "./reviews.controller";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";

@Module({
  imports: [AdminAuthModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewInvitationsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
