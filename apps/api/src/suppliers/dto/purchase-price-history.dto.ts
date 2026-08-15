import { IsInt, IsOptional, IsPositive, IsString } from "class-validator";

// Append-only — this DTO only ever backs a POST. There is no update/delete DTO
// for purchase price history (DATA_MODEL.md / D-0017): acquisition cost is a
// time series, never an overwritten field.
export class CreatePurchasePriceHistoryDto {
  @IsString()
  variantId!: string;

  @IsInt()
  @IsPositive()
  purchasePriceMillimes!: number;

  @IsOptional()
  @IsString()
  effectiveFrom?: string;
}
