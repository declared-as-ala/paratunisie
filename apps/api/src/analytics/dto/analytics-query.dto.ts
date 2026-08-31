import { IsOptional, IsString } from "class-validator";

export class AnalyticsQueryDto {
  @IsOptional()
  @IsString()
  period?: string; // "today" | "yesterday" | "7d" | "30d" | "this_month" | "last_month" | "3mo" | "this_year" | "custom"

  @IsOptional()
  @IsString()
  from?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  to?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  country?: string; // country code e.g. "TN", "FR", "DZ"

  @IsOptional()
  @IsString()
  channel?: string; // "direct", "organic_search", "paid_search", "social_facebook", etc.

  @IsOptional()
  @IsString()
  device?: string; // "mobile", "desktop", "tablet"

  @IsOptional()
  @IsString()
  pageType?: string;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsString()
  metric?: string; // For timeseries e.g. "visitors", "unique_visitors", "page_views", "sessions", "orders", "revenue"

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  page?: string;
}
