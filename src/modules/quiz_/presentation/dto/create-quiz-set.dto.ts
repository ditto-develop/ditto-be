import { IsString, IsInt, IsOptional, IsDate } from 'class-validator';

export class CreateQuizSetDto {
  @IsString()
  id: string;

  @IsInt()
  week: number;

  @IsString()
  category: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDate()
  startDate?: Date;
}


