import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, UseInterceptors, UploadedFile } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CatalogueService } from "./catalogue.service";
import { SeoChecklistService } from "./seo-checklist.service";
import { CatalogueQualityService } from "./catalogue-quality.service";
import { CatalogueSeoService, SeoEntityType } from "./catalogue-seo.service";
import { BrandSeoService, type BrandSeoRunOptions } from "./brand-seo.service";
import { SeoScoreService } from "./seo-score.service";
import { SeoJobService, type CreateJobInput } from "./seo-job.service";
import { AdminAuthGuard } from "../admin-auth/guards/admin-auth.guard";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsString } from "class-validator";

class BulkDeleteProductsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsString({ each: true })
  ids!: string[];
}

@Controller("catalogue")
export class CatalogueController {
  constructor(
    private readonly catalogueService: CatalogueService,
    private readonly catalogueSeoService: CatalogueSeoService,
    private readonly brandSeoService: BrandSeoService,
    private readonly seoScoreService: SeoScoreService,
    private readonly seoJobService: SeoJobService,
    private readonly seoChecklistService: SeoChecklistService,
    private readonly qualityService: CatalogueQualityService,
  ) {}

  @Post("upload-image")
  @UseGuards(AdminAuthGuard)
  @UseInterceptors(FileInterceptor("file"))
  async uploadImage(@UploadedFile() file: any) {
    return this.catalogueService.uploadImage(file);
  }

  @Get("products")
  async getProducts(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("search") search?: string,
    @Query("q") q?: string,
    @Query("brand") brand?: string,
    @Query("category") category?: string,
    @Query("concern") concern?: string,
    @Query("sort") sort?: string,
  ) {
    return this.catalogueService.findAllProducts({
      page,
      limit,
      search: search || q,
      brand,
      category,
      concern,
      sort,
    });
  }

  @Get("seo/checklist/:type")
  @UseGuards(AdminAuthGuard)
  getChecklist(@Param("type") type: string) {
    return this.seoChecklistService.report(type);
  }

  @Post("seo/checklist/:type/:id")
  @UseGuards(AdminAuthGuard)
  optimizeChecklist(@Param("type") type: string, @Param("id") id: string, @Body() body: { repair?: boolean }) {
    return this.seoChecklistService.optimize(type, id, body.repair !== false);
  }

  /** Read-only data-quality report (duplicates, units, brands, images...). Never mutates data. */
  @Get("admin/quality-report/summary")
  @UseGuards(AdminAuthGuard)
  qualityReportSummary() {
    return this.qualityService.summary();
  }

  @Get("admin/quality-report")
  @UseGuards(AdminAuthGuard)
  qualityReport(
    @Query("check") check: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
    @Query("q") q?: string,
  ) {
    return this.qualityService.list(check, Number(page), Number(pageSize), q);
  }

  @Get("admin/products")
  @UseGuards(AdminAuthGuard)
  async getAdminProducts(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("search") search?: string,
    @Query("q") q?: string,
    @Query("brand") brand?: string,
    @Query("category") category?: string,
    @Query("concern") concern?: string,
    @Query("status") status?: string,
    @Query("sort") sort?: string,
    @Query("stock") stock?: string,
    @Query("indexable") indexable?: string,
    @Query("seoMin") seoMin?: string,
    @Query("seoMax") seoMax?: string,
  ) {
    // Admin filters on score / availability / indexability run in SQL on persisted columns.
    if (stock || indexable || seoMin !== undefined || seoMax !== undefined || sort === "seo_asc" || sort === "seo_desc") {
      return this.seoScoreService.adminList({ page, limit, q: search || q, brand, category, status, stock, indexable, seoMin, seoMax, sort });
    }
    return this.catalogueService.findAllProducts({ page, limit, search: search || q, brand, category, concern, status, sort });
  }

  @Get("admin/stock-stats")
  @UseGuards(AdminAuthGuard)
  async getStockStats() {
    return this.seoScoreService.stockStats();
  }

  // SEO scores for the rows currently on screen (max 100 ids): never the whole catalogue.
  @Get("seo/scores/product")
  @UseGuards(AdminAuthGuard)
  async getProductScores(@Query("ids") ids?: string) {
    return { items: await this.seoScoreService.scoreProducts((ids ?? "").split(",").map((s) => s.trim()).filter(Boolean)) };
  }

  @Get("seo/scores/summary")
  @UseGuards(AdminAuthGuard)
  async getScoreSummary() {
    return this.seoScoreService.summary();
  }

  @Get("seo/jobs")
  @UseGuards(AdminAuthGuard)
  async listSeoJobs() {
    return this.seoJobService.list();
  }

  @Post("seo/jobs")
  @UseGuards(AdminAuthGuard)
  async createSeoJob(@Body() body: CreateJobInput) {
    return this.seoJobService.create(body);
  }

  @Get("seo/jobs/:id")
  @UseGuards(AdminAuthGuard)
  async getSeoJob(@Param("id") id: string) {
    return this.seoJobService.get(id);
  }

  @Post("seo/jobs/:id/cancel")
  @UseGuards(AdminAuthGuard)
  async cancelSeoJob(@Param("id") id: string) {
    return this.seoJobService.cancel(id);
  }

  @Post("seo/jobs/:id/retry")
  @UseGuards(AdminAuthGuard)
  async retrySeoJob(@Param("id") id: string) {
    return this.seoJobService.retryFailures(id);
  }

  @Post("seo/jobs/:id/rollback")
  @UseGuards(AdminAuthGuard)
  async rollbackSeoJob(@Param("id") id: string) {
    return this.seoJobService.rollback(id);
  }

  @Get("seo/jobs/:id/export")
  @UseGuards(AdminAuthGuard)
  async exportSeoJob(@Param("id") id: string) {
    return { csv: await this.seoJobService.exportCsv(id) };
  }

  @Get("products/:slug")
  async getProduct(@Param("slug") slug: string) {
    return this.catalogueService.findProductBySlug(slug);
  }

  @Post("products")
  @UseGuards(AdminAuthGuard)
  async createProduct(@Body() body: any) {
    return this.catalogueService.createProduct(body);
  }

  @Patch("products/:id")
  @UseGuards(AdminAuthGuard)
  async updateProduct(@Param("id") id: string, @Body() body: any) {
    return this.catalogueService.updateProduct(id, body);
  }

  @Delete("products/:id")
  @UseGuards(AdminAuthGuard)
  async deleteProduct(@Param("id") id: string) {
    return this.catalogueService.deleteProduct(id);
  }

  @Post("products/bulk-delete")
  @UseGuards(AdminAuthGuard)
  async bulkDeleteProducts(@Body() dto: BulkDeleteProductsDto) {
    return this.catalogueService.bulkDeleteProducts(dto.ids);
  }

  @Get("brands")
  async getBrands() {
    return this.catalogueService.findAllBrands();
  }

  @Get("brands/:slug")
  async getBrand(@Param("slug") slug: string) {
    return this.catalogueService.findBrandBySlug(slug);
  }

  @Post("brands")
  @UseGuards(AdminAuthGuard)
  async createBrand(@Body() body: any) {
    return this.catalogueService.createBrand(body);
  }

  @Patch("brands/:id")
  @UseGuards(AdminAuthGuard)
  async updateBrand(@Param("id") id: string, @Body() body: any) {
    return this.catalogueService.updateBrand(id, body);
  }

  @Delete("brands/:id")
  @UseGuards(AdminAuthGuard)
  async deleteBrand(@Param("id") id: string) {
    return this.catalogueService.deleteBrand(id);
  }

  @Post("brands/bulk-delete")
  @UseGuards(AdminAuthGuard)
  async bulkDeleteBrands(@Body("ids") ids: string[]) {
    return this.catalogueService.bulkDeleteBrands(ids);
  }

  @Get("categories")
  async getCategories() {
    return this.catalogueService.findAllCategories();
  }

  @Get("categories/:slug")
  async getCategory(@Param("slug") slug: string) {
    return this.catalogueService.findCategoryBySlug(slug);
  }

  @Post("categories")
  @UseGuards(AdminAuthGuard)
  async createCategory(@Body() body: any) {
    return this.catalogueService.createCategory(body);
  }

  @Patch("categories/:id")
  @UseGuards(AdminAuthGuard)
  async updateCategory(@Param("id") id: string, @Body() body: any) {
    return this.catalogueService.updateCategory(id, body);
  }

  @Delete("categories/:id")
  @UseGuards(AdminAuthGuard)
  async deleteCategory(@Param("id") id: string) {
    return this.catalogueService.deleteCategory(id);
  }

  @Post("categories/bulk-delete")
  @UseGuards(AdminAuthGuard)
  async bulkDeleteCategories(@Body("ids") ids: string[]) {
    return this.catalogueService.bulkDeleteCategories(ids);
  }

  @Get("concerns")
  async getConcerns() {
    return this.catalogueService.findAllConcerns();
  }

  // Lean, unpaginated projection for the storefront's sitemap.xml generator —
  // deliberately not the same endpoint as GET /products (which is paginated
  // and returns full product payloads); pulling ~9,700 rows through that
  // would mean ~100 round-trips just to list slugs.
  @Get("sitemap-data")
  async getSitemapData() {
    return this.catalogueService.getSitemapData();
  }

  @Get("seo/redirect")
  async resolveRedirect(@Query("path") path: string) {
    return this.catalogueService.resolveRedirect(path);
  }

  @Post("seo/generate/:type/:id")
  @UseGuards(AdminAuthGuard)
  async generateSeo(@Param("type") type: SeoEntityType, @Param("id") id: string, @Body("save") save?: boolean) {
    return this.catalogueSeoService.generateOne(type, id, save !== false);
  }

  @Post("seo/generate-bulk")
  @UseGuards(AdminAuthGuard)
  async generateSeoBulk(@Body() body: { type: SeoEntityType; mode?: "missing" | "all"; cursor?: string; limit?: number }) {
    return this.catalogueSeoService.generateBulk(body.type, body.mode, body.cursor, body.limit);
  }

  // Brand SEO workflow: read-only audit (score, tier, reasons), then dry-run / apply with a table snapshot.
  @Get("seo/brands/audit")
  @UseGuards(AdminAuthGuard)
  async auditBrandSeo() {
    return this.brandSeoService.audit();
  }

  @Post("seo/brands/run")
  @UseGuards(AdminAuthGuard)
  async runBrandSeo(@Body() body: BrandSeoRunOptions) {
    return this.brandSeoService.run(body ?? {});
  }

  @Get("seo/report")
  @UseGuards(AdminAuthGuard)
  async getSeoReport() {
    return this.catalogueSeoService.report();
  }
}
