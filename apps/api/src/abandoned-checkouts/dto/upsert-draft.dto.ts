import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { CheckoutSource, AbandonedCheckoutStatus } from "@prisma/client";

export class CheckoutDraftItemDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  variantLabel?: string;

  @IsInt()
  quantity!: number;

  @IsInt()
  priceMillimes!: number;
}

export class UpsertCheckoutDraftDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  checkoutSessionId!: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  gouvernorat?: string;

  @IsOptional()
  @IsString()
  fullAddress?: string;

  @IsOptional()
  @IsString()
  deliveryNote?: string;

  @IsOptional()
  @IsArray()
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
  sourceUrl?: string;

  @IsOptional()
  @IsEnum(AbandonedCheckoutStatus)
  status?: AbandonedCheckoutStatus;
}
