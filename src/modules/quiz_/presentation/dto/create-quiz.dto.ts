import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateQuizDto {
  @IsString()
  question: string;

  @IsString()
  quizSetId: string;

  @IsOptional()
  @IsInt()
  order?: number;
}


