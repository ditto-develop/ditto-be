import { Injectable, Inject } from '@nestjs/common';
import { QuizSet, CreateQuizSetProps, UpdateQuizSetProps } from '../domain/quiz-set.entity';
import { QuizSetRepositoryPort } from '../domain/quiz-set.repository.port';
import { PrismaService } from './prisma.service';

@Injectable()
export class QuizSetRepository implements QuizSetRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<QuizSet | null> {
    const quizSet = await this.prisma.quizSet.findUnique({
      where: { id },
    });

    if (!quizSet) {
      return null;
    }

    return this.mapToEntity(quizSet);
  }

  async findByWeekAndCategory(week: number, category: string): Promise<QuizSet | null> {
    const quizSet = await this.prisma.quizSet.findFirst({
      where: {
        week,
        category,
      },
    });

    if (!quizSet) {
      return null;
    }

    return this.mapToEntity(quizSet);
  }

  async findAll(): Promise<QuizSet[]> {
    const quizSets = await this.prisma.quizSet.findMany({
      orderBy: [
        { week: 'asc' },
        { category: 'asc' },
      ],
    });

    return quizSets.map(quizSet => this.mapToEntity(quizSet));
  }

  async create(props: CreateQuizSetProps): Promise<QuizSet> {
    const quizSet = await this.prisma.quizSet.create({
      data: {
        id: props.id,
        week: props.week,
        category: props.category,
        title: props.title,
        description: props.description,
        startDate: props.startDate,
        endDate: props.endDate,
      },
    });

    return this.mapToEntity(quizSet);
  }

  async update(id: string, props: Partial<UpdateQuizSetProps>): Promise<QuizSet> {
    const quizSet = await this.prisma.quizSet.update({
      where: { id },
      data: {
        ...props,
        updatedAt: new Date(),
      },
    });

    return this.mapToEntity(quizSet);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.quizSet.delete({
      where: { id },
    });
  }

  private mapToEntity(quizSet: any): QuizSet {
    return new QuizSet({
      id: quizSet.id,
      week: quizSet.week,
      category: quizSet.category,
      title: quizSet.title,
      description: quizSet.description,
      startDate: quizSet.startDate,
      endDate: quizSet.endDate,
      createdAt: quizSet.createdAt,
      updatedAt: quizSet.updatedAt,
    });
  }
}
