import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from "@nestjs/common";
import { ContentService, CreateArticleDto, UpdateArticleDto } from "./content.service";

@Controller("content")
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // ── Public endpoints ────────────────────────────────────────────────

  @Get("articles")
  async getArticles(
    @Query("status") status?: string,
    @Query("category") category?: string,
    @Query("search") search?: string,
    @Query("productId") productId?: string,
    @Query("brandId") brandId?: string,
  ) {
    return this.contentService.getAllArticles({ status, category, search, productId, brandId });
  }

  @Get("articles/dashboard-stats")
  async getDashboardStats() {
    return this.contentService.getDashboardStats();
  }

  @Get("articles/by-slug/:slug")
  async getArticleBySlug(@Param("slug") slug: string) {
    return this.contentService.getArticleBySlug(slug);
  }

  @Get("articles/:id")
  async getArticleById(@Param("id") id: string) {
    return this.contentService.getArticleById(id);
  }

  // ── Admin write endpoints ───────────────────────────────────────────

  @Post("articles")
  async createArticle(@Body() dto: CreateArticleDto) {
    return this.contentService.createArticle(dto);
  }

  @Patch("articles/:id")
  async updateArticle(@Param("id") id: string, @Body() dto: UpdateArticleDto) {
    return this.contentService.updateArticle(id, dto);
  }

  @Patch("articles/:id/archive")
  async archiveArticle(@Param("id") id: string) {
    return this.contentService.archiveArticle(id);
  }

  @Post("articles/:id/duplicate")
  async duplicateArticle(@Param("id") id: string) {
    return this.contentService.duplicateArticle(id);
  }

  @Delete("articles/:id")
  async deleteArticle(@Param("id") id: string) {
    return this.contentService.deleteArticle(id);
  }
}
