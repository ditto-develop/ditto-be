import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
    IMatchRequestRepository, MATCH_REQUEST_REPOSITORY_TOKEN,
} from '@module/matching/infrastructure/repository/match-request.repository.interface';
import {
    IChatRepository, CHAT_REPOSITORY_TOKEN,
} from '@module/chat/infrastructure/repository/chat.repository.interface';
import { ChatRoom } from '@module/chat/domain/entities/chat-room.entity';
import { MatchRequestDto } from '@module/matching/application/dto/match-request.dto';
import { EntityNotFoundException, BusinessRuleException } from '@common/exceptions/domain.exception';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class AcceptMatchRequestUseCase {
    constructor(
        @Inject(MATCH_REQUEST_REPOSITORY_TOKEN) private readonly repo: IMatchRequestRepository,
        @Inject(CHAT_REPOSITORY_TOKEN) private readonly chatRepo: IChatRepository,
        @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
    ) { }

    async execute(requestId: string, currentUserId: string): Promise<MatchRequestDto> {
        this.logger.log('매칭 요청 수락', 'AcceptMatchRequestUseCase', { requestId, currentUserId });

        const request = await this.repo.findById(requestId);
        if (!request) throw new EntityNotFoundException('매칭 요청', requestId);

        // 권한: 수신자만 수락 가능
        if (request.toUserId !== currentUserId) {
            throw new BusinessRuleException('매칭 요청은 수신자만 수락할 수 있습니다.');
        }

        // 이미 해당 퀴즈셋에서 매칭 확정되었는지 체크
        const hasMatch = await this.repo.hasAcceptedMatch(currentUserId, request.quizSetId);
        if (hasMatch) {
            throw new BusinessRuleException('이미 해당 퀴즈셋에서 매칭이 확정되었습니다.');
        }

        // 상태 전이 (PENDING → ACCEPTED)
        const accepted = request.accept();
        const updated = await this.repo.updateStatus(accepted.id, accepted.status, accepted.respondedAt);

        // 채팅방 자동 생성 (이미 존재하면 재사용)
        const existingRoom = await this.chatRepo.findRoomByParticipants(
            request.fromUserId, request.toUserId,
        );
        if (!existingRoom) {
            const room = ChatRoom.create(uuidv4(), requestId);
            await this.chatRepo.createRoom(room, [request.fromUserId, request.toUserId]);
            this.logger.log('채팅방 자동 생성', 'AcceptMatchRequestUseCase', { roomId: room.id });
        }

        return MatchRequestDto.fromDomain(updated);
    }
}
