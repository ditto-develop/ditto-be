import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QuizSetListQueryDto {
  @ApiProperty({
    description: '년도 필터',
    example: 2025,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  year?: number;

  @ApiProperty({
    description: '월 필터',
    example: 12,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiProperty({
    description: '주차 필터',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  week?: number;

  @ApiProperty({
    description: '카테고리 필터',
    example: '일상',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: '활성화 여부 필터',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }: { value: string | boolean }) => {
    if (typeof value === 'boolean') return value;
    else if (typeof value === 'string') {
      const v = value.toLowerCase();
      if (v === 'true') return true;
      if (v === 'false') return false;
    }
    return value;
  })
  @IsBoolean()
  isActive?: boolean;
}
