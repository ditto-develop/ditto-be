import { PrismaService } from '@module/common/prisma/prisma.service';
import { UserQuizProgress } from '@module/quiz/domain/entities/user-quiz-progress.entity';
import { QuizProgressStatus } from '@module/quiz/domain/value-objects/quiz-progress-status.vo';
import { IUserQuizProgressRepository } from './user-quiz-progress.repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserQuizProgressRepository implements IUserQuizProgressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserIdAndYearMonthWeek(
    userId: string,
    year: number,
    month: number,
    week: number,
  ): Promise<UserQuizProgress | null> {
    const progress = await this.prisma.userQuizProgress.findUnique({
      where: {
        userId_year_month_week: { userId, year, month, week },
      },
    });

    return progress ? this.toDomain(progress) : null;
  }

  async findByUserIdAndWeek(userId: string, week: number): Promise<UserQuizProgress | null> {
    const progress = await this.prisma.userQuizProgress.findFirst({
      where: {
        userId,
        week,
      },
      orderBy: { createdAt: 'desc' },
    });

    return progress ? this.toDomain(progress) : null;
  }

  async create(progress: UserQuizProgress): Promise<UserQuizProgress> {
    const created = await this.prisma.userQuizProgress.create({
      data: {
        id: progress.id,
        userId: progress.userId,
        year: progress.year,
        month: progress.month,
        week: progress.week,
        quizSetId: progress.quizSetId,
        status: progress.status,
        selectedAt: progress.selectedAt,
        completedAt: progress.completedAt,
      },
    });

    return this.toDomain(created);
  }

  async update(progress: UserQuizProgress): Promise<UserQuizProgress> {
    const updated = await this.prisma.userQuizProgress.update({
      where: { id: progress.id },
      data: {
        status: progress.status,
        completedAt: progress.completedAt,
        updatedAt: new Date(),
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.userQuizProgress.delete({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<UserQuizProgress[]> {
    const progresses = await this.prisma.userQuizProgress.findMany({
      where: { userId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }, { week: 'desc' }],
    });

    return progresses.map((p) => this.toDomain(p));
  }

  async findCompletedUsersByQuizSetId(
    quizSetId: string,
    year: number,
    month: number,
    week: number,
  ): Promise<string[]> {
    const progresses = await this.prisma.userQuizProgress.findMany({
      where: {
        quizSetId,
        year,
        month,
        week,
        status: QuizProgressStatus.COMPLETED,
      },
      select: {
        userId: true,
      },
    });

    return progresses.map((p) => p.userId);
  }

  private toDomain(p: any): UserQuizProgress {
    return UserQuizProgress.create(
      p.id,
      p.userId,
      p.year,
      p.month,
      p.week,
      p.quizSetId,
      p.status as QuizProgressStatus,
      p.selectedAt,
      p.completedAt,
      p.createdAt,
      p.updatedAt,
    );
  }
}
