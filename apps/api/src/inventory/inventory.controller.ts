import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { AdjustStockDto } from "./dto/adjust-stock.dto";
import { AdminAuthGuard } from "../admin-auth/guards/admin-auth.guard";
import { CurrentStaff } from "../admin-auth/decorators/current-staff.decorator";

@UseGuards(AdminAuthGuard)
@Controller("inventory")
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get()
  list() {
    return this.inventoryService.listInventory();
  }

  @Get("movements")
  movements(@Query("variantId") variantId?: string) {
    return this.inventoryService.listMovements(variantId);
  }

  @Get("alerts/low-stock")
  lowStockAlerts() {
    return this.inventoryService.getLowStockAlerts();
  }

  @Get("alerts/expiry")
  expiryAlerts() {
    return this.inventoryService.getExpiryAlerts();
  }

  @Get("replenishment-suggestions")
  replenishmentSuggestions() {
    return this.inventoryService.getReplenishmentSuggestions();
  }

  @Get("cost/:variantId")
  weightedAverageCost(@Param("variantId") variantId: string) {
    return this.inventoryService.getWeightedAverageCost(variantId);
  }

  @Post("adjust")
  adjust(@Body() dto: AdjustStockDto, @CurrentStaff() staff: { id: string }) {
    return this.inventoryService.adjustStock(dto, staff.id);
  }
}
