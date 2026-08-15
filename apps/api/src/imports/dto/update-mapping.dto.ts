import { IsOptional, IsString } from "class-validator";

export class CategoryMappingDto {
  @IsString() providerCode!: string;
  @IsString() sourceCategory!: string;
  @IsOptional() @IsString() targetCategoryId?: string | null;
}

export class BrandMappingDto {
  @IsString() providerCode!: string;
  @IsString() sourceBrand!: string;
  @IsOptional() @IsString() targetBrandId?: string | null;
}
