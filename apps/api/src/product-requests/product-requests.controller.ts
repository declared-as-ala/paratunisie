import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ProductRequestsService } from "./product-requests.service";
import { CreateProductRequestDto } from "./dto/create-product-request.dto";
import { UpdateProductRequestDto } from "./dto/update-product-request.dto";
import { AdminAuthGuard } from "../admin-auth/guards/admin-auth.guard";

@Controller("product-requests")
export class ProductRequestsController {
  constructor(private readonly service: ProductRequestsService) {}

  // Public endpoint for customer demand submission
  @Post()
  async create(@Body() dto: CreateProductRequestDto) {
    return this.service.create(dto);
  }

  // Admin endpoint to view demands
  @UseGuards(AdminAuthGuard)
  @Get()
  async findAll(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("status") status?: string,
    @Query("search") search?: string,
  ) {
    return this.service.findAll({ page, limit, status, search });
  }

  // Admin endpoint to update demand status
  @UseGuards(AdminAuthGuard)
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateProductRequestDto) {
    return this.service.update(id, dto);
  }

  // Admin endpoint to delete demand
  @UseGuards(AdminAuthGuard)
  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
