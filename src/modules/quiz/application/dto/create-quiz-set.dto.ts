import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateQuizSetDto {
  @ApiProperty({
    description: '년도',
    example: 2025,
  })
  @IsInt()
  @Min(2000)
  year: number;

  @ApiProperty({
    description: '월',
    example: 12,
  })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

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

  @ApiProperty({
    description: '강제 적용 패스워드',
    required: false,
  })
  @IsOptional()
  @IsString()
  forcePassword?: string;
}
