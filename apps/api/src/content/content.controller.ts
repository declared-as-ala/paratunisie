import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from "@nestjs/common";
import { ContentService, CreateArticleDto, UpdateArticleDto } from "./content.service";
import { AdminAuthGuard } from "../admin-auth/guards/admin-auth.guard";

@Controller("content")
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // ── Public endpoints ────────────────────────────────────────────────

  @Get("articles")
  async getArticles(
    @Query("category") category?: string,
  ) {
    return this.contentService.getAllArticles({ status: "PUBLISHED", category, indexable: true });
  }

  @Get("admin/articles")
  @UseGuards(AdminAuthGuard)
  async getAdminArticles() {
    return this.contentService.getAllArticles();
  }

  @Get("articles/dashboard-stats")
  @UseGuards(AdminAuthGuard)
  async getDashboardStats() {
    return this.contentService.getDashboardStats();
  }

  @Get("articles/by-slug/:slug")
  async getArticleBySlug(@Param("slug") slug: string) {
    return this.contentService.getArticleBySlug(slug);
  }

  @Get("articles/:id")
  @UseGuards(AdminAuthGuard)
  async getArticleById(@Param("id") id: string) {
    return this.contentService.getArticleById(id);
  }

  // ── Admin write endpoints ───────────────────────────────────────────

  @Post("articles")
  @UseGuards(AdminAuthGuard)
  async createArticle(@Body() dto: CreateArticleDto) {
    return this.contentService.createArticle(dto);
  }

  @Patch("articles/:id")
  @UseGuards(AdminAuthGuard)
  async updateArticle(@Param("id") id: string, @Body() dto: UpdateArticleDto) {
    return this.contentService.updateArticle(id, dto);
  }

  @Patch("articles/:id/archive")
  @UseGuards(AdminAuthGuard)
  async archiveArticle(@Param("id") id: string) {
    return this.contentService.archiveArticle(id);
  }

  @Post("articles/:id/duplicate")
  @UseGuards(AdminAuthGuard)
  async duplicateArticle(@Param("id") id: string) {
    return this.contentService.duplicateArticle(id);
  }

  @Delete("articles/:id")
  @UseGuards(AdminAuthGuard)
  async deleteArticle(@Param("id") id: string) {
    return this.contentService.deleteArticle(id);
  }
}
