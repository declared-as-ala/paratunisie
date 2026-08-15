import { Module } from "@nestjs/common";
import { MeilisearchService } from "./meilisearch.service";
import { SearchController } from "./search.controller";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";

@Module({
  imports: [AdminAuthModule],
  controllers: [SearchController],
  providers: [MeilisearchService],
  exports: [MeilisearchService],
})
export class SearchModule {}
