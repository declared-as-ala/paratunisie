import { Module } from "@nestjs/common";
import { ProductRequestsController } from "./product-requests.controller";
import { ProductRequestsService } from "./product-requests.service";
import { PrismaModule } from "../prisma/prisma.module";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [ProductRequestsController],
  providers: [ProductRequestsService],
  exports: [ProductRequestsService],
})
export class ProductRequestsModule {}
