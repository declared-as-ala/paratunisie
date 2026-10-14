import { Module } from "@nestjs/common";
import { CatalogueController } from "./catalogue.controller";
import { CatalogueService } from "./catalogue.service";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";
import { SearchModule } from "../search/search.module";
import { CatalogueSeoService } from "./catalogue-seo.service";
import { SeoChecklistService } from "./seo-checklist.service";

@Module({
  imports: [AdminAuthModule, SearchModule],
  controllers: [CatalogueController],
  providers: [CatalogueService, CatalogueSeoService, SeoChecklistService],
  exports: [CatalogueService],
})
export class CatalogueModule {}
