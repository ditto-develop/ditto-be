import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, ArrayMinSize, ArrayMaxSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuizChoiceDto } from './quiz-choice.dto';

export class CreateQuizDto {
  @ApiProperty({
    description: '퀴즈 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: '퀴즈 질문',
    example: '사과 vs 바나나',
  })
  @IsString()
  question: string;

  @ApiProperty({
    description: '퀴즈 세트 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  quizSetId: string;

  @ApiProperty({
    description: '퀴즈 선택지들 (정확히 2개)',
    type: [CreateQuizChoiceDto],
    example: [{ content: '사과' }, { content: '바나나' }],
  })
  @ArrayMinSize(2, { message: '선택지는 정확히 2개여야 합니다.' })
  @ArrayMaxSize(2, { message: '선택지는 정확히 2개여야 합니다.' })
  @ValidateNested({ each: true })
  @Type(() => CreateQuizChoiceDto)
  choices: CreateQuizChoiceDto[];

  @ApiProperty({
    description: '퀴즈 순서 (미지정 시 자동 할당)',
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  order?: number;
}
