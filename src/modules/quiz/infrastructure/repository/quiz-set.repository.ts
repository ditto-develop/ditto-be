import { PrismaService } from '@module/common/prisma/prisma.service';
import { QuizSet } from '@module/quiz/domain/entities/quiz-set.entity';
import { IQuizSetRepository } from '@module/quiz/infrastructure/repository/quiz-set.repository.interface';
import { Injectable } from '@nestjs/common';
import { QuizSetNotFoundException } from '@module/quiz/domain/exceptions/quiz.exceptions';

@Injectable()
export class QuizSetRepository implements IQuizSetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(quizSet: QuizSet): Promise<QuizSet> {
    console.log(`[QuizSetRepository] QuizSet 생성: title=${quizSet.title}`);
    const created = await this.prisma.quizSet.create({
      data: {
        year: quizSet.year,
        month: quizSet.month,
        week: quizSet.week,
        category: quizSet.category,
        title: quizSet.title,
        description: quizSet.description,
        startDate: quizSet.startDate,
        endDate: quizSet.endDate,
        matchingType: quizSet.matchingType,
      },
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<QuizSet | null> {
    const quizSet = await this.prisma.quizSet.findUnique({
      where: { id },
    });

    return quizSet ? this.toDomain(quizSet) : null;
  }

  async findAll(): Promise<QuizSet[]> {
    const quizSets = await this.prisma.quizSet.findMany({
      orderBy: [{ year: 'asc' }, { month: 'asc' }, { week: 'asc' }],
    });

    return quizSets.map((quizSet) => this.toDomain(quizSet));
  }

  async update(quizSet: QuizSet): Promise<QuizSet> {
    const updated = await this.prisma.quizSet.update({
      where: { id: quizSet.id },
      data: {
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
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.quizSet.delete({
      where: { id },
    });
  }

  async findByYearMonthWeek(year: number, month: number, week: number): Promise<QuizSet | null> {
    const quizSet = await this.prisma.quizSet.findFirst({
      where: { year, month, week },
    });

    return quizSet ? this.toDomain(quizSet) : null;
  }

  async findByYearMonthWeekCategory(
    year: number,
    month: number,
    week: number,
    category: string,
  ): Promise<QuizSet | null> {
    const quizSet = await this.prisma.quizSet.findFirst({
      where: { year, month, week, category },
    });

    return quizSet ? this.toDomain(quizSet) : null;
  }

  async findByWeek(week: number): Promise<QuizSet | null> {
    const quizSet = await this.prisma.quizSet.findFirst({
      where: { week },
    });

    return quizSet ? this.toDomain(quizSet) : null;
  }

  async findByCategory(category: string): Promise<QuizSet[]> {
    const quizSets = await this.prisma.quizSet.findMany({
      where: { category },
      orderBy: [{ year: 'asc' }, { month: 'asc' }, { week: 'asc' }],
    });

    return quizSets.map((quizSet) => this.toDomain(quizSet));
  }

  async countQuizzes(quizSetId: string): Promise<number> {
    return await this.prisma.quiz.count({
      where: { quizSetId },
    });
  }

  async activate(id: string): Promise<QuizSet> {
    console.log(`[QuizSetRepository] QuizSet 활성화: id=${id}`);

    const quizSet = await this.findById(id);
    if (!quizSet) {
      throw new QuizSetNotFoundException(id);
    }

    const activatedQuizSet = quizSet.activate();
    return await this.update(activatedQuizSet);
  }

  async deactivate(id: string): Promise<QuizSet> {
    console.log(`[QuizSetRepository] QuizSet 비활성화: id=${id}`);

    const quizSet = await this.findById(id);
    if (!quizSet) {
      throw new QuizSetNotFoundException(id);
    }

    const deactivatedQuizSet = quizSet.deactivate();
    return await this.update(deactivatedQuizSet);
  }

  async findByActiveStatus(isActive: boolean): Promise<QuizSet[]> {
    console.log(`[QuizSetRepository] 활성화 상태로 QuizSet 목록 조회: isActive=${isActive}`);

    const quizSets = await this.prisma.quizSet.findMany({
      where: { isActive },
      orderBy: [{ year: 'asc' }, { month: 'asc' }, { week: 'asc' }],
    });

    return quizSets.map((quizSet) => this.toDomain(quizSet));
  }

  async findByFilters(
    year?: number,
    month?: number,
    week?: number,
    category?: string,
    isActive?: boolean,
    matchingType?: 'ONE_TO_ONE' | 'GROUP',
  ): Promise<QuizSet[]> {
    console.log(
      `[QuizSetRepository] 다중 필터로 QuizSet 목록 조회: year=${year}, month=${month}, week=${week}, category=${category}, isActive=${isActive}, matchingType=${matchingType}`,
    );

    const where: any = {};

    if (year !== undefined) where.year = year;
    if (month !== undefined) where.month = month;
    if (week !== undefined) where.week = week;
    if (category !== undefined) where.category = category;
    if (isActive !== undefined) where.isActive = isActive;
    if (matchingType !== undefined) where.matchingType = matchingType;

    const quizSets = await this.prisma.quizSet.findMany({
      where,
      orderBy: [{ year: 'asc' }, { month: 'asc' }, { week: 'asc' }],
    });

    return quizSets.map((quizSet) => this.toDomain(quizSet));
  }

  private toDomain(quizSet: any): QuizSet {
    return QuizSet.create(
      quizSet.id,
      quizSet.year,
      quizSet.month,
      quizSet.week,
      quizSet.category,
      quizSet.title,
      quizSet.description,
      quizSet.startDate,
      quizSet.endDate,
      quizSet.isActive,
      quizSet.matchingType || 'ONE_TO_ONE', // 기본값 처리
      quizSet.createdAt,
      quizSet.updatedAt,
    );
  }
}
