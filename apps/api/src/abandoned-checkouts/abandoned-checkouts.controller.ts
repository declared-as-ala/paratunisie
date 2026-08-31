import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AbandonedCheckoutsService } from "./abandoned-checkouts.service";
import { UpsertCheckoutDraftDto } from "./dto/upsert-draft.dto";
import { AdminAuthGuard } from "../admin-auth/guards/admin-auth.guard";
import { CurrentStaff } from "../admin-auth/decorators/current-staff.decorator";

@Controller("abandoned-checkouts")
export class AbandonedCheckoutsController {
  constructor(private readonly service: AbandonedCheckoutsService) {}

  /**
   * Public endpoint to progressively upsert checkout drafts as the user types.
   */
  @Post("draft")
  @HttpCode(HttpStatus.OK)
  async upsertDraft(@Body() dto: UpsertCheckoutDraftDto) {
    return this.service.upsertDraft(dto);
  }

  /**
   * Public beacon endpoint to mark a draft as ABANDONED on modal close or page unload.
   */
  @Post("mark-abandoned")
  @HttpCode(HttpStatus.OK)
  async markAbandoned(@Body("checkoutSessionId") checkoutSessionId: string) {
    return this.service.markAbandoned(checkoutSessionId);
  }

  /**
   * Admin endpoint: List abandoned checkouts with filters.
   */
  @Get()
  @UseGuards(AdminAuthGuard)
  async getAbandonedCheckouts(
    @Query("search") search?: string,
    @Query("status") status?: string,
    @Query("source") source?: string,
  ) {
    return this.service.getAbandonedCheckouts({ search, status, source });
  }

  /**
   * Admin endpoint: Get details of a single abandoned checkout.
   */
  @Get(":id")
  @UseGuards(AdminAuthGuard)
  async getAbandonedCheckoutById(@Param("id") id: string) {
    return this.service.getAbandonedCheckoutById(id);
  }

  /**
   * Admin endpoint: Manually convert an abandoned checkout into a confirmed order.
   */
  @Post(":id/convert")
  @UseGuards(AdminAuthGuard)
  async convertToOrder(
    @Param("id") id: string,
    @CurrentStaff() staff?: { id: string },
  ) {
    return this.service.convertToOrder(id, staff?.id);
  }

  /**
   * Admin endpoint: Archive / delete an abandoned checkout.
   */
  @Delete(":id")
  @UseGuards(AdminAuthGuard)
  async deleteAbandonedCheckout(@Param("id") id: string) {
    return this.service.deleteAbandonedCheckout(id);
  }
}
