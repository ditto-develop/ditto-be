import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SubmitQuizAnswerDto {
  @ApiProperty({
    description: '퀴즈 ID',
    example: 'quiz-id-1',
  })
  @IsString()
  @IsNotEmpty()
  quizId: string;

  @ApiProperty({
    description: '선택한 선택지 ID',
    example: 'choice-id-1',
  })
  @IsString()
  @IsNotEmpty()
  choiceId: string;
}
