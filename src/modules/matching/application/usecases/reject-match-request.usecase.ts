import { Inject, Injectable } from '@nestjs/common';
import {
    IMatchRequestRepository, MATCH_REQUEST_REPOSITORY_TOKEN,
} from '@module/matching/infrastructure/repository/match-request.repository.interface';
import { MatchRequestDto } from '@module/matching/application/dto/match-request.dto';
import { EntityNotFoundException, BusinessRuleException } from '@common/exceptions/domain.exception';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class RejectMatchRequestUseCase {
    constructor(
        @Inject(MATCH_REQUEST_REPOSITORY_TOKEN) private readonly repo: IMatchRequestRepository,
        @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
    ) { }

    async execute(requestId: string, currentUserId: string): Promise<MatchRequestDto> {
        this.logger.log('매칭 요청 거절', 'RejectMatchRequestUseCase', { requestId, currentUserId });

        const request = await this.repo.findById(requestId);
        if (!request) throw new EntityNotFoundException('매칭 요청', requestId);

        if (request.toUserId !== currentUserId) {
            throw new BusinessRuleException('매칭 요청은 수신자만 거절할 수 있습니다.');
        }

        const rejected = request.reject();
        const updated = await this.repo.updateStatus(rejected.id, rejected.status, rejected.respondedAt);

        return MatchRequestDto.fromDomain(updated);
    }
}
