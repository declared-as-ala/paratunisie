import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { PurchasingService } from "./purchasing.service";
import { CreatePurchaseOrderDto } from "./dto/create-purchase-order.dto";
import { ReceivePurchaseOrderDto } from "./dto/receive-purchase-order.dto";
import { AdminAuthGuard } from "../admin-auth/guards/admin-auth.guard";
import { CurrentStaff } from "../admin-auth/decorators/current-staff.decorator";

@UseGuards(AdminAuthGuard)
@Controller("purchasing/purchase-orders")
export class PurchasingController {
  constructor(private purchasingService: PurchasingService) {}

  @Get()
  list() {
    return this.purchasingService.list();
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.purchasingService.get(id);
  }

  @Post()
  create(@Body() dto: CreatePurchaseOrderDto) {
    return this.purchasingService.create(dto);
  }

  @Post(":id/send")
  send(@Param("id") id: string) {
    return this.purchasingService.markSent(id);
  }

  @Post(":id/cancel")
  cancel(@Param("id") id: string) {
    return this.purchasingService.cancel(id);
  }

  @Post(":id/receive")
  receive(
    @Param("id") id: string,
    @Body() dto: ReceivePurchaseOrderDto,
    @CurrentStaff() staff: { id: string },
  ) {
    return this.purchasingService.receive(id, dto, staff.id);
  }
}
