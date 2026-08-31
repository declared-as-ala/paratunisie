import { Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { InventoryModule } from "../inventory/inventory.module";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { MetaCapiModule } from "../meta-capi/meta-capi.module";
import { LoyaltyModule } from "../loyalty/loyalty.module";
import { AbandonedCheckoutsModule } from "../abandoned-checkouts/abandoned-checkouts.module";

@Module({
  imports: [InventoryModule, AdminAuthModule, NotificationsModule, MetaCapiModule, LoyaltyModule, AbandonedCheckoutsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
