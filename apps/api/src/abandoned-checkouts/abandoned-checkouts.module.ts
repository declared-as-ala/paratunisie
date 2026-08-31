import { Module } from "@nestjs/common";
import { AbandonedCheckoutsService } from "./abandoned-checkouts.service";
import { AbandonedCheckoutsController } from "./abandoned-checkouts.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [AbandonedCheckoutsController],
  providers: [AbandonedCheckoutsService],
  exports: [AbandonedCheckoutsService],
})
export class AbandonedCheckoutsModule {}
