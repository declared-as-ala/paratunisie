import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Response } from "express";
import { AnalyticsService } from "./analytics.service";
import { CollectEventDto } from "./dto/collect-event.dto";
import { AnalyticsQueryDto } from "./dto/analytics-query.dto";
import { AdminAuthGuard } from "../admin-auth/guards/admin-auth.guard";

@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Public lightweight beacon ingestion endpoint.
   * Throttled, non-blocking, ignores bots & admin routes.
   */
  @Post("collect")
  @HttpCode(HttpStatus.OK)
  async collectEvent(
    @Body() dto: CollectEventDto,
    @Headers() headers: Record<string, any>,
  ) {
    return this.analyticsService.collectEvent(dto, headers);
  }

  /**
   * Top KPI overview cards with period vs previous equivalent period comparisons.
   */
  @Get("overview")
  @UseGuards(AdminAuthGuard)
  async getOverview(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getOverview(query);
  }

  /**
   * Timeseries chart datapoints (visitors, unique visitors, page views, sessions, orders, revenue).
   */
  @Get("timeseries")
  @UseGuards(AdminAuthGuard)
  async getTimeseries(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getTimeseries(query);
  }

  /**
   * 5-step conversion funnel (Visitor -> Product View -> Add to Cart -> Checkout Started -> Purchase).
   */
  @Get("funnel")
  @UseGuards(AdminAuthGuard)
  async getConversionFunnel(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getConversionFunnel(query);
  }

  /**
   * Product analytics table (views, unique visitors, cart adds, purchases, conversion rate, revenue).
   */
  @Get("products")
  @UseGuards(AdminAuthGuard)
  async getTopProducts(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getTopProducts(query);
  }

  /**
   * Page analytics table (URL, type, views, duration, bounce rate).
   */
  @Get("pages")
  @UseGuards(AdminAuthGuard)
  async getTopPages(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getTopPages(query);
  }

  /**
   * Geographic country distribution.
   */
  @Get("countries")
  @UseGuards(AdminAuthGuard)
  async getCountryStats(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getCountryStats(query);
  }

  /**
   * Traffic sources and UTM campaign attribution.
   */
  @Get("sources")
  @UseGuards(AdminAuthGuard)
  async getSourceStats(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getSourceStats(query);
  }

  /**
   * Device & browser distribution.
   */
  @Get("devices")
  @UseGuards(AdminAuthGuard)
  async getDeviceStats(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getDeviceStats(query);
  }

  /**
   * Search queries and zero-result searches.
   */
  @Get("searches")
  @UseGuards(AdminAuthGuard)
  async getSearchAnalytics(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getSearchAnalytics(query);
  }

  /**
   * Realtime active visitors in the last 5 minutes.
   */
  @Get("realtime")
  @UseGuards(AdminAuthGuard)
  async getRealtimeStats() {
    return this.analyticsService.getRealtimeStats();
  }

  /**
   * CSV export endpoint.
   */
  @Get("export")
  @UseGuards(AdminAuthGuard)
  async exportCsv(
    @Query("type") type: string,
    @Query() query: AnalyticsQueryDto,
    @Res() res: Response,
  ) {
    const csvData = await this.analyticsService.exportCsv(type || "products", query);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=analytics-${type || "export"}-${Date.now()}.csv`);
    return res.send("\uFEFF" + csvData); // UTF-8 BOM for Excel compatibility
  }
}
