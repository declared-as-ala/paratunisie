import { Controller, Delete, Get, Post, Patch, Body, Param, UseGuards, Req } from "@nestjs/common";
import { Request } from "express";
import { Type } from "class-transformer";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsEnum, IsInt, IsOptional, IsString, ValidateNested } from "class-validator";
import { OrderStatus } from "@prisma/client";
import { OrdersService } from "./orders.service";
import { AdminAuthGuard } from "../admin-auth/guards/admin-auth.guard";
import { CurrentStaff } from "../admin-auth/decorators/current-staff.decorator";

class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @IsOptional()
  @IsString()
  note?: string;
}

class BulkDeleteOrdersDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsString({ each: true })
  ids!: string[];
}

class CreateOrderItemDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  productVariantId?: string;

  @IsInt()
  quantity!: number;

  @IsInt()
  priceMillimes!: number;
}

class CreateOrderDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsString()
  gouvernorat!: string;

  @IsString()
  fullAddress!: string;

  @IsOptional()
  @IsString()
  deliveryNote?: string;

  @IsOptional()
  @IsString()
  eventId?: string;

  @IsOptional()
  @IsString()
  fbp?: string;

  @IsOptional()
  @IsString()
  fbc?: string;

  @IsOptional()
  @IsString()
  clientIp?: string;

  @IsOptional()
  @IsString()
  clientUserAgent?: string;

  @IsOptional()
  @IsString()
  eventSourceUrl?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(AdminAuthGuard)
  @Get()
  async getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @Post()
  async createOrder(@Body() body: CreateOrderDto, @Req() req: Request) {
    const forwardedFor = (req.headers["x-forwarded-for"] as string) || "";
    const clientIp =
      body.clientIp ||
      forwardedFor.split(",")[0].trim() ||
      (req.headers["x-real-ip"] as string) ||
      req.socket.remoteAddress ||
      undefined;

    const clientUserAgent =
      body.clientUserAgent || (req.headers["user-agent"] as string) || undefined;

    const cookieHeader = (req.headers.cookie as string) || "";
    let fbp = body.fbp;
    let fbc = body.fbc;

    if (!fbp && cookieHeader) {
      const match = cookieHeader.match(/_fbp=([^;]+)/);
      if (match) fbp = match[1];
    }
    if (!fbc && cookieHeader) {
      const match = cookieHeader.match(/_fbc=([^;]+)/);
      if (match) fbc = match[1];
    }

    const eventSourceUrl =
      body.eventSourceUrl || (req.headers.referer as string) || "https://paratunisie.com/checkout";

    return this.ordersService.createOrder({
      ...body,
      clientIp,
      clientUserAgent,
      fbp,
      fbc,
      eventSourceUrl,
    });
  }

  @Get("user/:userId")
  async getUserOrders(@Param("userId") userId: string) {
    return this.ordersService.getOrdersByUser(userId);
  }

  @UseGuards(AdminAuthGuard)
  @Get("counts")
  async getCounts() {
    return this.ordersService.getOrderCounts();
  }

  @UseGuards(AdminAuthGuard)
  @Post("bulk-delete")
  async bulkDelete(@Body() dto: BulkDeleteOrdersDto) {
    return this.ordersService.bulkDeleteOrders(dto.ids);
  }

  @UseGuards(AdminAuthGuard)
  @Delete(":id")
  async deleteOrder(@Param("id") id: string) {
    return this.ordersService.deleteOrder(id);
  }

  @Get(":id")
  async getOrder(@Param("id") id: string) {
    return this.ordersService.getOrderById(id);
  }

  @UseGuards(AdminAuthGuard)
  @Patch(":id/status")
  async updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentStaff() staff: { id: string },
  ) {
    return this.ordersService.updateOrderStatus(id, dto.status, staff.id, dto.note);
  }
}
