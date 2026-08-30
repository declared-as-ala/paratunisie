import { Controller, Post, Get, Param, Body, UseGuards } from "@nestjs/common";
import { AdminAuthGuard } from "../admin-auth/guards/admin-auth.guard";
import { AramexService, AramexCustomData } from "./aramex.service";

@Controller("orders")
@UseGuards(AdminAuthGuard)
export class AramexController {
  constructor(private readonly aramexService: AramexService) {}

  @Post(":id/aramex/create-shipment")
  async createShipment(
    @Param("id") orderId: string,
    @Body() customData: AramexCustomData,
  ) {
    return this.aramexService.createShipment(orderId, customData);
  }

  @Get(":id/aramex/track")
  async trackShipment(@Param("id") orderId: string) {
    return this.aramexService.trackShipment(orderId);
  }

  @Get("aramex/label/:hawb")
  async getLabel(@Param("hawb") hawb: string) {
    return this.aramexService.printLabel(hawb);
  }
}
