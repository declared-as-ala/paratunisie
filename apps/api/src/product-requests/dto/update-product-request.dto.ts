import { IsEnum, IsOptional, IsString } from "class-validator";
import { ProductRequestStatus } from "@prisma/client";

export class UpdateProductRequestDto {
  @IsOptional()
  @IsEnum(ProductRequestStatus)
  status?: ProductRequestStatus;

  @IsOptional()
  @IsString()
  adminNotes?: string;
}
