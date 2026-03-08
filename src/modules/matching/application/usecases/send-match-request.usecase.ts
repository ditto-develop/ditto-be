import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '@module/common/prisma/prisma.service';
import {
    IUserRepository, USER_REPOSITORY_TOKEN,
} from '@module/user/infrastructure/repository/user.repository.interface';
import {
    IMatchRequestRepository, MATCH_REQUEST_REPOSITORY_TOKEN,
} from '@module/matching/infrastructure/repository/match-request.repository.interface';
import { MatchingScoreService } from '@module/matching/domain/services/matching-score.service';
import { MatchRequest } from '@module/matching/domain/entities/match-request.entity';
import { UserAnswerMap, MATCHING_CONSTANTS } from '@module/matching/domain/value-objects/match-candidate.vo';
import { SendMatchRequestDto, MatchRequestDto } from '@module/matching/application/dto/match-request.dto';
import { EntityNotFoundException, BusinessRuleException } from '@common/exceptions/domain.exception';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class SendMatchRequestUseCase {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(USER_REPOSITORY_TOKEN) private readonly userRepo: IUserRepository,
        @Inject(MATCH_REQUEST_REPOSITORY_TOKEN) private readonly matchRequestRepo: IMatchRequestRepository,
        private readonly scoreService: MatchingScoreService,
        @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
    ) { }

    async execute(fromUserId: string, dto: SendMatchRequestDto): Promise<MatchRequestDto> {
        this.logger.log('매칭 요청 전송', 'SendMatchRequestUseCase', { fromUserId, dto });

        // 1. 자기 자신 체크
        if (fromUserId === dto.toUserId) {
            throw new BusinessRuleException('자기 자신에게 매칭 요청을 보낼 수 없습니다.');
        }

        // 2. 사용자 존재 & 활성 체크
        const fromUser = await this.userRepo.findById(fromUserId);
        if (!fromUser || !fromUser.isActive()) {
            throw new EntityNotFoundException('활성 사용자', fromUserId);
        }
        const toUser = await this.userRepo.findById(dto.toUserId);
        if (!toUser || !toUser.isActive()) {
            throw new EntityNotFoundException('대상 사용자', dto.toUserId);
        }

        // 3. 중복 요청 체크 (같은 quizSet, 같은 상대)
        const existing = await this.matchRequestRepo.findByQuizSetAndUsers(dto.quizSetId, fromUserId, dto.toUserId);
        if (existing) {
            throw new BusinessRuleException('이미 해당 퀴즈셋에서 같은 상대에게 요청을 보냈습니다.');
        }

        // 4. 이미 매칭 확정된 유저인지 체크
        const hasMatch = await this.matchRequestRepo.hasAcceptedMatch(fromUserId, dto.quizSetId);
        if (hasMatch) {
            throw new BusinessRuleException('이미 해당 퀴즈셋에서 매칭이 확정되었습니다.');
        }

        // 5. 퀴즈 답변 기반 스코어 계산
        const myAnswersRaw = await this.prisma.quizAnswer.findMany({
            where: { userId: fromUserId, quiz: { quizSetId: dto.quizSetId } },
        });
        const toAnswersRaw = await this.prisma.quizAnswer.findMany({
            where: { userId: dto.toUserId, quiz: { quizSetId: dto.quizSetId } },
        });

        const myMap: UserAnswerMap = {
            userId: fromUserId,
            answers: new Map(myAnswersRaw.map((a) => [a.quizId, a.choiceId])),
        };
        const toMap: UserAnswerMap = {
            userId: dto.toUserId,
            answers: new Map(toAnswersRaw.map((a) => [a.quizId, a.choiceId])),
        };

        const breakdown = this.scoreService.calculateScore(myMap, toMap);

        // 6. MatchRequest 생성
        const request = MatchRequest.create(
            uuidv4(),
            dto.quizSetId,
            fromUserId,
            dto.toUserId,
            breakdown.quizMatchRate,
            breakdown,
            MATCHING_CONSTANTS.ALGORITHM_VERSION,
        );

        const saved = await this.matchRequestRepo.create(request);
        this.logger.log('매칭 요청 생성 완료', 'SendMatchRequestUseCase', { id: saved.id });

        return MatchRequestDto.fromDomain(saved);
    }
}
