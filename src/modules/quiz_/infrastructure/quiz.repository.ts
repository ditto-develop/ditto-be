import { Injectable } from '@nestjs/common';
import { Quiz, CreateQuizProps, UpdateQuizProps } from '../domain/quiz.entity';
import { QuizRepositoryPort } from '../domain/quiz.repository.port';
import { PrismaService } from './prisma.service';

@Injectable()
export class QuizRepository implements QuizRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Quiz | null> {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
    });

    if (!quiz) {
      return null;
    }

    return this.mapToEntity(quiz);
  }

  async findByQuizSetId(quizSetId: string): Promise<Quiz[]> {
    const quizzes = await this.prisma.quiz.findMany({
      where: { quizSetId },
      orderBy: { order: 'asc' },
    });

    return quizzes.map(quiz => this.mapToEntity(quiz));
  }

  async findAll(): Promise<Quiz[]> {
    const quizzes = await this.prisma.quiz.findMany({
      orderBy: { order: 'asc' },
    });

    return quizzes.map(quiz => this.mapToEntity(quiz));
  }

  async create(props: CreateQuizProps): Promise<Quiz> {
    const quiz = await this.prisma.quiz.create({
      data: {
        id: props.id,
        question: props.question,
        order: props.order,
        quizSetId: props.quizSetId,
      },
    });

    return this.mapToEntity(quiz);
  }

  async update(id: string, props: Partial<UpdateQuizProps>): Promise<Quiz> {
    const quiz = await this.prisma.quiz.update({
      where: { id },
      data: {
        ...props,
        updatedAt: new Date(),
      },
    });

    return this.mapToEntity(quiz);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.quiz.delete({
      where: { id },
    });
  }

  async swapOrder(quizId1: string, quizId2: string): Promise<void> {
    // Get both quizzes
    const quiz1 = await this.prisma.quiz.findUnique({
      where: { id: quizId1 },
    });

    const quiz2 = await this.prisma.quiz.findUnique({
      where: { id: quizId2 },
    });

    if (!quiz1 || !quiz2) {
      throw new Error('One or both quizzes not found');
    }

    // Swap orders in a transaction
    await this.prisma.$transaction([
      this.prisma.quiz.update({
        where: { id: quizId1 },
        data: { order: quiz2.order, updatedAt: new Date() },
      }),
      this.prisma.quiz.update({
        where: { id: quizId2 },
        data: { order: quiz1.order, updatedAt: new Date() },
      }),
    ]);
  }

  private mapToEntity(quiz: any): Quiz {
    return new Quiz({
      id: quiz.id,
      question: quiz.question,
      order: quiz.order,
      quizSetId: quiz.quizSetId,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
    });
  }
}
