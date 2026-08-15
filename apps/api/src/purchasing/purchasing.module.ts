import { Module } from "@nestjs/common";
import { PurchasingController } from "./purchasing.controller";
import { PurchasingService } from "./purchasing.service";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";
import { InventoryModule } from "../inventory/inventory.module";

@Module({
  imports: [AdminAuthModule, InventoryModule],
  controllers: [PurchasingController],
  providers: [PurchasingService],
  exports: [PurchasingService],
})
export class PurchasingModule {}
