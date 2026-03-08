import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
    IChatRepository, CHAT_REPOSITORY_TOKEN,
} from '@module/chat/infrastructure/repository/chat.repository.interface';
import {
    IMatchRequestRepository, MATCH_REQUEST_REPOSITORY_TOKEN,
} from '@module/matching/infrastructure/repository/match-request.repository.interface';
import { ChatRoom } from '@module/chat/domain/entities/chat-room.entity';
import { ChatRoomItemDto } from '@module/chat/application/dto/chat-room.dto';
import { ChatMessageDto } from '@module/chat/application/dto/chat-message.dto';
import { EntityNotFoundException, BusinessRuleException } from '@common/exceptions/domain.exception';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class CreateChatRoomUseCase {
    constructor(
        @Inject(CHAT_REPOSITORY_TOKEN) private readonly chatRepo: IChatRepository,
        @Inject(MATCH_REQUEST_REPOSITORY_TOKEN) private readonly matchRequestRepo: IMatchRequestRepository,
        @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
    ) { }

    async execute(currentUserId: string, matchRequestId: string): Promise<ChatRoomItemDto> {
        this.logger.log('채팅방 생성', 'CreateChatRoomUseCase', { currentUserId, matchRequestId });

        // 1. 매칭 요청 확인
        const matchRequest = await this.matchRequestRepo.findById(matchRequestId);
        if (!matchRequest) throw new EntityNotFoundException('매칭 요청', matchRequestId);

        // 2. ACCEPTED 상태 확인
        if (!matchRequest.isAccepted()) {
            throw new BusinessRuleException('매칭이 성사된 건에 대해서만 채팅방을 생성할 수 있습니다.');
        }

        // 3. 매칭 당사자 확인
        const isParticipant =
            matchRequest.fromUserId === currentUserId || matchRequest.toUserId === currentUserId;
        if (!isParticipant) {
            throw new BusinessRuleException('해당 매칭의 당사자만 채팅방을 생성할 수 있습니다.');
        }

        // 4. 이미 존재하는 방 재사용
        const existing = await this.chatRepo.findRoomByMatchRequestId(matchRequestId);
        if (existing) {
            const rooms = await this.chatRepo.findRoomsByUserId(currentUserId);
            const found = rooms.find((r) => r.room.id === existing.id);
            if (found) return this.toDto(found);
        }

        // 5. 동일 두 사용자 조합 중복 방지
        const participantIds = [matchRequest.fromUserId, matchRequest.toUserId];
        const existingByUsers = await this.chatRepo.findRoomByParticipants(
            participantIds[0], participantIds[1],
        );
        if (existingByUsers) {
            const rooms = await this.chatRepo.findRoomsByUserId(currentUserId);
            const found = rooms.find((r) => r.room.id === existingByUsers.id);
            if (found) return this.toDto(found);
        }

        // 6. 새 방 생성
        const room = ChatRoom.create(uuidv4(), matchRequestId);
        await this.chatRepo.createRoom(room, participantIds);

        return {
            roomId: room.id,
            matchRequestId: room.matchRequestId,
            participantUserIds: participantIds,
            lastMessage: null,
            unreadCount: 0,
            createdAt: room.createdAt,
        };
    }

    private toDto(meta: { room: ChatRoom; participantUserIds: string[]; lastMessage: any; unreadCount: number }): ChatRoomItemDto {
        return {
            roomId: meta.room.id,
            matchRequestId: meta.room.matchRequestId,
            participantUserIds: meta.participantUserIds,
            lastMessage: meta.lastMessage ? ChatMessageDto.fromDomain(meta.lastMessage) : null,
            unreadCount: meta.unreadCount,
            createdAt: meta.room.createdAt,
        };
    }
}
