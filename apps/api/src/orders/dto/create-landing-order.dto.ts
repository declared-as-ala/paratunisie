import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

/** Public order from the advertising landing page. There is deliberately NO price field: the server prices the order. */
export class CreateLandingOrderDto {
  @IsString() @IsNotEmpty() @MaxLength(100) checkoutSessionId!: string;
  @IsString() @IsNotEmpty() @MaxLength(80) landingId!: string;

  @IsString() @MaxLength(64) productId!: string;
  @IsOptional() @IsString() @MaxLength(64) productVariantId?: string;
  @IsInt() @Min(1) @Max(99) quantity!: number;

  @IsString() @IsNotEmpty() @MaxLength(120) customerName!: string;
  @IsString() @IsNotEmpty() @MaxLength(40) phone!: string;
  @IsString() @IsNotEmpty() @MaxLength(60) gouvernorat!: string;
  @IsString() @IsNotEmpty() @MaxLength(500) fullAddress!: string;
  @IsOptional() @IsString() @MaxLength(500) deliveryNote?: string;

  @IsOptional() @IsString() @MaxLength(120) purchaseEventId?: string;
  @IsOptional() @IsString() @MaxLength(800) sourceUrl?: string;
  @IsOptional() @IsString() @MaxLength(120) utmSource?: string;
  @IsOptional() @IsString() @MaxLength(120) utmMedium?: string;
  @IsOptional() @IsString() @MaxLength(200) utmCampaign?: string;
  @IsOptional() @IsString() @MaxLength(200) utmContent?: string;
  @IsOptional() @IsString() @MaxLength(300) fbclid?: string;
  @IsOptional() @IsString() @MaxLength(120) referrerHost?: string;
  @IsOptional() @IsString() @MaxLength(200) fbp?: string;
  @IsOptional() @IsString() @MaxLength(300) fbc?: string;

  @IsOptional() @IsBoolean() contactConsent?: boolean;
  @IsOptional() @IsBoolean() privacyNoticeShown?: boolean;
}
