import { ApiProperty } from '@nestjs/swagger';
import { QuizProgressStatus } from '@module/quiz/domain/value-objects/quiz-progress-status.vo';

export class QuizProgressDto {
  @ApiProperty({
    description: '현재 진행 상태',
    enum: QuizProgressStatus,
    example: QuizProgressStatus.IN_PROGRESS,
  })
  status: QuizProgressStatus;

  @ApiProperty({
    description: '선택한 퀴즈 세트 ID',
    example: 'quiz-set-id-1',
    nullable: true,
  })
  quizSetId: string | null;

  @ApiProperty({
    description: '선택한 퀴즈 세트 제목',
    example: '1주차 일상 퀴즈',
    nullable: true,
  })
  quizSetTitle: string | null;

  @ApiProperty({
    description: '전체 퀴즈 수',
    example: 10,
  })
  totalQuizzes: number;

  @ApiProperty({
    description: '푼 퀴즈 수',
    example: 5,
  })
  answeredQuizzes: number;
}
