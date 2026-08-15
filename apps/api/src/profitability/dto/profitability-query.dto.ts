import { Transform } from "class-transformer";
import { IsArray, IsDateString, IsIn, IsInt, IsOptional, IsString, Min } from "class-validator";
import { OrderStatus } from "@prisma/client";

const INCLUDABLE_STATUSES: OrderStatus[] = [OrderStatus.CONFIRMEE, OrderStatus.LIVREE];
// The orders-table endpoint intentionally accepts every real status, not just
// the KPI-eligible ones — REQUIREMENTS.md §6 ("Toutes les commandes" must be
// selectable there), unlike the overview/KPI endpoint which stays restricted.
const ALL_STATUSES: OrderStatus[] = Object.values(OrderStatus);

export class ProfitabilityOverviewQueryDto {
  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.split(",") : value))
  @IsArray()
  @IsIn(INCLUDABLE_STATUSES, { each: true })
  statuses?: OrderStatus[];
}

export class ProfitabilityOrdersQueryDto {
  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.split(",") : value))
  @IsArray()
  @IsIn(ALL_STATUSES, { each: true })
  statuses?: OrderStatus[];

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  pageSize?: number;
}

export { INCLUDABLE_STATUSES, ALL_STATUSES };
