import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ProductPublishState } from "@prisma/client";
import { AdminAuthGuard } from "../admin-auth/guards/admin-auth.guard";
import { ImportsService } from "./services/imports.service";
import { ImportQueryDto } from "./dto/import-query.dto";
import { RunImportDto } from "./dto/run-import.dto";
import { BrandMappingDto, CategoryMappingDto } from "./dto/update-mapping.dto";

@Controller("imports")
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @UseGuards(AdminAuthGuard)
  @Get("overview")
  getOverview(@Query("providerCode") providerCode?: string) {
    return this.importsService.getOverview(providerCode);
  }

  @UseGuards(AdminAuthGuard)
  @Get("products")
  getImportedProducts(@Query() query: ImportQueryDto) {
    return this.importsService.getImportedProducts(query);
  }

  @UseGuards(AdminAuthGuard)
  @Post("discover")
  discoverCatalog(@Body() body: RunImportDto) {
    return this.importsService.discoverCatalog(body);
  }

  @UseGuards(AdminAuthGuard)
  @Post("run")
  runImportBatch(@Body() body: RunImportDto) {
    return this.importsService.runImportBatch(body);
  }

  @UseGuards(AdminAuthGuard)
  @Post("dry-run")
  runDryRun(@Body() body: RunImportDto) {
    return this.importsService.runImportBatch({ ...body, dryRun: true });
  }

  @UseGuards(AdminAuthGuard)
  @Patch("products/:id/publish")
  publishProduct(
    @Param("id") id: string,
    @Body("publishState") publishState: ProductPublishState
  ) {
    return this.importsService.publishProduct(id, publishState);
  }

  @UseGuards(AdminAuthGuard)
  @Delete("products/:id")
  deleteImportedProduct(@Param("id") id: string) {
    return this.importsService.deleteImportedProduct(id);
  }

  @UseGuards(AdminAuthGuard)
  @Post("products/bulk-delete")
  bulkDeleteImportedProducts(@Body("ids") ids: string[]) {
    return this.importsService.bulkDeleteImportedProducts(ids);
  }

  @UseGuards(AdminAuthGuard)
  @Post("category-mappings")
  setCategoryMapping(@Body() body: CategoryMappingDto) {
    return this.importsService.setCategoryMapping(body);
  }

  @UseGuards(AdminAuthGuard)
  @Post("brand-mappings")
  setBrandMapping(@Body() body: BrandMappingDto) {
    return this.importsService.setBrandMapping(body);
  }

  @UseGuards(AdminAuthGuard)
  @Get("errors")
  getErrors() {
    return this.importsService.getErrors();
  }

  @UseGuards(AdminAuthGuard)
  @Get("seo-stats")
  getSeoStats() {
    return this.importsService.getSeoStats();
  }
}
