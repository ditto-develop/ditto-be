import { Inject, Injectable } from '@nestjs/common';
import {
    IMatchRequestRepository, MATCH_REQUEST_REPOSITORY_TOKEN,
} from '@module/matching/infrastructure/repository/match-request.repository.interface';
import { MatchRequestDto, MatchingStatusDto } from '@module/matching/application/dto/match-request.dto';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';
import { PrismaService } from '@module/common/prisma/prisma.service';

@Injectable()
export class GetMatchingStatusUseCase {
    constructor(
        @Inject(MATCH_REQUEST_REPOSITORY_TOKEN) private readonly repo: IMatchRequestRepository,
        @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
        private readonly prisma: PrismaService,
    ) { }

    async execute(userId: string, quizSetId: string): Promise<MatchingStatusDto> {
        this.logger.log('매칭 상태 조회', 'GetMatchingStatusUseCase', { userId, quizSetId });

        const [sent, received, acceptedMatch, progress, groupParticipant] = await Promise.all([
            this.repo.findSentByUser(userId, quizSetId),
            this.repo.findReceivedByUser(userId, quizSetId),
            this.repo.findAcceptedMatch(userId, quizSetId),
            this.prisma.userQuizProgress.findFirst({
                where: { userId, quizSetId },
                select: { groupDeclined: true },
            }),
            this.prisma.chatParticipant.findFirst({
                where: {
                    userId,
                    room: { quizSetId },
                },
            }),
        ]);

        const dto = new MatchingStatusDto();
        dto.quizSetId = quizSetId;
        dto.hasAcceptedMatch = !!acceptedMatch;
        if (acceptedMatch) {
            dto.acceptedMatchUserId = acceptedMatch.fromUserId === userId
                ? acceptedMatch.toUserId
                : acceptedMatch.fromUserId;
        }
        dto.sentRequests = sent.map(MatchRequestDto.fromDomain);
        dto.receivedRequests = received.map(MatchRequestDto.fromDomain);
        dto.groupDeclined = progress?.groupDeclined ?? false;
        dto.groupJoined = !!groupParticipant;

        return dto;
    }
}
