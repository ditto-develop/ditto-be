import { BusinessRuleException } from '@common/exceptions/domain.exception';

export enum MatchRequestStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED',
    EXPIRED = 'EXPIRED',
}

/** 상태 전이 규칙 */
const VALID_TRANSITIONS: Record<MatchRequestStatus, MatchRequestStatus[]> = {
    [MatchRequestStatus.PENDING]: [
        MatchRequestStatus.ACCEPTED,
        MatchRequestStatus.REJECTED,
        MatchRequestStatus.CANCELLED,
        MatchRequestStatus.EXPIRED,
    ],
    [MatchRequestStatus.ACCEPTED]: [],
    [MatchRequestStatus.REJECTED]: [],
    [MatchRequestStatus.CANCELLED]: [],
    [MatchRequestStatus.EXPIRED]: [],
};

export interface ScoreBreakdown {
    quizMatchRate: number;       // 퀴즈 일치율 (0~100)
    matchedQuestions: number;    // 일치한 퀴즈 수
    totalQuestions: number;      // 전체 퀴즈 수
    reasons: string[];           // 설명 목록
}

export class MatchRequest {
    constructor(
        public readonly id: string,
        public readonly quizSetId: string,
        public readonly fromUserId: string,
        public readonly toUserId: string,
        public readonly status: MatchRequestStatus,
        public readonly score: number,
        public readonly scoreBreakdown: ScoreBreakdown | null,
        public readonly algorithmVersion: string,
        public readonly requestedAt: Date,
        public readonly respondedAt: Date | null,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) { }

    static create(
        id: string,
        quizSetId: string,
        fromUserId: string,
        toUserId: string,
        score: number,
        scoreBreakdown: ScoreBreakdown | null,
        algorithmVersion: string = 'v1',
    ): MatchRequest {
        if (fromUserId === toUserId) {
            throw new BusinessRuleException('자기 자신에게 매칭 요청을 보낼 수 없습니다.');
        }
        return new MatchRequest(
            id, quizSetId, fromUserId, toUserId,
            MatchRequestStatus.PENDING, score, scoreBreakdown,
            algorithmVersion, new Date(), null, new Date(), new Date(),
        );
    }

    /** 상태 전이 가능 여부 */
    canTransitionTo(newStatus: MatchRequestStatus): boolean {
        return VALID_TRANSITIONS[this.status].includes(newStatus);
    }

    /** 수락 */
    accept(): MatchRequest {
        this.assertTransition(MatchRequestStatus.ACCEPTED);
        return new MatchRequest(
            this.id, this.quizSetId, this.fromUserId, this.toUserId,
            MatchRequestStatus.ACCEPTED, this.score, this.scoreBreakdown,
            this.algorithmVersion, this.requestedAt, new Date(), this.createdAt, new Date(),
        );
    }

    /** 거절 */
    reject(): MatchRequest {
        this.assertTransition(MatchRequestStatus.REJECTED);
        return new MatchRequest(
            this.id, this.quizSetId, this.fromUserId, this.toUserId,
            MatchRequestStatus.REJECTED, this.score, this.scoreBreakdown,
            this.algorithmVersion, this.requestedAt, new Date(), this.createdAt, new Date(),
        );
    }

    /** 취소 */
    cancel(): MatchRequest {
        this.assertTransition(MatchRequestStatus.CANCELLED);
        return new MatchRequest(
            this.id, this.quizSetId, this.fromUserId, this.toUserId,
            MatchRequestStatus.CANCELLED, this.score, this.scoreBreakdown,
            this.algorithmVersion, this.requestedAt, new Date(), this.createdAt, new Date(),
        );
    }

    isPending(): boolean { return this.status === MatchRequestStatus.PENDING; }
    isAccepted(): boolean { return this.status === MatchRequestStatus.ACCEPTED; }

    private assertTransition(target: MatchRequestStatus): void {
        if (!this.canTransitionTo(target)) {
            throw new BusinessRuleException(
                `매칭 요청 상태를 ${this.status}에서 ${target}(으)로 변경할 수 없습니다.`,
            );
        }
    }
}
