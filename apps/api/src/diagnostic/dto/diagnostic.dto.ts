import { IsIn, IsObject, IsOptional, IsString } from "class-validator";

export class CreateSessionDto {
  @IsIn(["SKIN", "HAIR"])
  domain!: "SKIN" | "HAIR";
}

export class SaveAnswersDto {
  @IsObject()
  answers!: Record<string, unknown>;
}

export class AdjustBudgetDto {
  @IsString()
  budget!: string;
}

export class AlternativeDto {
  @IsString()
  currentProductId!: string;

  @IsString()
  role!: string;

  @IsOptional()
  @IsIn(["moins-cher", "autre-marque", "autre-texture"])
  preference?: string;
}
