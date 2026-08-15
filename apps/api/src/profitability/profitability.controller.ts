import { Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import { ProfitabilityService } from "./profitability.service";
import { ProfitabilityOrdersQueryDto, ProfitabilityOverviewQueryDto } from "./dto/profitability-query.dto";
import { AdminAuthGuard } from "../admin-auth/guards/admin-auth.guard";
import { RolesGuard } from "../admin-auth/guards/roles.guard";
import { Roles } from "../admin-auth/decorators/roles.decorator";

// Purchase cost and gain are sensitive admin data (REQUIREMENTS.md §B) — restricted
// to SUPER_ADMIN/ADMIN, not every staff role that passes AdminAuthGuard.
@UseGuards(AdminAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
@Controller("profitability")
export class ProfitabilityController {
  constructor(private profitabilityService: ProfitabilityService) {}

  @Get("overview")
  overview(@Query() query: ProfitabilityOverviewQueryDto) {
    return this.profitabilityService.getOverview(new Date(query.from), new Date(query.to), query.statuses);
  }

  @Get("orders")
  orders(@Query() query: ProfitabilityOrdersQueryDto) {
    return this.profitabilityService.getOrdersTable(
      new Date(query.from),
      new Date(query.to),
      query.statuses,
      query.page,
      query.pageSize,
      query.search,
    );
  }

  @Get("orders/:id")
  orderDetail(@Param("id") id: string) {
    return this.profitabilityService.getOrderDetail(id);
  }

  @Roles(Role.SUPER_ADMIN)
  @Post("backfill-missing-costs")
  backfill() {
    return this.profitabilityService.backfillMissingCosts();
  }
}
