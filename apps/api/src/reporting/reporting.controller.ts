import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ReportingService } from "./reporting.service";
import { DashboardQueryDto } from "./dto/dashboard-query.dto";
import { AdminAuthGuard } from "../admin-auth/guards/admin-auth.guard";

@UseGuards(AdminAuthGuard)
@Controller("reporting")
export class ReportingController {
  constructor(private reportingService: ReportingService) {}

  @Get("dashboard/overview")
  overview(@Query() query: DashboardQueryDto) {
    return this.reportingService.getDashboardOverview(query.period);
  }
}
