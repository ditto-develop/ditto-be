import { IsString, IsInt, IsOptional, IsDate } from 'class-validator';

export class UpdateQuizSetDto {
  @IsOptional()
  @IsInt()
  week?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDate()
  startDate?: Date;
}


