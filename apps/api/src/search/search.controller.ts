import { Controller, Post, UseGuards } from "@nestjs/common";
import { MeilisearchService } from "./meilisearch.service";
import { AdminAuthGuard } from "../admin-auth/guards/admin-auth.guard";

@Controller("search")
export class SearchController {
  constructor(private meilisearchService: MeilisearchService) {}

  @UseGuards(AdminAuthGuard)
  @Post("reindex")
  async reindex() {
    return this.meilisearchService.reindexAllProducts();
  }
}
