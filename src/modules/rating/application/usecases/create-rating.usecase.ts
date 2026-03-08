import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
    IMatchRequestRepository, MATCH_REQUEST_REPOSITORY_TOKEN,
} from '@module/matching/infrastructure/repository/match-request.repository.interface';
import {
    IRatingRepository, RATING_REPOSITORY_TOKEN,
} from '@module/rating/infrastructure/repository/rating.repository.interface';
import { UserRating } from '@module/rating/domain/entities/user-rating.entity';
import { CreateRatingDto, RatingItemDto } from '@module/rating/application/dto/rating.dto';
import { EntityNotFoundException, BusinessRuleException } from '@common/exceptions/domain.exception';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class CreateRatingUseCase {
    constructor(
        @Inject(MATCH_REQUEST_REPOSITORY_TOKEN) private readonly matchRequestRepo: IMatchRequestRepository,
        @Inject(RATING_REPOSITORY_TOKEN) private readonly ratingRepo: IRatingRepository,
        @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
    ) { }

    async execute(fromUserId: string, toUserId: string, dto: CreateRatingDto): Promise<RatingItemDto> {
        this.logger.log('평가 작성', 'CreateRatingUseCase', { fromUserId, toUserId, dto });

        // 1. 매칭 요청 확인
        const matchRequest = await this.matchRequestRepo.findById(dto.matchRequestId);
        if (!matchRequest) throw new EntityNotFoundException('매칭 요청', dto.matchRequestId);

        // 2. ACCEPTED 상태인지 확인
        if (!matchRequest.isAccepted()) {
            throw new BusinessRuleException('매칭이 성사된 건에 대해서만 평가할 수 있습니다.');
        }

        // 3. 매칭 당사자인지 확인 (fromUser 또는 toUser 중 하나여야 함)
        const isParticipant =
            (matchRequest.fromUserId === fromUserId && matchRequest.toUserId === toUserId) ||
            (matchRequest.fromUserId === toUserId && matchRequest.toUserId === fromUserId);

        if (!isParticipant) {
            throw new BusinessRuleException('해당 매칭의 당사자만 평가할 수 있습니다.');
        }

        // 4. 중복 평가 체크
        const existing = await this.ratingRepo.findByMatchRequestAndUser(dto.matchRequestId, fromUserId);
        if (existing) {
            throw new BusinessRuleException('이미 해당 매칭에 대해 평가를 작성했습니다.');
        }

        // 5. 도메인 엔티티 생성 (validation 포함)
        const rating = UserRating.create(
            uuidv4(),
            dto.matchRequestId,
            fromUserId,
            toUserId,
            dto.score,
            dto.comment ?? null,
        );

        const saved = await this.ratingRepo.create(rating);
        this.logger.log('평가 작성 완료', 'CreateRatingUseCase', { id: saved.id });

        return RatingItemDto.fromDomain(saved);
    }
}
