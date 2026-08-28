import { Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { InventoryModule } from "../inventory/inventory.module";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { MetaCapiModule } from "../meta-capi/meta-capi.module";
import { LoyaltyModule } from "../loyalty/loyalty.module";

@Module({
  imports: [InventoryModule, AdminAuthModule, NotificationsModule, MetaCapiModule, LoyaltyModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
