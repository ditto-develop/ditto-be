import { Inject, Injectable } from '@nestjs/common';
import {
    IRatingRepository, RATING_REPOSITORY_TOKEN,
} from '@module/rating/infrastructure/repository/rating.repository.interface';
import { RatingPolicyService } from '@module/rating/domain/services/rating-policy.service';
import { UserRatingSummaryDto, RatingItemDto } from '@module/rating/application/dto/rating.dto';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class GetUserRatingsUseCase {
    constructor(
        @Inject(RATING_REPOSITORY_TOKEN) private readonly ratingRepo: IRatingRepository,
        private readonly policyService: RatingPolicyService,
        @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
    ) { }

    async execute(targetUserId: string): Promise<UserRatingSummaryDto> {
        this.logger.log('평가 조회', 'GetUserRatingsUseCase', { targetUserId });

        const ratings = await this.ratingRepo.findByTargetUser(targetUserId);
        const totalCount = ratings.length;
        const isPublic = this.policyService.isPublic(totalCount);

        const dto = new UserRatingSummaryDto();
        dto.userId = targetUserId;
        dto.totalCount = totalCount;
        dto.publicThreshold = this.policyService.getThreshold();
        dto.isPublic = isPublic;

        if (isPublic) {
            const scores = ratings.map((r) => r.score);
            dto.averageScore = this.policyService.calculateAverageScore(scores);
            dto.ratings = ratings.map(RatingItemDto.fromDomain);
        } else {
            dto.averageScore = null;
            dto.ratings = null;
        }

        return dto;
    }
}
