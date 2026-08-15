import { Transform } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class AdminCustomersQueryDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() governorate?: string;
  @IsOptional() @IsIn(["recent", "oldest", "orders", "spent", "name"]) sort?: string;
  @IsOptional() @Transform(({ value }) => Number(value)) @IsInt() @Min(1) page?: number;
  @IsOptional() @Transform(({ value }) => Number(value)) @IsInt() @Min(1) @Max(100) pageSize?: number;
}
