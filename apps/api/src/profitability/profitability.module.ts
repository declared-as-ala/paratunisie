import { Module } from "@nestjs/common";
import { ProfitabilityController } from "./profitability.controller";
import { ProfitabilityService } from "./profitability.service";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";
import { InventoryModule } from "../inventory/inventory.module";

@Module({
  imports: [AdminAuthModule, InventoryModule],
  controllers: [ProfitabilityController],
  providers: [ProfitabilityService],
  exports: [ProfitabilityService],
})
export class ProfitabilityModule {}
