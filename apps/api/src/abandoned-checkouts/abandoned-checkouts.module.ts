import { Module } from "@nestjs/common";
import { AbandonedCheckoutsService } from "./abandoned-checkouts.service";
import { AbandonedCheckoutsController } from "./abandoned-checkouts.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [PrismaModule, AdminAuthModule, NotificationsModule],
  controllers: [AbandonedCheckoutsController],
  providers: [AbandonedCheckoutsService],
  exports: [AbandonedCheckoutsService],
})
export class AbandonedCheckoutsModule {}
