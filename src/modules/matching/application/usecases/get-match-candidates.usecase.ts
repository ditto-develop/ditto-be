import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@module/common/prisma/prisma.service';
import {
    IUserRepository, USER_REPOSITORY_TOKEN,
} from '@module/user/infrastructure/repository/user.repository.interface';
import {
    IUserProfileRepository, USER_PROFILE_REPOSITORY_TOKEN,
} from '@module/profile/infrastructure/repository/user-profile.repository.interface';
import { MatchingScoreService } from '@module/matching/domain/services/matching-score.service';
import { MatchCandidate, UserAnswerMap, MATCHING_CONSTANTS } from '@module/matching/domain/value-objects/match-candidate.vo';
import { MatchCandidateListDto, MatchCandidateDto } from '@module/matching/application/dto/match-candidate.dto';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';
import { EntityNotFoundException } from '@common/exceptions/domain.exception';

@Injectable()
export class GetMatchCandidatesUseCase {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(USER_REPOSITORY_TOKEN) private readonly userRepo: IUserRepository,
        @Inject(USER_PROFILE_REPOSITORY_TOKEN) private readonly profileRepo: IUserProfileRepository,
        private readonly scoreService: MatchingScoreService,
        @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
    ) { }

    async execute(userId: string): Promise<MatchCandidateListDto> {
        this.logger.log('매칭 후보 조회 시작', 'GetMatchCandidatesUseCase', { userId });

        // 0. 요청자 확인
        const me = await this.userRepo.findById(userId);
        if (!me || !me.isActive()) {
            throw new EntityNotFoundException('활성 사용자', userId);
        }

        // 1. 현재 주차 퀴즈셋에서 내가 COMPLETED한 퀴즈셋 조회
        const myProgress = await this.prisma.userQuizProgress.findFirst({
            where: { userId, status: 'COMPLETED' },
            orderBy: { completedAt: 'desc' },
        });

        if (!myProgress) {
            return { quizSetId: '', algorithmVersion: MATCHING_CONSTANTS.ALGORITHM_VERSION, candidates: [] };
        }

        const quizSetId = myProgress.quizSetId;

        // 2. 같은 퀴즈셋을 COMPLETED한 다른 사용자들 조회
        const otherProgresses = await this.prisma.userQuizProgress.findMany({
            where: { quizSetId, status: 'COMPLETED', userId: { not: userId } },
        });

        // Load user data for each progress
        const otherUserIds = otherProgresses.map((p) => p.userId);
        const otherUsers = await this.prisma.user.findMany({
            where: { id: { in: otherUserIds } },
        });

        // 3. 내 답변 로드
        const myAnswersRaw = await this.prisma.quizAnswer.findMany({
            where: { userId, quiz: { quizSetId } },
        });
        const myAnswerMap: UserAnswerMap = {
            userId,
            answers: new Map(myAnswersRaw.map((a) => [a.quizId, a.choiceId])),
        };

        // 4. 내 프로필(선호 나이) 로드
        const myProfile = await this.profileRepo.findByUserId(userId);

        // 5. Batch 로드: 프로필 + 답변 (N+1 방지)
        const activeOtherUsers = otherUsers.filter((u) => !u.leftAt);
        const activeOtherUserIds = activeOtherUsers.map((u) => u.id);

        const otherProfiles = await this.prisma.userProfile.findMany({
            where: { userId: { in: activeOtherUserIds } },
        });
        const profileMap = new Map(otherProfiles.map((p) => [p.userId, p]));

        const allOtherAnswers = await this.prisma.quizAnswer.findMany({
            where: { userId: { in: activeOtherUserIds }, quiz: { quizSetId } },
        });
        const answersByUser = new Map<string, Map<string, string>>();
        for (const a of allOtherAnswers) {
            if (!answersByUser.has(a.userId)) answersByUser.set(a.userId, new Map());
            answersByUser.get(a.userId).set(a.quizId, a.choiceId);
        }

        // 6. Hard filter + Score 계산
        const candidates: MatchCandidate[] = [];

        for (const other of activeOtherUsers) {
            // Hard filter: 나이 선호 범위 불일치 제외
            if (myProfile?.preferredMinAge && other.age < myProfile.preferredMinAge) continue;
            if (myProfile?.preferredMaxAge && other.age > myProfile.preferredMaxAge) continue;

            // 상대방의 나이 선호도 역검증
            const otherProfile = profileMap.get(other.id);
            if (otherProfile?.preferredMinAge && me.age < otherProfile.preferredMinAge) continue;
            if (otherProfile?.preferredMaxAge && me.age > otherProfile.preferredMaxAge) continue;

            // Score 계산
            const otherAnswerMap: UserAnswerMap = {
                userId: other.id,
                answers: answersByUser.get(other.id) ?? new Map(),
            };
            const breakdown = this.scoreService.calculateScore(myAnswerMap, otherAnswerMap);

            candidates.push({
                userId: other.id,
                nickname: other.nickname,
                gender: other.gender,
                age: other.age,
                introduction: otherProfile?.introduction ?? null,
                score: breakdown.quizMatchRate,
                scoreBreakdown: breakdown,
            });
        }

        // 6. 점수 내림차순 정렬 + 상위 N명
        candidates.sort((a, b) => b.score - a.score);
        const topCandidates = candidates.slice(0, MATCHING_CONSTANTS.MAX_CANDIDATES);

        this.logger.log(`매칭 후보 ${topCandidates.length}명 반환`, 'GetMatchCandidatesUseCase', { userId, quizSetId });

        // 7. DTO 변환
        const candidateDtos: MatchCandidateDto[] = topCandidates.map((c) => ({
            userId: c.userId,
            nickname: c.nickname,
            gender: c.gender,
            age: c.age,
            introduction: c.introduction,
            matchRate: c.score,
            scoreBreakdown: c.scoreBreakdown,
        }));

        return {
            quizSetId,
            algorithmVersion: MATCHING_CONSTANTS.ALGORITHM_VERSION,
            candidates: candidateDtos,
        };
    }
}
