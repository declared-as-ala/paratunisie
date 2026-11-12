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
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { AbandonedCheckoutsService } from "./abandoned-checkouts.service";
import { AddCheckoutNoteDto, BulkDeleteCheckoutsDto, ConvertCheckoutDto, SetCheckoutStatusDto, UpsertCheckoutDraftDto } from "./dto/upsert-draft.dto";
import { AdminAuthGuard } from "../admin-auth/guards/admin-auth.guard";
import { CurrentStaff } from "../admin-auth/decorators/current-staff.decorator";

function clientKey(req: Request): string {
  const fwd = ((req.headers["x-forwarded-for"] as string) || "").split(",")[0].trim();
  return fwd || (req.headers["x-real-ip"] as string) || req.socket.remoteAddress || "anon";
}

@Controller("abandoned-checkouts")
export class AbandonedCheckoutsController {
  constructor(private readonly service: AbandonedCheckoutsService) {}

  /** Public: progressive, idempotent draft save while the shopper fills the form. */
  @Post("draft")
  @HttpCode(HttpStatus.OK)
  async upsertDraft(@Body() dto: UpsertCheckoutDraftDto, @Req() req: Request) {
    return this.service.upsertDraft(dto, clientKey(req));
  }

  /** Public beacon used by the legacy storefront checkout when its modal/page closes. */
  @Post("mark-abandoned")
  @HttpCode(HttpStatus.OK)
  async markAbandoned(@Body("checkoutSessionId") checkoutSessionId: string, @Req() req: Request) {
    return this.service.markAbandoned(checkoutSessionId, clientKey(req));
  }

  /** Admin: legacy array list used by the "Abandonnées" tab of the Commandes page. */
  @Get()
  @UseGuards(AdminAuthGuard)
  async getAbandonedCheckouts(
    @Query("search") search?: string,
    @Query("status") status?: string,
    @Query("source") source?: string,
  ) {
    return this.service.getAbandonedCheckouts({ search, status, source });
  }

  /** Admin: paginated, filterable list for the dedicated "Commandes abandonnées" module. */
  @Get("admin/list")
  @UseGuards(AdminAuthGuard)
  async adminList(
    @Query("search") search?: string,
    @Query("status") status?: string,
    @Query("source") source?: string,
    @Query("productId") productId?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("duplicates") duplicates?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.service.adminList({
      search,
      status,
      source,
      productId,
      from,
      to,
      duplicatesOnly: duplicates === "1" || duplicates === "true",
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get("admin/stats")
  @UseGuards(AdminAuthGuard)
  async adminStats(@Query("from") from?: string, @Query("to") to?: string, @Query("productId") productId?: string) {
    return this.service.adminStats({ from, to, productId });
  }

  /** Admin: permanently delete several drafts at once (recovered ones are kept). */
  @Post("admin/bulk-delete")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminAuthGuard)
  async bulkDelete(@Body() dto: BulkDeleteCheckoutsDto) {
    return this.service.bulkDelete(dto.ids);
  }

  @Get("admin/products")
  @UseGuards(AdminAuthGuard)
  async adminProducts() {
    return this.service.adminProducts();
  }

  @Get(":id")
  @UseGuards(AdminAuthGuard)
  async getAbandonedCheckoutById(@Param("id") id: string) {
    return this.service.getAbandonedCheckoutById(id);
  }

  /** Admin: manual status update (audited). RECOVERED is only reachable through a real order. */
  @Post(":id/status")
  @UseGuards(AdminAuthGuard)
  async setStatus(@Param("id") id: string, @Body() dto: SetCheckoutStatusDto, @CurrentStaff() staff?: { id: string }) {
    return this.service.setStatus(id, dto, staff?.id);
  }

  @Post(":id/note")
  @UseGuards(AdminAuthGuard)
  async addNote(@Param("id") id: string, @Body() dto: AddCheckoutNoteDto, @CurrentStaff() staff?: { id: string }) {
    return this.service.addNote(id, dto.note, staff?.id);
  }

  @Post(":id/whatsapp-opened")
  @UseGuards(AdminAuthGuard)
  async whatsappOpened(@Param("id") id: string, @CurrentStaff() staff?: { id: string }) {
    return this.service.logWhatsappOpened(id, staff?.id);
  }

  /** Admin: create the real order — only after the customer explicitly confirmed it. */
  @Post(":id/convert")
  @UseGuards(AdminAuthGuard)
  async convertToOrder(@Param("id") id: string, @Body() dto: ConvertCheckoutDto, @CurrentStaff() staff?: { id: string }) {
    return this.service.convertToOrder(id, dto.customerConfirmed, staff?.id, dto.note);
  }

  @Delete(":id")
  @UseGuards(AdminAuthGuard)
  async deleteAbandonedCheckout(@Param("id") id: string, @CurrentStaff() staff?: { id: string }) {
    return this.service.deleteAbandonedCheckout(id, staff?.id);
  }
}
