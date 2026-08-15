import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { StockMovementType } from "@prisma/client";

export class AdjustStockDto {
  @IsString()
  @IsNotEmpty()
  variantId!: string;

  @IsOptional()
  @IsString()
  warehouseId?: string;

  @IsEnum(StockMovementType)
  type!: StockMovementType;

  // Signed delta — positive adds stock, negative removes it.
  @IsInt()
  quantity!: number;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
