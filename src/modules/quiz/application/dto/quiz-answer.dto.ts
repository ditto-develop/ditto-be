import { ApiProperty } from '@nestjs/swagger';
import { QuizAnswer } from '@module/quiz/domain/entities/quiz-answer.entity';

export class QuizAnswerDto {
  @ApiProperty({
    description: '답변 ID',
    example: 'cuid',
  })
  id: string;

  @ApiProperty({
    description: '사용자 ID',
    example: 'user-id',
  })
  userId: string;

  @ApiProperty({
    description: '퀴즈 ID',
    example: 'quiz-id',
  })
  quizId: string;

  @ApiProperty({
    description: '선택한 선택지 ID',
    example: 'choice-id',
  })
  choiceId: string;

  @ApiProperty({
    description: '답변 시각',
    example: '2025-12-20T00:00:00Z',
  })
  answeredAt: Date;

  @ApiProperty({
    description: '수정 시각',
    example: '2025-12-20T00:00:00Z',
  })
  updatedAt: Date;

  static fromDomain(answer: QuizAnswer): QuizAnswerDto {
    return {
      id: answer.id,
      userId: answer.userId,
      quizId: answer.quizId,
      choiceId: answer.choiceId,
      answeredAt: answer.answeredAt,
      updatedAt: answer.updatedAt,
    };
  }
}
