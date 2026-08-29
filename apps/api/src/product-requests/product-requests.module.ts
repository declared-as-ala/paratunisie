import { Module } from "@nestjs/common";
import { ProductRequestsController } from "./product-requests.controller";
import { ProductRequestsService } from "./product-requests.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [ProductRequestsController],
  providers: [ProductRequestsService],
  exports: [ProductRequestsService],
})
export class ProductRequestsModule {}
