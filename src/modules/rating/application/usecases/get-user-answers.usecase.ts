import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@module/common/prisma/prisma.service';
import {
    IUserRepository, USER_REPOSITORY_TOKEN,
} from '@module/user/infrastructure/repository/user.repository.interface';
import { UserAnswersComparisonDto, AnswerComparisonItemDto } from '@module/rating/application/dto/answer-comparison.dto';
import { EntityNotFoundException, BusinessRuleException } from '@common/exceptions/domain.exception';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class GetUserAnswersUseCase {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(USER_REPOSITORY_TOKEN) private readonly userRepo: IUserRepository,
        @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
    ) { }

    async execute(currentUserId: string, targetUserId: string): Promise<UserAnswersComparisonDto> {
        this.logger.log('답변 비교 조회', 'GetUserAnswersUseCase', { currentUserId, targetUserId });

        // 1. 대상 사용자 확인
        const targetUser = await this.userRepo.findById(targetUserId);
        if (!targetUser) throw new EntityNotFoundException('사용자', targetUserId);

        // 2. 매칭 성사 여부 확인 — ACCEPTED 매칭이 있어야 답변 조회 가능
        const matchRequests = await this.prisma.matchRequest.findMany({
            where: {
                status: 'ACCEPTED',
                OR: [
                    { fromUserId: currentUserId, toUserId: targetUserId },
                    { fromUserId: targetUserId, toUserId: currentUserId },
                ],
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
        });

        if (matchRequests.length === 0) {
            throw new BusinessRuleException('매칭이 성사된 사용자의 답변만 조회할 수 있습니다.');
        }

        const matchRequest = matchRequests[0];
        const quizSetId = matchRequest.quizSetId;

        // 3. 퀴즈 목록 (해당 퀴즈셋) + 선택지
        const quizzes = await this.prisma.quiz.findMany({
            where: { quizSetId },
            include: { choices: { orderBy: { order: 'asc' } } },
            orderBy: { order: 'asc' },
        });

        // 4. 양쪽 답변 로드
        const myAnswers = await this.prisma.quizAnswer.findMany({
            where: { userId: currentUserId, quiz: { quizSetId } },
        });
        const theirAnswers = await this.prisma.quizAnswer.findMany({
            where: { userId: targetUserId, quiz: { quizSetId } },
        });

        const myAnswerMap = new Map(myAnswers.map((a) => [a.quizId, a.choiceId]));
        const theirAnswerMap = new Map(theirAnswers.map((a) => [a.quizId, a.choiceId]));

        // 5. 비교 목록 생성
        let matchedCount = 0;
        const comparisons: AnswerComparisonItemDto[] = quizzes.map((quiz) => {
            const myChoiceId = myAnswerMap.get(quiz.id) ?? null;
            const theirChoiceId = theirAnswerMap.get(quiz.id) ?? null;

            const myChoiceText = myChoiceId
                ? quiz.choices.find((c) => c.id === myChoiceId)?.text ?? null
                : null;
            const theirChoiceText = theirChoiceId
                ? quiz.choices.find((c) => c.id === theirChoiceId)?.text ?? null
                : null;

            const isMatch = myChoiceId !== null && theirChoiceId !== null && myChoiceId === theirChoiceId;
            if (isMatch) matchedCount++;

            return {
                quizId: quiz.id,
                question: quiz.question,
                myChoice: myChoiceText,
                theirChoice: theirChoiceText,
                isMatch,
            };
        });

        const totalCount = quizzes.length;
        const matchRate = totalCount > 0 ? Math.round((matchedCount / totalCount) * 100) : 0;

        return {
            targetUserId,
            quizSetId,
            matchRate,
            matchedCount,
            totalCount,
            comparisons,
        };
    }
}
