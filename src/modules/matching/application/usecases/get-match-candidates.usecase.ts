import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@module/common/prisma/prisma.service';
import {
    IUserRepository, USER_REPOSITORY_TOKEN,
} from '@module/user/infrastructure/repository/user.repository.interface';
import { MatchingScoreService } from '@module/matching/domain/services/matching-score.service';
import { UserAnswerMap, MATCHING_CONSTANTS } from '@module/matching/domain/value-objects/match-candidate.vo';
import { ScoreBreakdown } from '@module/matching/domain/entities/match-request.entity';
import { MatchCandidateListDto, MatchCandidateDto } from '@module/matching/application/dto/match-candidate.dto';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';
import { EntityNotFoundException } from '@common/exceptions/domain.exception';
import {
    IMatchRequestRepository, MATCH_REQUEST_REPOSITORY_TOKEN,
} from '@module/matching/infrastructure/repository/match-request.repository.interface';

/** 점수가 계산된 Pair (정렬·선발에 사용) */
interface ScoredPair {
    userAId: string;
    userBId: string;
    /** 선발 기준 점수: 일치한 문항 수 (정수) */
    score: number;
    scoreBreakdown: ScoreBreakdown;
}

@Injectable()
export class GetMatchCandidatesUseCase {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(USER_REPOSITORY_TOKEN) private readonly userRepo: IUserRepository,
        private readonly scoreService: MatchingScoreService,
        @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
        @Inject(MATCH_REQUEST_REPOSITORY_TOKEN) private readonly matchRepo: IMatchRequestRepository,
    ) { }

    async execute(userId: string): Promise<MatchCandidateListDto> {
        this.logger.log('매칭 후보 조회 시작 (v2 Pair-Based)', 'GetMatchCandidatesUseCase', { userId });

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
            throw new EntityNotFoundException('완료된 퀴즈 참여 기록', userId);
        }

        const quizSetId = myProgress.quizSetId;

        // 1-1. 퀴즈셋 매칭 타입 조회
        const quizSet = await this.prisma.quizSet.findUnique({ where: { id: quizSetId }, select: { matchingType: true } });
        const matchingType = quizSet?.matchingType ?? 'ONE_TO_ONE';
        const maxPerUser = matchingType === 'GROUP'
            ? MATCHING_CONSTANTS.MAX_GROUP_CANDIDATES
            : MATCHING_CONSTANTS.MAX_CANDIDATES;

        // 2. 같은 퀴즈셋을 COMPLETED한 모든 활성 사용자 조회 (나 포함)
        const allProgresses = await this.prisma.userQuizProgress.findMany({
            where: { quizSetId, status: 'COMPLETED' },
        });
        const allUserIds = allProgresses.map((p) => p.userId);

        const allUsers = await this.prisma.user.findMany({
            where: { id: { in: allUserIds } },
        });
        const activeUsers = allUsers.filter((u) => !u.leftAt);
        const userMap = new Map(activeUsers.map((u) => [u.id, u]));

        // 3. 전체 프로필 Batch 로드
        const activeUserIds = activeUsers.map((u) => u.id);
        const allProfiles = await this.prisma.userProfile.findMany({
            where: { userId: { in: activeUserIds } },
        });
        const profileMap = new Map(allProfiles.map((p) => [p.userId, p]));

        // 4. 전체 퀴즈 답변 Batch 로드
        const allAnswersRaw = await this.prisma.quizAnswer.findMany({
            where: { userId: { in: activeUserIds }, quiz: { quizSetId } },
        });
        const answersByUser = new Map<string, Map<string, string>>();
        for (const a of allAnswersRaw) {
            if (!answersByUser.has(a.userId)) answersByUser.set(a.userId, new Map());
            answersByUser.get(a.userId).set(a.quizId, a.choiceId);
        }

        // 5. REJECTED 조합 Set 구성 (양방향)
        const rejectedRequests = await this.prisma.matchRequest.findMany({
            where: { quizSetId, status: 'REJECTED' },
        });
        const rejectedPairKeys = new Set(
            rejectedRequests.map((r) => [r.fromUserId, r.toUserId].sort().join('-'))
        );

        // 6. 모든 유효 조합에 대해 Hard Filter + Score 계산
        const userList = Array.from(userMap.values());
        const validPairs: ScoredPair[] = [];

        for (let i = 0; i < userList.length; i++) {
            for (let j = i + 1; j < userList.length; j++) {
                const a = userList[i];
                const b = userList[j];

                // REJECTED 조합 제외
                const pairKey = [a.id, b.id].sort().join('-');
                if (rejectedPairKeys.has(pairKey)) continue;

                const profileA = profileMap.get(a.id);
                const profileB = profileMap.get(b.id);

                // Hard filter 1: 이성 매칭
                if (a.gender === b.gender) continue;

                // Hard filter 2: 연령대 차이 최대 1개 대수
                const decadeA = Math.floor(a.age / 10);
                const decadeB = Math.floor(b.age / 10);
                if (Math.abs(decadeA - decadeB) > 1) continue;

                // Hard filter 3: 양방향 나이 선호 범위
                if (profileA?.preferredMinAge && b.age < profileA.preferredMinAge) continue;
                if (profileA?.preferredMaxAge && b.age > profileA.preferredMaxAge) continue;
                if (profileB?.preferredMinAge && a.age < profileB.preferredMinAge) continue;
                if (profileB?.preferredMaxAge && a.age > profileB.preferredMaxAge) continue;

                // Score 계산
                const answersA: UserAnswerMap = { userId: a.id, answers: answersByUser.get(a.id) ?? new Map() };
                const answersB: UserAnswerMap = { userId: b.id, answers: answersByUser.get(b.id) ?? new Map() };
                const breakdown = this.scoreService.calculateScore(answersA, answersB);

                validPairs.push({
                    userAId: a.id,
                    userBId: b.id,
                    score: breakdown.matchedQuestions, // 정수 일치 문항 수 기준
                    scoreBreakdown: breakdown,
                });
            }
        }

        if (validPairs.length === 0) {
            this.logger.log('유효한 조합 없음', 'GetMatchCandidatesUseCase', { userId, quizSetId });
            return { quizSetId, matchingType, algorithmVersion: MATCHING_CONSTANTS.ALGORITHM_VERSION, candidates: [] };
        }

        // 7. 상위 20% 기준 개수 계산 (올림)
        const topCount = Math.ceil(validPairs.length * MATCHING_CONSTANTS.TOP_PAIR_RATIO);

        // 8. 점수 내림차순 정렬 (동점 시 pair key 사전순으로 안정적 정렬)
        validPairs.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            const keyA = [a.userAId, a.userBId].sort().join('-');
            const keyB = [b.userAId, b.userBId].sort().join('-');
            return keyA.localeCompare(keyB);
        });

        // 9. 상위 20% 선발 + 커트라인 동점자 전부 포함
        const cutoffScore = validPairs[topCount - 1].score;
        const selectedPairs = validPairs.filter((p) => p.score >= cutoffScore);

        this.logger.log(
            `전체 조합 ${validPairs.length}개 중 상위 ${topCount}개 기준, 동점 포함 ${selectedPairs.length}개 선발 (커트라인: ${cutoffScore}점)`,
            'GetMatchCandidatesUseCase',
            { userId, quizSetId },
        );

        // 10. 개인별 후보 Map 구성 (양방향)
        type CandidateEntry = { partnerId: string; score: number; scoreBreakdown: ScoreBreakdown };
        const userCandidateMap = new Map<string, CandidateEntry[]>();

        for (const pair of selectedPairs) {
            if (!userCandidateMap.has(pair.userAId)) userCandidateMap.set(pair.userAId, []);
            if (!userCandidateMap.has(pair.userBId)) userCandidateMap.set(pair.userBId, []);
            userCandidateMap.get(pair.userAId).push({ partnerId: pair.userBId, score: pair.score, scoreBreakdown: pair.scoreBreakdown });
            userCandidateMap.get(pair.userBId).push({ partnerId: pair.userAId, score: pair.score, scoreBreakdown: pair.scoreBreakdown });
        }

        // 11. 개인별 Hard Limit 적용 (최대 maxPerUser명) - 양방향 제거
        let changed = true;
        while (changed) {
            changed = false;
            for (const [uid, candidates] of userCandidateMap.entries()) {
                if (candidates.length <= maxPerUser) continue;

                // 점수 내림차순 정렬 후 초과분 제거
                candidates.sort((a, b) => b.score - a.score);
                const removed = candidates.splice(maxPerUser);
                changed = true;

                // 제외된 상대방 목록에서도 해당 유저 제거 (양방향)
                for (const r of removed) {
                    const partnerList = userCandidateMap.get(r.partnerId);
                    if (!partnerList) continue;
                    const idx = partnerList.findIndex((c) => c.partnerId === uid);
                    if (idx !== -1) partnerList.splice(idx, 1);
                }
            }
        }

        // 12. 요청 유저의 후보 목록 반환
        const myCandidates = (userCandidateMap.get(userId) ?? [])
            .sort((a, b) => b.score - a.score);

        this.logger.log(`매칭 후보 ${myCandidates.length}명 반환`, 'GetMatchCandidatesUseCase', { userId, quizSetId });

        const candidateDtos: MatchCandidateDto[] = myCandidates.map((c) => {
            const user = userMap.get(c.partnerId);
            const profile = profileMap.get(c.partnerId);
            return {
                userId: user.id,
                nickname: user.nickname,
                gender: user.gender,
                age: user.age,
                introduction: profile?.introduction ?? null,
                location: profile?.location ?? null,
                profileImageUrl: profile?.profileImageUrl ?? null,
                matchRate: c.scoreBreakdown.quizMatchRate,
                scoreBreakdown: c.scoreBreakdown,
            };
        });

        // 13. 수락된 매칭 상대가 후보 목록에 없으면 맨 앞에 추가
        //     (어드민 수동 매칭 등으로 커트라인 밖 상대와 연결된 경우)
        const acceptedMatch = await this.matchRepo.findAcceptedMatch(userId, quizSetId);
        if (acceptedMatch) {
            const acceptedPartnerId = acceptedMatch.fromUserId === userId
                ? acceptedMatch.toUserId
                : acceptedMatch.fromUserId;
            const alreadyInList = candidateDtos.some((c) => c.userId === acceptedPartnerId);
            if (!alreadyInList) {
                const partnerUser = userMap.get(acceptedPartnerId)
                    ?? await this.prisma.user.findUnique({ where: { id: acceptedPartnerId } });
                const partnerProfile = profileMap.get(acceptedPartnerId)
                    ?? await this.prisma.userProfile.findUnique({ where: { userId: acceptedPartnerId } });
                if (partnerUser) {
                    const answersA: UserAnswerMap = { userId, answers: answersByUser.get(userId) ?? new Map() };
                    const answersB: UserAnswerMap = { userId: acceptedPartnerId, answers: answersByUser.get(acceptedPartnerId) ?? new Map() };
                    const breakdown = this.scoreService.calculateScore(answersA, answersB);
                    candidateDtos.unshift({
                        userId: partnerUser.id,
                        nickname: partnerUser.nickname,
                        gender: partnerUser.gender,
                        age: partnerUser.age,
                        introduction: partnerProfile?.introduction ?? null,
                        location: partnerProfile?.location ?? null,
                        profileImageUrl: partnerProfile?.profileImageUrl ?? null,
                        matchRate: breakdown.quizMatchRate,
                        scoreBreakdown: breakdown,
                    });
                    this.logger.log('수락된 매칭 상대를 후보 목록에 강제 추가', 'GetMatchCandidatesUseCase', { userId, acceptedPartnerId });
                }
            }
        }

        return {
            quizSetId,
            matchingType,
            algorithmVersion: MATCHING_CONSTANTS.ALGORITHM_VERSION,
            candidates: candidateDtos,
        };
    }
}
