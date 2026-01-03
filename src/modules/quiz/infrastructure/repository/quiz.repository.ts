import { PrismaService } from '@module/common/prisma/prisma.service';
import { Quiz } from '@module/quiz/domain/entities/quiz.entity';
import { QuizFactory } from '@module/quiz/domain/factories/quiz.factory';
import { IQuizRepository } from '@module/quiz/infrastructure/repository/quiz.repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QuizRepository implements IQuizRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(quiz: Quiz): Promise<Quiz> {
    const created = await this.prisma.$transaction(async (tx) => {
      // Quiz 생성
      const quizData = await tx.quiz.create({
        data: {
          id: quiz.id,
          question: quiz.question,
          order: quiz.order,
          quizSetId: quiz.quizSetId,
        },
      });

      // Choices 생성
      const choiceData = quiz.choices.map((choice) => ({
        id: choice.id,
        text: choice.content,
        order: choice.order,
        quizId: quiz.id,
      }));

      await tx.choice.createMany({
        data: choiceData,
      });

      return quizData;
    });

    // 생성된 Quiz를 choices와 함께 조회하여 반환
    return (await this.findById(created.id)) as Quiz;
  }

  async findById(id: string): Promise<Quiz | null> {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        choices: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return quiz ? this.toDomain(quiz) : null;
  }

  async findByQuizSetId(quizSetId: string): Promise<Quiz[]> {
    const quizzes = await this.prisma.quiz.findMany({
      where: { quizSetId },
      include: {
        choices: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return quizzes.map((quiz) => this.toDomain(quiz));
  }

  async update(quiz: Quiz): Promise<Quiz> {
    await this.prisma.$transaction(async (tx) => {
      // Quiz 업데이트
      await tx.quiz.update({
        where: { id: quiz.id },
        data: {
          question: quiz.question,
          order: quiz.order,
          updatedAt: new Date(),
        },
      });

      // 기존 선택지 조회
      const existingChoices = await tx.choice.findMany({
        where: { quizId: quiz.id },
      });

      // 각 선택지 업데이트 또는 생성
      for (const newChoice of quiz.choices) {
        const existing = existingChoices.find((c) => c.id === newChoice.id);
        if (existing) {
          // 기존 선택지 업데이트
          await tx.choice.update({
            where: { id: newChoice.id },
            data: { text: newChoice.content, order: newChoice.order },
          });
        } else {
          // 새 선택지 생성
          await tx.choice.create({
            data: {
              id: newChoice.id,
              text: newChoice.content,
              order: newChoice.order,
              quizId: quiz.id,
            },
          });
        }
      }

      // 더 이상 사용되지 않는 선택지 삭제
      const newChoiceIds = quiz.choices.map((c) => c.id);
      const toDelete = existingChoices.filter((c) => !newChoiceIds.includes(c.id));
      if (toDelete.length > 0) {
        await tx.choice.deleteMany({
          where: { id: { in: toDelete.map((c) => c.id) } },
        });
      }
    });

    return (await this.findById(quiz.id)) as Quiz;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.quiz.delete({
      where: { id },
    });
  }

  async findMaxOrderByQuizSetId(quizSetId: string): Promise<number> {
    const result = await this.prisma.quiz.aggregate({
      where: { quizSetId },
      _max: {
        order: true,
      },
    });

    return result._max.order ?? 0;
  }

  async updateOrders(quizSetId: string, updates: Array<{ id: string; order: number }>): Promise<void> {
    const quizIdsToKeep = updates.map((u) => u.id);

    await this.prisma.$transaction(async (tx) => {
      // 1. 배열에 없는 퀴즈 삭제
      await tx.quiz.deleteMany({
        where: {
          quizSetId,
          id: { notIn: quizIdsToKeep },
        },
      });

      // 2. 각 퀴즈 순서 업데이트
      for (const update of updates) {
        await tx.quiz.update({
          where: { id: update.id },
          data: { order: update.order },
        });
      }
    });
  }

  private toDomain(quiz: {
    id: string;
    question: string;
    order: number;
    quizSetId: string;
    createdAt: Date;
    updatedAt: Date;
    choices: Array<{
      id: string;
      text: string;
      order: number;
    }>;
  }): Quiz {
    return QuizFactory.fromPersistence({
      id: quiz.id,
      question: quiz.question,
      order: quiz.order,
      quizSetId: quiz.quizSetId,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
      choices: quiz.choices,
    });
  }
}
