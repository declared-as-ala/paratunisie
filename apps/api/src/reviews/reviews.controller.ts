import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { AdminAuthGuard } from "../admin-auth/guards/admin-auth.guard";
import { ReviewsService } from "./reviews.service";
import { AdminReviewsQueryDto } from "./dto/admin-reviews-query.dto";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewStatusDto } from "./dto/update-review-status.dto";

@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get("product/:productId")
  getProductReviews(@Param("productId") productId: string) {
    return this.reviewsService.getReviewsByProduct(productId);
  }

  @Get("product/:productId/rating")
  getProductRating(@Param("productId") productId: string) {
    return this.reviewsService.getProductRating(productId);
  }

  @Post()
  createReview(@Body() body: CreateReviewDto) {
    return this.reviewsService.createReview(body.userId, body.productId, body);
  }

  @UseGuards(AdminAuthGuard)
  @Get("admin/stats")
  getAdminStats(@Query() query: AdminReviewsQueryDto) {
    return this.reviewsService.getAdminStats(query);
  }

  @UseGuards(AdminAuthGuard)
  @Get("admin")
  getAdminReviews(@Query() query: AdminReviewsQueryDto) {
    return this.reviewsService.getAdminReviews(query);
  }

  @UseGuards(AdminAuthGuard)
  @Get("admin/:id")
  getAdminReview(@Param("id") id: string) {
    return this.reviewsService.getAdminReview(id);
  }

  @UseGuards(AdminAuthGuard)
  @Patch("admin/:id/status")
  updateStatus(@Param("id") id: string, @Body() body: UpdateReviewStatusDto) {
    return this.reviewsService.updateStatus(id, body.status);
  }

  @UseGuards(AdminAuthGuard)
  @Delete("admin/:id")
  deleteReview(@Param("id") id: string) {
    return this.reviewsService.deleteReview(id);
  }
}
