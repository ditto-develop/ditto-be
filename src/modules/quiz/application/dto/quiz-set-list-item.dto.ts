import { ApiProperty } from '@nestjs/swagger';

export class QuizSetListItemDto {
  @ApiProperty({
    description: '퀴즈 세트 ID',
    example: 'cuid',
  })
  id: string;

  @ApiProperty({
    description: '년도',
    example: 2025,
  })
  year: number;

  @ApiProperty({
    description: '월',
    example: 12,
  })
  month: number;

  @ApiProperty({
    description: '주차',
    example: 1,
  })
  week: number;

  @ApiProperty({
    description: '카테고리',
    example: '일상',
  })
  category: string;

  @ApiProperty({
    description: '퀴즈 세트 제목',
    example: '1주차 일상 퀴즈',
  })
  title: string;

  @ApiProperty({
    description: '퀴즈 세트 설명',
    example: '일상생활에 관한 퀴즈 세트입니다.',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: '시작일',
    example: '2025-12-01T00:00:00Z',
  })
  startDate: Date;

  @ApiProperty({
    description: '종료일',
    example: '2025-12-08T00:00:00Z',
  })
  endDate: Date;

  @ApiProperty({
    description: '활성화 여부',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: '매칭 타입',
    example: 'ONE_TO_ONE',
    enum: ['ONE_TO_ONE', 'GROUP'],
  })
  matchingType: 'ONE_TO_ONE' | 'GROUP';
}

