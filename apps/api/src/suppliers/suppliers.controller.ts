import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { SuppliersService } from "./suppliers.service";
import { CreateSupplierDto, UpdateSupplierDto } from "./dto/supplier.dto";
import { CreatePurchasePriceHistoryDto } from "./dto/purchase-price-history.dto";
import { AdminAuthGuard } from "../admin-auth/guards/admin-auth.guard";

@UseGuards(AdminAuthGuard)
@Controller("suppliers")
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Get()
  list() {
    return this.suppliersService.list();
  }

  @Get("purchase-price-history")
  purchasePriceHistory(@Query("variantId") variantId?: string, @Query("supplierId") supplierId?: string) {
    return this.suppliersService.listPurchasePriceHistory(variantId, supplierId);
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.suppliersService.get(id);
  }

  @Post()
  create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.suppliersService.remove(id);
  }

  @Post(":id/purchase-price-history")
  addPurchasePriceHistory(@Param("id") id: string, @Body() dto: CreatePurchasePriceHistoryDto) {
    return this.suppliersService.addPurchasePriceHistory(id, dto);
  }
}
