import { MatchRequest, MatchRequestStatus } from '../match-request.entity';
import { BusinessRuleException } from '@common/exceptions/domain.exception';

describe('MatchRequest', () => {
    const breakdown = { quizMatchRate: 80, matchedQuestions: 4, totalQuestions: 5, reasons: ['높은 일치율'] };

    describe('create', () => {
        it('정상 생성 시 PENDING 상태', () => {
            const req = MatchRequest.create('id', 'qs-1', 'from', 'to', 80, breakdown);
            expect(req.status).toBe(MatchRequestStatus.PENDING);
            expect(req.respondedAt).toBeNull();
        });

        it('자기 자신에게 요청 → BusinessRuleException', () => {
            expect(() =>
                MatchRequest.create('id', 'qs-1', 'same-user', 'same-user', 80, breakdown),
            ).toThrow(BusinessRuleException);
        });
    });

    describe('상태 전이', () => {
        let pending: MatchRequest;

        beforeEach(() => {
            pending = MatchRequest.create('id', 'qs-1', 'from', 'to', 80, breakdown);
        });

        it('PENDING → ACCEPTED', () => {
            const accepted = pending.accept();
            expect(accepted.status).toBe(MatchRequestStatus.ACCEPTED);
            expect(accepted.respondedAt).toBeInstanceOf(Date);
        });

        it('PENDING → REJECTED', () => {
            expect(pending.reject().status).toBe(MatchRequestStatus.REJECTED);
        });

        it('PENDING → CANCELLED', () => {
            expect(pending.cancel().status).toBe(MatchRequestStatus.CANCELLED);
        });

        it('ACCEPTED → REJECTED 불가', () => {
            const accepted = pending.accept();
            expect(() => accepted.reject()).toThrow(BusinessRuleException);
        });

        it('REJECTED → ACCEPTED 불가', () => {
            const rejected = pending.reject();
            expect(() => rejected.accept()).toThrow(BusinessRuleException);
        });

        it('ACCEPTED → ACCEPTED 불가 (이중 수락)', () => {
            const accepted = pending.accept();
            expect(() => accepted.accept()).toThrow(BusinessRuleException);
        });
    });

    describe('helper methods', () => {
        it('isPending / isAccepted', () => {
            const pending = MatchRequest.create('id', 'qs-1', 'from', 'to', 80, null);
            expect(pending.isPending()).toBe(true);
            expect(pending.isAccepted()).toBe(false);

            const accepted = pending.accept();
            expect(accepted.isPending()).toBe(false);
            expect(accepted.isAccepted()).toBe(true);
        });
    });
});
