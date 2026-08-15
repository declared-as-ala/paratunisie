import { Controller, Get, Post, Body, Param, Query, UseGuards } from "@nestjs/common";
import { CustomersService } from "./customers.service";
import { AdminAuthGuard } from "../admin-auth/guards/admin-auth.guard";
import { AdminCustomersQueryDto } from "./dto/admin-customers-query.dto";

@Controller("customers")
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @UseGuards(AdminAuthGuard)
  @Get("admin/list")
  async getAdminCustomers(@Query() query: AdminCustomersQueryDto) {
    return this.customersService.getAdminCustomers(query);
  }

  @Post()
  async createCustomer(@Body() body: { email: string; name?: string; password: string }) {
    return this.customersService.createCustomer(body);
  }

  @Get(":id")
  async getCustomer(@Param("id") id: string) {
    return this.customersService.getCustomerById(id);
  }

  @Get(":id/addresses")
  async getAddresses(@Param("id") id: string) {
    return this.customersService.getAddresses(id);
  }

  @Post(":id/addresses")
  async addAddress(
    @Param("id") id: string,
    @Body() body: { gouvernorat: string; fullAddress: string; label?: string; isDefault?: boolean },
  ) {
    return this.customersService.addAddress(id, body);
  }
}
