import { IsEnum, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength } from "class-validator";

export enum EventTypeDto {
  PAGE_VIEW = "PAGE_VIEW",
  PRODUCT_VIEW = "PRODUCT_VIEW",
  CATEGORY_VIEW = "CATEGORY_VIEW",
  SEARCH = "SEARCH",
  ADD_TO_CART = "ADD_TO_CART",
  REMOVE_FROM_CART = "REMOVE_FROM_CART",
  BEGIN_CHECKOUT = "BEGIN_CHECKOUT",
  PURCHASE = "PURCHASE",
  CUSTOM = "CUSTOM",
}

export class CollectEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  visitorId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  sessionToken!: string;

  @IsEnum(EventTypeDto)
  @IsNotEmpty()
  eventType!: EventTypeDto;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  pageUrl!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  pagePath!: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  pageType?: string; // home, shop, product, category, brand, blog, cart, checkout, search, other

  @IsString()
  @IsOptional()
  @MaxLength(255)
  pageTitle?: string;

  @IsInt()
  @IsOptional()
  timeOnPageSeconds?: number;

  @IsString()
  @IsOptional()
  productId?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  brandId?: string;

  @IsString()
  @IsOptional()
  orderId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  searchKeyword?: string;

  @IsInt()
  @IsOptional()
  searchResultsCount?: number;

  @IsInt()
  @IsOptional()
  priceMillimes?: number;

  @IsInt()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  referrer?: string;

  @IsString()
  @IsOptional()
  utmSource?: string;

  @IsString()
  @IsOptional()
  utmMedium?: string;

  @IsString()
  @IsOptional()
  utmCampaign?: string;

  @IsString()
  @IsOptional()
  utmContent?: string;

  @IsString()
  @IsOptional()
  utmTerm?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
