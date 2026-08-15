import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class RunImportDto {
  @IsOptional() @IsString() providerCode?: string; // default "tunisiepara"
  @IsOptional() @IsString() categoryUrl?: string;
  @IsOptional() @IsString() brandName?: string;
  @IsOptional() @IsInt() @Min(1) @Max(5000) limit?: number;
  @IsOptional() @IsBoolean() dryRun?: boolean;
  @IsOptional() @IsBoolean() autoPublish?: boolean;
  @IsOptional() @IsBoolean() downloadImages?: boolean;
  @IsOptional() @IsBoolean() generateSeo?: boolean;
}
