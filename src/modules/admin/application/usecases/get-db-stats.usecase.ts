import { Injectable } from '@nestjs/common';
import { PrismaService } from '@module/common/prisma/prisma.service';
import { AdminDbStatsDto } from '../dto/admin-db-stats.dto';

@Injectable()
export class GetDbStatsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<AdminDbStatsDto> {
    const [users, quizSets, quizzes, matchRequests, chatRooms, ratings] =
      await this.prisma.$transaction([
        this.prisma.user.count(),
        this.prisma.quizSet.count(),
        this.prisma.quiz.count(),
        this.prisma.matchRequest.count(),
        this.prisma.chatRoom.count(),
        this.prisma.userRating.count(),
      ]);

    const statusGroups = await this.prisma.matchRequest.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    const matchRequestsByStatus = {
      PENDING: 0,
      ACCEPTED: 0,
      REJECTED: 0,
      CANCELLED: 0,
      EXPIRED: 0,
    };
    for (const group of statusGroups) {
      matchRequestsByStatus[group.status] = group._count._all;
    }

    return {
      users,
      quizSets,
      quizzes,
      matchRequests,
      chatRooms,
      ratings,
      matchRequestsByStatus,
    };
  }
}
