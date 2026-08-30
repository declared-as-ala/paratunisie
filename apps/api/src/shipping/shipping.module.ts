import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";
import { AramexService } from "./aramex.service";
import { AramexController } from "./aramex.controller";

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [AramexController],
  providers: [AramexService],
  exports: [AramexService],
})
export class ShippingModule {}
