import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { WishlistService } from "./wishlist.service";

@Controller("wishlist")
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post("toggle")
  async toggle(@Body() body: { userId: string; productId: string }) {
    return this.wishlistService.toggle(body.userId, body.productId);
  }

  @Get("user/:userId")
  async getUserWishlist(@Param("userId") userId: string) {
    return this.wishlistService.getUserWishlist(userId);
  }
}
