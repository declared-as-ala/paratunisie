import { Transform } from "class-transformer";
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { ReviewStatus } from "@prisma/client";

export class AdminReviewsQueryDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsEnum(ReviewStatus) status?: ReviewStatus;
  @IsOptional() @Transform(({ value }) => Number(value)) @IsInt() @Min(1) @Max(5) rating?: number;
  @IsOptional() @IsIn(["all", "today", "7d", "30d"]) date?: string;
  @IsOptional() @IsIn(["newest", "oldest", "rating_desc", "rating_asc"]) sort?: string;
  @IsOptional() @Transform(({ value }) => Number(value)) @IsInt() @Min(1) page?: number;
  @IsOptional() @Transform(({ value }) => Number(value)) @IsInt() @Min(1) @Max(100) pageSize?: number;
}
