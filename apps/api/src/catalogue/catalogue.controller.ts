import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, UseInterceptors, UploadedFile } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CatalogueService } from "./catalogue.service";
import { CatalogueSeoService, SeoEntityType } from "./catalogue-seo.service";
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
  ) {
    return this.catalogueService.findAllProducts({ page, limit, search: search || q, brand, category, concern, status, sort });
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

  @Get("seo/report")
  @UseGuards(AdminAuthGuard)
  async getSeoReport() {
    return this.catalogueSeoService.report();
  }
}
