import { ApiProperty } from '@nestjs/swagger';
import { CurrentWeekQuizSetDto } from './current-week-quiz-set.dto';

export class CurrentWeekQuizSetsResponseDto {
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
    description: '카테고리별 퀴즈 세트 목록',
    type: [CurrentWeekQuizSetDto],
  })
  quizSets: CurrentWeekQuizSetDto[];
}

