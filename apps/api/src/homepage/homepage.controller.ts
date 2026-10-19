import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from "@nestjs/common";
import { AdminAuthGuard } from "../admin-auth/guards/admin-auth.guard";
import { HomepageService, UpdateSectionConfigDto, CreateCampaignDto, UpdateCampaignDto } from "./homepage.service";

@Controller("homepage")
export class HomepageController {
  constructor(private readonly homepageService: HomepageService) {}

  @Get("config")
  async getStorefrontConfig() {
    return this.homepageService.getStorefrontConfig();
  }

  // Public: the resolved featured product shown at the top of the storefront.
  @Get("featured")
  async getFeatured() {
    return this.homepageService.getFeaturedProduct();
  }

  // Public: top products by real units sold (empty until enough genuine sales exist).
  @Get("best-sellers")
  async getBestSellers(@Query("limit") limit?: string) {
    return this.homepageService.getBestSellers(limit ? Number(limit) : 8);
  }

  @UseGuards(AdminAuthGuard)
  @Get("admin-config")
  async getAdminConfig() {
    return this.homepageService.getAdminConfig();
  }

  @UseGuards(AdminAuthGuard)
  @Patch("sections")
  async updateSectionConfig(@Body() dto: UpdateSectionConfigDto) {
    return this.homepageService.updateSectionConfig(dto);
  }

  @UseGuards(AdminAuthGuard)
  @Post("campaigns")
  async createCampaign(@Body() dto: CreateCampaignDto) {
    return this.homepageService.createCampaign(dto);
  }

  @UseGuards(AdminAuthGuard)
  @Patch("campaigns/:id")
  async updateCampaign(@Param("id") id: string, @Body() dto: UpdateCampaignDto) {
    return this.homepageService.updateCampaign(id, dto);
  }

  @UseGuards(AdminAuthGuard)
  @Delete("campaigns/:id")
  async deleteCampaign(@Param("id") id: string) {
    return this.homepageService.deleteCampaign(id);
  }
}
