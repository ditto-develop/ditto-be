import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class ReorderQuizzesDto {
  @ApiProperty({
    description: '순서대로 정렬된 퀴즈 ID 배열 (빈 배열 가능)',
    example: ['quiz-id-1', 'quiz-id-2', 'quiz-id-3'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  quizIds: string[];
}

