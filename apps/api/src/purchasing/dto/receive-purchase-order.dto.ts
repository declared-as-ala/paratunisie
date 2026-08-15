import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsInt, IsOptional, IsPositive, IsString, ValidateNested } from "class-validator";

class ReceiveLineInputDto {
  @IsString()
  lineId!: string;

  @IsInt()
  @IsPositive()
  quantityReceived!: number;

  @IsOptional()
  @IsString()
  batchNumber?: string;

  @IsOptional()
  @IsString()
  expirationDate?: string;
}

export class ReceivePurchaseOrderDto {
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReceiveLineInputDto)
  lines!: ReceiveLineInputDto[];
}
