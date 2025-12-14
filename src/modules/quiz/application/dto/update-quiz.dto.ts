import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, ArrayMinSize, ArrayMaxSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateQuizChoiceDto } from './quiz-choice.dto';

export class UpdateQuizDto {
  @ApiProperty({
    description: '퀴즈 질문',
    example: '가장 좋아하는 과일은?',
    required: false,
  })
  @IsOptional()
  @IsString()
  question?: string;

  @ApiProperty({
    description: '퀴즈 선택지들 (정확히 2개, 모두 수정 시 필수)',
    type: [UpdateQuizChoiceDto],
    required: false,
    example: [
      { id: 'choice-1', content: '사과' },
      { id: 'choice-2', content: '바나나' },
    ],
  })
  @IsOptional()
  @ArrayMinSize(2, { message: '선택지는 정확히 2개여야 합니다.' })
  @ArrayMaxSize(2, { message: '선택지는 정확히 2개여야 합니다.' })
  @ValidateNested({ each: true })
  @Type(() => UpdateQuizChoiceDto)
  choices?: UpdateQuizChoiceDto[];

  @ApiProperty({
    description: '퀴즈 순서',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsInt()
  order?: number;
}
