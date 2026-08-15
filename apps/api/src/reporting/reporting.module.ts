import { Module } from "@nestjs/common";
import { ReportingController } from "./reporting.controller";
import { ReportingService } from "./reporting.service";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";
import { InventoryModule } from "../inventory/inventory.module";

@Module({
  imports: [AdminAuthModule, InventoryModule],
  controllers: [ReportingController],
  providers: [ReportingService],
})
export class ReportingModule {}
