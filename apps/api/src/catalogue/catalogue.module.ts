import { Module } from "@nestjs/common";
import { CatalogueController } from "./catalogue.controller";
import { CatalogueService } from "./catalogue.service";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";
import { SearchModule } from "../search/search.module";

@Module({
  imports: [AdminAuthModule, SearchModule],
  controllers: [CatalogueController],
  providers: [CatalogueService],
  exports: [CatalogueService],
})
export class CatalogueModule {}
