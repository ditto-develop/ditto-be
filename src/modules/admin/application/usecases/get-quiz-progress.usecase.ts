import { Injectable } from '@nestjs/common';
import { PrismaService } from '@module/common/prisma/prisma.service';
import { SystemStateService } from '@module/quiz/infrastructure/services/system-state.service';
import {
  AdminQuizProgressItemDto,
  AdminQuizProgressResponseDto,
} from '../dto/admin-quiz-progress.dto';

@Injectable()
export class GetQuizProgressUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly systemStateService: SystemStateService,
  ) {}

  async execute(): Promise<AdminQuizProgressResponseDto> {
    const year = await this.systemStateService.getCurrentYear();
    const month = await this.systemStateService.getCurrentMonth();
    const week = await this.systemStateService.getCurrentWeek();

    const records = await this.prisma.userQuizProgress.findMany({
      where: { year, month, week },
      include: {
        user: { select: { id: true, nickname: true, email: true } },
        quizSet: {
          select: {
            title: true,
            matchingType: true,
            quizzes: { select: { id: true } },
          },
        },
      },
      orderBy: [{ status: 'asc' }, { completedAt: 'desc' }],
    });

    const items: AdminQuizProgressItemDto[] = records.map((r) => ({
      userId: r.userId,
      nickname: r.user.nickname ?? '',
      email: r.user.email ?? '',
      quizSetId: r.quizSetId,
      quizSetTitle: r.quizSet.title,
      matchingType: r.quizSet.matchingType,
      status: r.status,
      totalQuizzes: r.quizSet.quizzes.length,
      completedAt: r.completedAt,
      selectedAt: r.selectedAt,
      groupDeclined: r.groupDeclined,
    }));

    return { year, month, week, items, total: items.length };
  }
}
