import { ApiProperty } from '@nestjs/swagger';
import { QuizDto } from './quiz.dto';
import { QuizSetListItemDto } from './quiz-set-list-item.dto';

export class CurrentWeekQuizSetDto extends QuizSetListItemDto {
  @ApiProperty({
    description: '퀴즈 목록 (순서대로 정렬됨)',
    type: [QuizDto],
  })
  quizzes: QuizDto[];
}

