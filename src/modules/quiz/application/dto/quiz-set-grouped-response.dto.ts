import { ApiProperty } from '@nestjs/swagger';
import { QuizSetListItemDto } from './quiz-set-list-item.dto';

export class CategoryGroupDto {
  @ApiProperty({ description: '카테고리명', example: '금융' })
  category: string;

  @ApiProperty({ description: '퀴즈 세트 목록', type: [QuizSetListItemDto] })
  quizSets: QuizSetListItemDto[];
}

export class WeekGroupDto {
  @ApiProperty({ description: '주차', example: 1 })
  week: number;

  @ApiProperty({ description: '시작일', example: '2025-12-01T00:00:00Z' })
  startDate: Date;

  @ApiProperty({ description: '종료일', example: '2025-12-07T23:59:59.999Z' })
  endDate: Date;

  @ApiProperty({ description: '카테고리별 그룹 목록', type: [CategoryGroupDto] })
  categories: CategoryGroupDto[];
}

export class MonthGroupDto {
  @ApiProperty({ description: '월', example: 12 })
  month: number;

  @ApiProperty({ description: '주차별 그룹 목록', type: [WeekGroupDto] })
  weeks: WeekGroupDto[];
}

export class YearGroupDto {
  @ApiProperty({ description: '년도', example: 2025 })
  year: number;

  @ApiProperty({ description: '월별 그룹 목록', type: [MonthGroupDto] })
  months: MonthGroupDto[];
}

export class QuizSetGroupedResponseDto {
  @ApiProperty({ description: '년도별 그룹 목록', type: [YearGroupDto] })
  years: YearGroupDto[];
}

