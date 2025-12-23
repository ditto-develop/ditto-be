import { ApiProperty } from '@nestjs/swagger';
import { QuizDto } from './quiz.dto';
import { QuizAnswerDto } from './quiz-answer.dto';

export class QuizWithAnswerDto extends QuizDto {
  @ApiProperty({
    description: '사용자의 답변 정보',
    type: QuizAnswerDto,
    required: false,
    nullable: true,
  })
  userAnswer?: QuizAnswerDto;
}
