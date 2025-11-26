import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateQuizDto {
  @ApiProperty({
    description: '퀴즈 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: '퀴즈 질문',
    example: '사과 vs 바나나',
  })
  @IsString()
  question: string;

  @ApiProperty({
    description: '퀴즈 세트 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  quizSetId: string;

  @ApiProperty({
    description: '퀴즈 순서',
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  order?: number;
}
