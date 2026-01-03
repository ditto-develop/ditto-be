import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class ReorderQuizzesDto {
  @ApiProperty({
    description: '순서대로 정렬된 퀴즈 ID 배열',
    example: ['quiz-id-1', 'quiz-id-2', 'quiz-id-3'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1, { message: '최소 하나 이상의 퀴즈 ID가 필요합니다.' })
  quizIds: string[];
}

