import { Controller, Get, Post, Patch, Delete, Param, Body } from "@nestjs/common";
import { NavigationService, CreateNavigationItemDto, UpdateNavigationItemDto } from "./navigation.service";

@Controller("navigation")
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Get("main")
  async getPublicMainNavigation() {
    return this.navigationService.getPublicMainNavigation();
  }

  @Get("admin")
  async getAdminNavigationItems() {
    return this.navigationService.getAdminNavigationItems();
  }

  @Post("admin")
  async createNavigationItem(@Body() dto: CreateNavigationItemDto) {
    return this.navigationService.createNavigationItem(dto);
  }

  @Patch("admin/reorder")
  async reorderNavigationItems(@Body("itemIds") itemIds: string[]) {
    return this.navigationService.reorderNavigationItems(itemIds || []);
  }

  @Patch("admin/:id")
  async updateNavigationItem(
    @Param("id") id: string,
    @Body() dto: UpdateNavigationItemDto
  ) {
    return this.navigationService.updateNavigationItem(id, dto);
  }

  @Delete("admin/:id")
  async deleteNavigationItem(@Param("id") id: string) {
    return this.navigationService.deleteNavigationItem(id);
  }
}
