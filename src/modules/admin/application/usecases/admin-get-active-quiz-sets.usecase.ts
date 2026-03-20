import { Injectable } from '@nestjs/common';
import { PrismaService } from '@module/common/prisma/prisma.service';
import { AdminActiveQuizSetDto } from '../dto/admin-create-dummy-match-request.dto';

@Injectable()
export class AdminGetActiveQuizSetsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<AdminActiveQuizSetDto[]> {
    const quizSets = await this.prisma.quizSet.findMany({
      where: { isActive: true },
      orderBy: { startDate: 'desc' },
    });

    return quizSets.map((qs) => ({
      id: qs.id,
      title: qs.title,
      matchingType: qs.matchingType,
      isActive: qs.isActive,
      startDate: qs.startDate,
      endDate: qs.endDate,
    }));
  }
}
