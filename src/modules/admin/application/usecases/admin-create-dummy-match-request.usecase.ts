import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@module/common/prisma/prisma.service';
import {
  AdminCreateDummyMatchRequestDto,
  AdminCreateDummyMatchResultDto,
} from '../dto/admin-create-dummy-match-request.dto';

@Injectable()
export class AdminCreateDummyMatchRequestUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: AdminCreateDummyMatchRequestDto): Promise<AdminCreateDummyMatchResultDto> {
    const { fromUserId, toUserId, quizSetId } = dto;

    if (fromUserId === toUserId) {
      throw new BadRequestException('보내는 사람과 받는 사람이 같을 수 없습니다.');
    }

    // 유저 및 퀴즈셋 확인
    const [fromUser, toUser, quizSet] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: fromUserId } }),
      this.prisma.user.findUnique({ where: { id: toUserId } }),
      this.prisma.quizSet.findUnique({
        where: { id: quizSetId },
        include: { quizzes: { include: { choices: true } } },
      }),
    ]);

    if (!fromUser) throw new BadRequestException('보내는 유저를 찾을 수 없습니다.');
    if (!toUser) throw new BadRequestException('받는 유저를 찾을 수 없습니다.');
    if (!quizSet) throw new BadRequestException('퀴즈셋을 찾을 수 없습니다.');

    // 이미 존재하는 요청 확인
    const existing = await this.prisma.matchRequest.findUnique({
      where: { quizSetId_fromUserId_toUserId: { quizSetId, fromUserId, toUserId } },
    });
    if (existing) {
      return {
        id: existing.id,
        fromUserNickname: fromUser.nickname,
        toUserNickname: toUser.nickname,
        quizSetId,
        status: existing.status,
        score: existing.score,
        alreadyExists: true,
      };
    }

    // 더미 유저 퀴즈 미완료시 랜덤 답변 생성
    for (const quiz of quizSet.quizzes) {
      const hasAnswer = await this.prisma.quizAnswer.findFirst({
        where: { userId: fromUserId, quizId: quiz.id },
      });
      if (!hasAnswer && quiz.choices.length > 0) {
        const choice = quiz.choices[Math.floor(Math.random() * quiz.choices.length)];
        await this.prisma.quizAnswer.create({
          data: { userId: fromUserId, quizId: quiz.id, choiceId: choice.id },
        });
      }
    }

    // 점수 계산
    const [fromAnswers, toAnswers] = await Promise.all([
      this.prisma.quizAnswer.findMany({ where: { userId: fromUserId, quiz: { quizSetId } } }),
      this.prisma.quizAnswer.findMany({ where: { userId: toUserId, quiz: { quizSetId } } }),
    ]);
    const toMap = new Map(toAnswers.map((a) => [a.quizId, a.choiceId]));
    const matched = fromAnswers.filter((a) => toMap.get(a.quizId) === a.choiceId).length;
    const score = fromAnswers.length > 0 ? Math.round((matched / fromAnswers.length) * 100) : 0;

    // 매칭 요청 생성
    const matchRequest = await this.prisma.matchRequest.create({
      data: {
        quizSetId,
        fromUserId,
        toUserId,
        status: 'PENDING',
        score,
        scoreBreakdown: {
          quizMatchRate: score,
          matchedQuestions: matched,
          totalQuestions: fromAnswers.length,
          reasons: [],
        },
        algorithmVersion: 'v1',
      },
    });

    return {
      id: matchRequest.id,
      fromUserNickname: fromUser.nickname,
      toUserNickname: toUser.nickname,
      quizSetId,
      status: matchRequest.status,
      score: matchRequest.score,
      alreadyExists: false,
    };
  }
}
