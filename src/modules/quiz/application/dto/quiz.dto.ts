import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';
import { QuizChoiceDto } from './quiz-choice.dto';

export class QuizDto {
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
    description: '퀴즈 선택지들',
    type: [QuizChoiceDto],
    example: [
      { id: 'choice-1', content: '사과', order: 1 },
      { id: 'choice-2', content: '바나나', order: 2 },
    ],
  })
  choices: QuizChoiceDto[];

  @ApiProperty({
    description: '퀴즈 순서',
    nullable: true,
    required: false,
    example: 1,
  })
  @IsInt()
  @IsOptional()
  order: number | null;

  @ApiProperty({
    description: '생성일',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: '수정일',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsDate()
  updatedAt: Date;

  constructor(
    id: string,
    question: string,
    quizSetId: string,
    choices: QuizChoiceDto[],
    order: number | null,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.question = question;
    this.quizSetId = quizSetId;
    this.choices = choices;
    this.order = order;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromDomain(quiz: {
    id: string;
    question: string;
    quizSetId: string;
    choices: Array<{ id: string; content: string; order: number }>;
    order: number | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    const choices = quiz.choices.map((choice) => QuizChoiceDto.fromDomain(choice));
    return new QuizDto(quiz.id, quiz.question, quiz.quizSetId, choices, quiz.order, quiz.createdAt, quiz.updatedAt);
  }
}
