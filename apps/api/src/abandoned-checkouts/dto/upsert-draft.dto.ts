import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { CheckoutSource } from "@prisma/client";

export class CheckoutDraftItemDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  productId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  productVariantId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  image?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  variantLabel?: string;

  @IsInt()
  @Min(1)
  @Max(99)
  quantity!: number;

  @IsInt()
  @Min(0)
  priceMillimes!: number;
}

export class UpsertCheckoutDraftDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  checkoutSessionId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  userId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  customerName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  gouvernorat?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  fullAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  deliveryNote?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => CheckoutDraftItemDto)
  items?: CheckoutDraftItemDto[];

  @IsOptional()
  @IsInt()
  subtotalMillimes?: number;

  @IsOptional()
  @IsInt()
  shippingFeeMillimes?: number;

  @IsOptional()
  @IsInt()
  totalMillimes?: number;

  @IsOptional()
  @IsEnum(CheckoutSource)
  source?: CheckoutSource;

  @IsOptional()
  @IsString()
  @MaxLength(800)
  sourceUrl?: string;

  /** Public callers may only report an active draft or an explicit abandon; every other state is server-owned. */
  @IsOptional()
  @IsIn(["DRAFT", "ABANDONED"])
  status?: "DRAFT" | "ABANDONED";

  // ── Landing-page attribution (no personal data) ──
  @IsOptional() @IsString() @MaxLength(80) landingId?: string;
  @IsOptional() @IsString() @MaxLength(64) productId?: string;
  @IsOptional() @IsString() @MaxLength(64) productVariantId?: string;
  @IsOptional() @IsInt() @Min(1) @Max(99) quantity?: number;
  @IsOptional() @IsString() @MaxLength(120) utmSource?: string;
  @IsOptional() @IsString() @MaxLength(120) utmMedium?: string;
  @IsOptional() @IsString() @MaxLength(200) utmCampaign?: string;
  @IsOptional() @IsString() @MaxLength(200) utmContent?: string;
  @IsOptional() @IsString() @MaxLength(300) fbclid?: string;
  @IsOptional() @IsString() @MaxLength(120) referrerHost?: string;

  // ── Compliance ──
  /** Explicit, unchecked-by-default opt-in to be contacted again about this request. */
  @IsOptional() @IsBoolean() contactConsent?: boolean;
  /** The saved-draft notice was visible when the data was typed. */
  @IsOptional() @IsBoolean() privacyNoticeShown?: boolean;
  /** Shared Meta Pixel / CAPI event id the eventual Purchase will use. */
  @IsOptional() @IsString() @MaxLength(120) purchaseEventId?: string;
}

export class SetCheckoutStatusDto {
  @IsIn(["DRAFT", "ABANDONED", "EXPIRED", "ARCHIVED"])
  status!: "DRAFT" | "ABANDONED" | "EXPIRED" | "ARCHIVED";

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class AddCheckoutNoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  note!: string;
}

export class ConvertCheckoutDto {
  /** The admin must affirm the customer explicitly confirmed this order (phone/WhatsApp). */
  @IsBoolean()
  customerConfirmed!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class BulkDeleteCheckoutsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  ids!: string[];
}
