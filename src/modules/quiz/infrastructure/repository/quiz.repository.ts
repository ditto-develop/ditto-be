import { PrismaService } from '@module/common/prisma/prisma.service';
import { Quiz } from '@module/quiz/domain/entities/quiz.entity';
import { IQuizRepository } from '@module/quiz/infrastructure/repository/quiz.repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QuizRepository implements IQuizRepository {
  constructor(private readonly prisma: PrismaService) {
    console.log('[QuizRepository] QuizRepository 초기화');
  }

  async create(quiz: Quiz): Promise<Quiz> {
    console.log(`[QuizRepository] Quiz 생성: question=${quiz.question}`);
    const created = await this.prisma.quiz.create({
      data: {
        question: quiz.question,
        order: quiz.order,
        quizSetId: quiz.quizSetId,
      },
    });

    return this.toDomain(created);
  }

  private toDomain(quiz: {
    id: string;
    question: string;
    order: number;
    quizSetId: string;
    createdAt: Date;
    updatedAt: Date;
  }): Quiz {
    return Quiz.create(quiz.id, quiz.question, quiz.order, quiz.quizSetId, quiz.createdAt, quiz.updatedAt);
  }
}
