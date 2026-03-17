import { Injectable } from '@nestjs/common';
import { PrismaService } from '@module/common/prisma/prisma.service';
import { SystemStateService } from '@module/quiz/infrastructure/services/system-state.service';

@Injectable()
export class ResetAllQuizProgressUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly systemStateService: SystemStateService,
  ) {}

  async execute(): Promise<{
    deletedAnswers: number;
    deletedProgress: number;
    deletedMatchRequests: number;
    deletedChatRooms: number;
  }> {
    const year = await this.systemStateService.getCurrentYear();
    const month = await this.systemStateService.getCurrentMonth();
    const week = await this.systemStateService.getCurrentWeek();

    // 현재 주차의 퀴즈셋 ID 조회
    const quizSets = await this.prisma.quizSet.findMany({
      where: { year, month, week },
      select: { id: true },
    });
    const quizSetIds = quizSets.map((qs) => qs.id);

    // 해당 퀴즈셋의 매칭 요청 ID 조회
    const matchRequests = await this.prisma.matchRequest.findMany({
      where: { quizSetId: { in: quizSetIds } },
      select: { id: true },
    });
    const matchRequestIds = matchRequests.map((mr) => mr.id);

    // 매칭 평가 삭제 (MatchRequest 삭제 전 선행)
    await this.prisma.userRating.deleteMany({
      where: { matchRequestId: { in: matchRequestIds } },
    });

    // 채팅방 삭제 (ChatParticipant, ChatMessage는 onDelete: Cascade로 자동 삭제)
    // 그룹 채팅방(quizSetId 기반) + 1:1 채팅방(matchRequestId 기반) 모두 삭제
    const { count: deletedChatRooms } = await this.prisma.chatRoom.deleteMany({
      where: {
        OR: [
          { quizSetId: { in: quizSetIds } },
          { matchRequestId: { in: matchRequestIds } },
        ],
      },
    });

    // 매칭 요청 삭제
    const { count: deletedMatchRequests } = await this.prisma.matchRequest.deleteMany({
      where: { quizSetId: { in: quizSetIds } },
    });

    // 해당 퀴즈셋의 모든 답변 삭제
    const { count: deletedAnswers } = await this.prisma.quizAnswer.deleteMany({
      where: {
        quiz: { quizSetId: { in: quizSetIds } },
      },
    });

    // 모든 사용자의 해당 주차 진행 상태 삭제
    const { count: deletedProgress } = await this.prisma.userQuizProgress.deleteMany({
      where: { year, month, week },
    });

    return { deletedAnswers, deletedProgress, deletedMatchRequests, deletedChatRooms };
  }
}
