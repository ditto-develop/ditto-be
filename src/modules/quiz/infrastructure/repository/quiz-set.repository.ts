import { PrismaService } from '@module/common/prisma/prisma.service';
import { QuizSet } from '@module/quiz/domain/entities/quiz-set.entity';
import { IQuizSetRepository } from '@module/quiz/infrastructure/repository/quiz-set.repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QuizSetRepository implements IQuizSetRepository {
  constructor(private readonly prisma: PrismaService) {
    console.log('[QuizSetRepository] QuizSetRepository 초기화');
  }

  async create(quizSet: QuizSet): Promise<QuizSet> {
    console.log(`[QuizSetRepository] QuizSet 생성: title=${quizSet.title}`);
    const created = await this.prisma.quizSet.create({
      data: {
        week: quizSet.week,
        category: quizSet.category,
        title: quizSet.title,
        description: quizSet.description,
        startDate: quizSet.startDate,
        endDate: quizSet.endDate,
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
      orderBy: { week: 'asc' },
    });

    return quizSets.map((quizSet) => this.toDomain(quizSet));
  }

  async update(quizSet: QuizSet): Promise<QuizSet> {
    const updated = await this.prisma.quizSet.update({
      where: { id: quizSet.id },
      data: {
        week: quizSet.week,
        category: quizSet.category,
        title: quizSet.title,
        description: quizSet.description,
        startDate: quizSet.startDate,
        endDate: quizSet.endDate,
        isActive: quizSet.isActive,
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.quizSet.delete({
      where: { id },
    });
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
      orderBy: { week: 'asc' },
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
      throw new Error(`퀴즈 세트를 찾을 수 없습니다: ${id}`);
    }

    const activatedQuizSet = quizSet.activate();
    return await this.update(activatedQuizSet);
  }

  async deactivate(id: string): Promise<QuizSet> {
    console.log(`[QuizSetRepository] QuizSet 비활성화: id=${id}`);

    const quizSet = await this.findById(id);
    if (!quizSet) {
      throw new Error(`퀴즈 세트를 찾을 수 없습니다: ${id}`);
    }

    const deactivatedQuizSet = quizSet.deactivate();
    return await this.update(deactivatedQuizSet);
  }

  async findByActiveStatus(isActive: boolean): Promise<QuizSet[]> {
    console.log(`[QuizSetRepository] 활성화 상태로 QuizSet 목록 조회: isActive=${isActive}`);

    const quizSets = await this.prisma.quizSet.findMany({
      where: { isActive },
      orderBy: { week: 'asc' },
    });

    return quizSets.map((quizSet) => this.toDomain(quizSet));
  }

  async findByFilters(week?: number, category?: string, isActive?: boolean): Promise<QuizSet[]> {
    console.log(
      `[QuizSetRepository] 다중 필터로 QuizSet 목록 조회: week=${week}, category=${category}, isActive=${isActive}`,
    );

    const where: {
      week?: number;
      category?: string;
      isActive?: boolean;
    } = {};

    if (week !== undefined) {
      where.week = week;
    }
    if (category !== undefined) {
      where.category = category;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const quizSets = await this.prisma.quizSet.findMany({
      where,
      orderBy: { week: 'asc' },
    });

    return quizSets.map((quizSet) => this.toDomain(quizSet));
  }

  private toDomain(quizSet: {
    id: string;
    week: number;
    category: string;
    title: string;
    description: string | null;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): QuizSet {
    return QuizSet.create(
      quizSet.id,
      quizSet.week,
      quizSet.category,
      quizSet.title,
      quizSet.description,
      quizSet.startDate,
      quizSet.endDate,
      quizSet.isActive,
      quizSet.createdAt,
      quizSet.updatedAt,
    );
  }
}
