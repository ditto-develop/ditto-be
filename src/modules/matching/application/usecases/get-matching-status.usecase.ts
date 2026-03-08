import { Inject, Injectable } from '@nestjs/common';
import {
    IMatchRequestRepository, MATCH_REQUEST_REPOSITORY_TOKEN,
} from '@module/matching/infrastructure/repository/match-request.repository.interface';
import { MatchRequestDto, MatchingStatusDto } from '@module/matching/application/dto/match-request.dto';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class GetMatchingStatusUseCase {
    constructor(
        @Inject(MATCH_REQUEST_REPOSITORY_TOKEN) private readonly repo: IMatchRequestRepository,
        @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
    ) { }

    async execute(userId: string, quizSetId: string): Promise<MatchingStatusDto> {
        this.logger.log('매칭 상태 조회', 'GetMatchingStatusUseCase', { userId, quizSetId });

        const [sent, received, hasMatch] = await Promise.all([
            this.repo.findSentByUser(userId, quizSetId),
            this.repo.findReceivedByUser(userId, quizSetId),
            this.repo.hasAcceptedMatch(userId, quizSetId),
        ]);

        const dto = new MatchingStatusDto();
        dto.quizSetId = quizSetId;
        dto.hasAcceptedMatch = hasMatch;
        dto.sentRequests = sent.map(MatchRequestDto.fromDomain);
        dto.receivedRequests = received.map(MatchRequestDto.fromDomain);

        return dto;
    }
}
