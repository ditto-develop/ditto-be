import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsInt, Min, Max } from 'class-validator';

/**
 * 퀴즈 선택지 생성 DTO
 */
export class CreateQuizChoiceDto {
  @ApiProperty({
    description: '선택지 내용',
    example: '사과',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty({ message: '선택지 내용은 필수입니다.' })
  @MaxLength(500, { message: '선택지 내용은 500자를 초과할 수 없습니다.' })
  content: string;
}

/**
 * 퀴즈 선택지 수정 DTO
 */
export class UpdateQuizChoiceDto {
  @ApiProperty({
    description: '선택지 ID (수정 시 기존 ID 유지)',
    example: 'choice-123',
    required: false,
  })
  @IsString()
  @IsNotEmpty({ message: '선택지 ID는 필수입니다.' })
  id?: string;

  @ApiProperty({
    description: '선택지 내용',
    example: '바나나',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty({ message: '선택지 내용은 필수입니다.' })
  @MaxLength(500, { message: '선택지 내용은 500자를 초과할 수 없습니다.' })
  content: string;
}

/**
 * 퀴즈 선택지 응답 DTO
 */
export class QuizChoiceDto {
  @ApiProperty({
    description: '선택지 ID',
    example: 'choice-123',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: '선택지 내용',
    example: '사과',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: '선택지 순서 (1 또는 2)',
    example: 1,
    minimum: 1,
    maximum: 2,
  })
  @IsInt()
  @Min(1)
  @Max(2)
  order: number;

  constructor(id: string, content: string, order: number) {
    this.id = id;
    this.content = content;
    this.order = order;
  }

  /**
   * 도메인 객체로부터 DTO 생성
   */
  static fromDomain(choice: { id: string; content: string; order: number }): QuizChoiceDto {
    return new QuizChoiceDto(choice.id, choice.content, choice.order);
  }
}
