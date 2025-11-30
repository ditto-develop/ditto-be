import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateQuizSetDto {
  @ApiProperty({
    description: '주차',
    example: 1,
  })
  @IsInt()
  @Min(1)
  week: number;

  @ApiProperty({
    description: '카테고리',
    example: '일상',
  })
  @IsString()
  category: string;

  @ApiProperty({
    description: '퀴즈 세트 제목',
    example: '1주차 일상 퀴즈',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: '퀴즈 세트 설명',
    example: '일상생활에 관한 퀴즈 세트입니다.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '시작일',
    example: '2025-12-01T00:00:00Z',
  })
  @IsDateString()
  startDate: string;
}
