import { Injectable } from '@nestjs/common';
import { Choice, CreateChoiceProps, UpdateChoiceProps } from '../domain/choice.entity';
import { ChoiceRepositoryPort } from '../domain/choice.repository.port';
import { PrismaService } from './prisma.service';

@Injectable()
export class ChoiceRepository implements ChoiceRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Choice | null> {
    const choice = await this.prisma.choice.findUnique({
      where: { id },
    });

    if (!choice) {
      return null;
    }

    return this.mapToEntity(choice);
  }

  async findByQuizId(quizId: string): Promise<Choice[]> {
    const choices = await this.prisma.choice.findMany({
      where: { quizId },
      orderBy: { order: 'asc' },
    });

    return choices.map(choice => this.mapToEntity(choice));
  }

  async findAll(): Promise<Choice[]> {
    const choices = await this.prisma.choice.findMany({
      orderBy: { order: 'asc' },
    });

    return choices.map(choice => this.mapToEntity(choice));
  }

  async create(props: CreateChoiceProps): Promise<Choice> {
    const choice = await this.prisma.choice.create({
      data: {
        id: props.id,
        text: props.text,
        quizId: props.quizId,
        order: props.order,
      },
    });

    return this.mapToEntity(choice);
  }

  async update(id: string, props: Partial<UpdateChoiceProps>): Promise<Choice> {
    const choice = await this.prisma.choice.update({
      where: { id },
      data: props,
    });

    return this.mapToEntity(choice);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.choice.delete({
      where: { id },
    });
  }

  private mapToEntity(choice: any): Choice {
    return new Choice({
      id: choice.id,
      text: choice.text,
      quizId: choice.quizId,
      order: choice.order,
    });
  }
}


