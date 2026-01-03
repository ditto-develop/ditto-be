import { ApiProperty } from '@nestjs/swagger';
import { QuizWithAnswerDto } from './quiz-with-answer.dto';

export class GetQuizSetWithProgressResponseDto {
  @ApiProperty({
    description: '퀴즈 목록 (사용자 답변 포함)',
    type: [QuizWithAnswerDto],
  })
  quizzes: QuizWithAnswerDto[];

  @ApiProperty({
    description: '전체 퀴즈 수',
    example: 10,
  })
  totalCount: number;
}
