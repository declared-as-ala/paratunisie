import { Transform } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { ImportStatus, SeoStatus } from "@prisma/client";

export class ImportQueryDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() providerCode?: string;
  @IsOptional() @IsEnum(ImportStatus) status?: ImportStatus;
  @IsOptional() @IsEnum(SeoStatus) seoStatus?: SeoStatus;
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @Transform(({ value }) => Number(value)) @IsInt() @Min(1) page?: number;
  @IsOptional() @Transform(({ value }) => Number(value)) @IsInt() @Min(1) @Max(100) pageSize?: number;
}
