import { Inject, Injectable } from '@nestjs/common';
import {
    IChatRepository, CHAT_REPOSITORY_TOKEN,
} from '@module/chat/infrastructure/repository/chat.repository.interface';
import { ChatRoomItemDto } from '@module/chat/application/dto/chat-room.dto';
import { ChatMessageDto } from '@module/chat/application/dto/chat-message.dto';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class GetChatRoomsUseCase {
    constructor(
        @Inject(CHAT_REPOSITORY_TOKEN) private readonly chatRepo: IChatRepository,
        @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
    ) { }

    async execute(userId: string): Promise<ChatRoomItemDto[]> {
        this.logger.log('채팅방 목록 조회', 'GetChatRoomsUseCase', { userId });

        const rooms = await this.chatRepo.findRoomsByUserId(userId);

        return rooms.map((r) => ({
            roomId: r.room.id,
            matchRequestId: r.room.matchRequestId,
            participantUserIds: r.participantUserIds,
            lastMessage: r.lastMessage ? ChatMessageDto.fromDomain(r.lastMessage) : null,
            unreadCount: r.unreadCount,
            createdAt: r.room.createdAt,
        }));
    }
}
