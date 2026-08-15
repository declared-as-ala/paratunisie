import { Controller, Get, Post, Patch, Delete, Param, Body } from "@nestjs/common";
import { HomepageService, UpdateSectionConfigDto, CreateCampaignDto, UpdateCampaignDto } from "./homepage.service";

@Controller("homepage")
export class HomepageController {
  constructor(private readonly homepageService: HomepageService) {}

  @Get("config")
  async getStorefrontConfig() {
    return this.homepageService.getStorefrontConfig();
  }

  @Get("admin-config")
  async getAdminConfig() {
    return this.homepageService.getAdminConfig();
  }

  @Patch("sections")
  async updateSectionConfig(@Body() dto: UpdateSectionConfigDto) {
    return this.homepageService.updateSectionConfig(dto);
  }

  @Post("campaigns")
  async createCampaign(@Body() dto: CreateCampaignDto) {
    return this.homepageService.createCampaign(dto);
  }

  @Patch("campaigns/:id")
  async updateCampaign(@Param("id") id: string, @Body() dto: UpdateCampaignDto) {
    return this.homepageService.updateCampaign(id, dto);
  }

  @Delete("campaigns/:id")
  async deleteCampaign(@Param("id") id: string) {
    return this.homepageService.deleteCampaign(id);
  }
}
