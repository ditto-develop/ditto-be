import { Injectable } from '@nestjs/common';
import { QuizAnswer, CreateQuizAnswerProps } from '../domain/quiz-answer.entity';
import { QuizAnswerRepositoryPort } from '../domain/quiz-answer.repository.port';
import { PrismaService } from './prisma.service';

@Injectable()
export class QuizAnswerRepository implements QuizAnswerRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<QuizAnswer | null> {
    const quizAnswer = await this.prisma.quizAnswer.findUnique({
      where: { id },
    });

    if (!quizAnswer) {
      return null;
    }

    return this.mapToEntity(quizAnswer);
  }

  async findByUserId(userId: string): Promise<QuizAnswer[]> {
    const quizAnswers = await this.prisma.quizAnswer.findMany({
      where: { userId },
      orderBy: { answeredAt: 'desc' },
    });

    return quizAnswers.map(quizAnswer => this.mapToEntity(quizAnswer));
  }

  async findByQuizId(quizId: string): Promise<QuizAnswer[]> {
    const quizAnswers = await this.prisma.quizAnswer.findMany({
      where: { quizId },
      orderBy: { answeredAt: 'desc' },
    });

    return quizAnswers.map(quizAnswer => this.mapToEntity(quizAnswer));
  }

  async findAll(): Promise<QuizAnswer[]> {
    const quizAnswers = await this.prisma.quizAnswer.findMany({
      orderBy: { answeredAt: 'desc' },
    });

    return quizAnswers.map(quizAnswer => this.mapToEntity(quizAnswer));
  }

  async create(props: CreateQuizAnswerProps): Promise<QuizAnswer> {
    const quizAnswer = await this.prisma.quizAnswer.create({
      data: {
        id: props.id,
        userId: props.userId,
        quizId: props.quizId,
        choiceId: props.choiceId,
      },
    });

    return this.mapToEntity(quizAnswer);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.quizAnswer.delete({
      where: { id },
    });
  }

  private mapToEntity(quizAnswer: any): QuizAnswer {
    return new QuizAnswer({
      id: quizAnswer.id,
      userId: quizAnswer.userId,
      quizId: quizAnswer.quizId,
      choiceId: quizAnswer.choiceId,
      answeredAt: quizAnswer.answeredAt,
    });
  }
}


