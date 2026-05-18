import { Inject, Injectable } from '@nestjs/common';
import {
  IChatRepository,
  CHAT_REPOSITORY_TOKEN,
} from '@module/chat/infrastructure/repository/chat.repository.interface';
import { ChatRoomItemDto } from '@module/chat/application/dto/chat-room.dto';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class GetChatRoomsUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY_TOKEN) private readonly chatRepo: IChatRepository,
    @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
  ) {}

  async execute(userId: string): Promise<ChatRoomItemDto[]> {
    this.logger.log('채팅방 목록 조회', 'GetChatRoomsUseCase', { userId });

    const rooms = await this.chatRepo.findRoomsByUserId(userId);

    return rooms.map((r) => {
      const partnerLastReadMessageId =
        r.readReceipts.find((receipt) => receipt.userId !== userId)?.lastReadMessageId ?? null;
      const endedReason = r.room.endedReasonFor(userId);
      return {
        roomId: r.room.id,
        partnerNickname: r.partnerUsers[0]?.nickname ?? '',
        partnerAvatarUrl: r.partnerUsers[0]?.profileImageUrl ?? null,
        lastMessageContent: r.lastMessage ? (r.lastMessage.isDeleted ? '' : r.lastMessage.content) : null,
        lastMessageAt: r.lastMessage ? r.lastMessage.createdAt.toISOString() : null,
        unreadCount: r.unreadCount,
        expiresAt: r.room.expiresAt ? r.room.expiresAt.toISOString() : null,
        isGroup: r.isGroup,
        coParticipantAvatarUrl: r.partnerUsers[1]?.profileImageUrl ?? null,
        status: r.room.effectiveStatus,
        canSendMessage: r.room.canSendMessage,
        endedAt: r.room.effectiveEndedAt ? r.room.effectiveEndedAt.toISOString() : null,
        endedByUserId: r.room.endedByUserId,
        endedReason,
        isEnded: r.room.isEnded,
        isPartnerLeft: endedReason === 'PARTNER_LEFT',
        partnerLastReadMessageId,
      };
    });
  }
}
