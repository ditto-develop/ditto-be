import { Injectable } from '@nestjs/common';
import { PrismaService } from '@module/common/prisma/prisma.service';
import {
  AdminMatchListQueryDto,
  AdminMatchListResponseDto,
  AdminMatchRequestDto,
} from '../dto/admin-match-list.dto';

@Injectable()
export class GetAllMatchesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: AdminMatchListQueryDto): Promise<AdminMatchListResponseDto> {
    const { page = 1, limit = 50, status, quizSetId, matchingType } = query;

    const where = {
      ...(status && { status }),
      ...(quizSetId && { quizSetId }),
      ...(matchingType && { quizSet: { matchingType } }),
    };

    const [records, total] = await this.prisma.$transaction([
      this.prisma.matchRequest.findMany({
        where,
        include: {
          fromUser: { select: { id: true, nickname: true } },
          toUser: { select: { id: true, nickname: true } },
          quizSet: { select: { matchingType: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.matchRequest.count({ where }),
    ]);

    const data: AdminMatchRequestDto[] = records.map((r) => ({
      id: r.id,
      quizSetId: r.quizSetId,
      fromUserId: r.fromUserId,
      fromUserNickname: r.fromUser?.nickname ?? '',
      toUserId: r.toUserId,
      toUserNickname: r.toUser?.nickname ?? '',
      status: r.status,
      score: r.score,
      scoreBreakdown: r.scoreBreakdown as object | null,
      algorithmVersion: r.algorithmVersion,
      matchingType: r.quizSet.matchingType,
      requestedAt: r.requestedAt,
      respondedAt: r.respondedAt,
      createdAt: r.createdAt,
    }));

    return { data, total, page, limit };
  }
}
