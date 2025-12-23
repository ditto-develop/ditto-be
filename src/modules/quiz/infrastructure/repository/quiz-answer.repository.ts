import { PrismaService } from '@module/common/prisma/prisma.service';
import { QuizAnswer } from '@module/quiz/domain/entities/quiz-answer.entity';
import { IQuizAnswerRepository } from './quiz-answer.repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QuizAnswerRepository implements IQuizAnswerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(answer: QuizAnswer): Promise<QuizAnswer> {
    const created = await this.prisma.quizAnswer.create({
      data: {
        id: answer.id,
        userId: answer.userId,
        quizId: answer.quizId,
        choiceId: answer.choiceId,
      },
    });

    return this.toDomain(created);
  }

  async update(answer: QuizAnswer): Promise<QuizAnswer> {
    const updated = await this.prisma.quizAnswer.update({
      where: { id: answer.id },
      data: {
        choiceId: answer.choiceId,
        updatedAt: new Date(),
      },
    });

    return this.toDomain(updated);
  }

  async findById(id: string): Promise<QuizAnswer | null> {
    const answer = await this.prisma.quizAnswer.findUnique({
      where: { id },
    });

    return answer ? this.toDomain(answer) : null;
  }

  async findByUserIdAndQuizId(userId: string, quizId: string): Promise<QuizAnswer | null> {
    const answer = await this.prisma.quizAnswer.findFirst({
      where: { userId, quizId },
    });

    return answer ? this.toDomain(answer) : null;
  }

  async findByUserIdAndQuizSetId(userId: string, quizSetId: string): Promise<QuizAnswer[]> {
    const answers = await this.prisma.quizAnswer.findMany({
      where: {
        userId,
        quiz: {
          quizSetId,
        },
      },
      orderBy: {
        quiz: {
          order: 'asc',
        },
      },
    });

    return answers.map((a) => this.toDomain(a));
  }

  async deleteByUserIdAndYearMonthWeek(
    userId: string,
    year: number,
    month: number,
    week: number,
  ): Promise<void> {
    // 특정 주차의 퀴즈 세트를 찾아서 해당 퀴즈들의 답변을 삭제
    const progress = await this.prisma.userQuizProgress.findUnique({
      where: {
        userId_year_month_week: { userId, year, month, week },
      },
    });

    if (progress) {
      await this.prisma.quizAnswer.deleteMany({
        where: {
          userId,
          quiz: {
            quizSetId: progress.quizSetId,
          },
        },
      });

      // 진행 상태도 삭제 (또는 초기화)
      await this.prisma.userQuizProgress.delete({
        where: { id: progress.id },
      });
    }
  }

  async deleteByUserIdAndWeek(userId: string, week: number): Promise<void> {
    const progress = await this.prisma.userQuizProgress.findFirst({
      where: { userId, week },
    });

    if (progress) {
      await this.prisma.quizAnswer.deleteMany({
        where: {
          userId,
          quiz: {
            quizSetId: progress.quizSetId,
          },
        },
      });

      await this.prisma.userQuizProgress.delete({
        where: { id: progress.id },
      });
    }
  }

  async countByQuizSetId(quizSetId: string): Promise<number> {
    return await this.prisma.quiz.count({
      where: { quizSetId },
    });
  }

  private toDomain(a: any): QuizAnswer {
    return QuizAnswer.create(a.id, a.userId, a.quizId, a.choiceId, a.answeredAt, a.updatedAt);
  }
}
