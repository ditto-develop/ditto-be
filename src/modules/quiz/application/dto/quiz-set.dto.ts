import { QuizSet } from '@module/quiz/domain/entities/quiz-set.entity';
import { ApiProperty } from '@nestjs/swagger';
import { QuizDto } from './quiz.dto';
import { QuizSetListItemDto } from './quiz-set-list-item.dto';

export class QuizSetDto {
  @ApiProperty({
    description: '퀴즈 세트 ID',
    example: 'cuid',
  })
  id: string;

  @ApiProperty({
    description: '년도',
    example: 2025,
  })
  year: number;

  @ApiProperty({
    description: '월',
    example: 12,
  })
  month: number;

  @ApiProperty({
    description: '주차',
    example: 1,
  })
  week: number;

  @ApiProperty({
    description: '카테고리',
    example: '일상',
  })
  category: string;

  @ApiProperty({
    description: '퀴즈 세트 제목',
    example: '1주차 일상 퀴즈',
  })
  title: string;

  @ApiProperty({
    description: '퀴즈 세트 설명',
    example: '일상생활에 관한 퀴즈 세트입니다.',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: '시작일',
    example: '2025-12-01T00:00:00Z',
  })
  startDate: Date;

  @ApiProperty({
    description: '종료일',
    example: '2025-12-08T00:00:00Z',
  })
  endDate: Date;

  @ApiProperty({
    description: '생성일',
    example: '2025-11-29T12:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정일',
    example: '2025-11-29T12:00:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: '활성화 여부',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: '매칭 타입',
    example: 'ONE_TO_ONE',
    enum: ['ONE_TO_ONE', 'GROUP'],
  })
  matchingType: 'ONE_TO_ONE' | 'GROUP';

  static fromDomain(quizSet: QuizSet): QuizSetDto {
    return {
      id: quizSet.id,
      year: quizSet.year,
      month: quizSet.month,
      week: quizSet.week,
      category: quizSet.category,
      title: quizSet.title,
      description: quizSet.description,
      startDate: quizSet.startDate,
      endDate: quizSet.endDate,
      isActive: quizSet.isActive,
      matchingType: quizSet.matchingType,
      createdAt: quizSet.createdAt,
      updatedAt: quizSet.updatedAt,
    };
  }

  /**
   * 도메인 엔티티에서 목록용 DTO로 변환 (타임스탬프 제외)
   */
  static fromDomainForList(quizSet: QuizSet): QuizSetListItemDto {
    return {
      id: quizSet.id,
      year: quizSet.year,
      month: quizSet.month,
      week: quizSet.week,
      category: quizSet.category,
      title: quizSet.title,
      description: quizSet.description,
      startDate: quizSet.startDate,
      endDate: quizSet.endDate,
      isActive: quizSet.isActive,
      matchingType: quizSet.matchingType,
    };
  }

  /**
   * 도메인 엔티티에서 퀴즈 목록을 포함한 DTO로 변환
   */
  static fromDomainWithQuizzes(
    quizSet: QuizSet,
    quizzes: QuizDto[],
    excludeTimestamps = false,
  ): QuizSetDto & { quizzes: QuizDto[] } {
    const base = excludeTimestamps ? this.fromDomainForList(quizSet) : this.fromDomain(quizSet);
    return {
      ...base,
      quizzes,
    } as QuizSetDto & { quizzes: QuizDto[] };
  }
}
