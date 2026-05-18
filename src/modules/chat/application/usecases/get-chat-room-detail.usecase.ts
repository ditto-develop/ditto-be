import { Inject, Injectable } from '@nestjs/common';
import {
  IChatRepository,
  CHAT_REPOSITORY_TOKEN,
} from '@module/chat/infrastructure/repository/chat.repository.interface';
import { ChatRoomDetailDto } from '@module/chat/application/dto/chat-room.dto';
import { EntityNotFoundException } from '@common/exceptions/domain.exception';
import { ForbiddenException } from '@common/exceptions/application.exception';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class GetChatRoomDetailUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY_TOKEN) private readonly chatRepo: IChatRepository,
    @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
  ) {}

  async execute(currentUserId: string, roomId: string): Promise<ChatRoomDetailDto> {
    this.logger.log('채팅방 상세 조회', 'GetChatRoomDetailUseCase', { currentUserId, roomId });

    const isParticipant = await this.chatRepo.isParticipant(roomId, currentUserId);
    if (!isParticipant) {
      throw new ForbiddenException('채팅방 참여자만 조회할 수 있습니다.');
    }

    const detail = await this.chatRepo.findRoomDetailById(roomId, currentUserId);
    if (!detail) throw new EntityNotFoundException('채팅방', roomId);

    const room = await this.chatRepo.findRoomById(roomId);
    if (!room) throw new EntityNotFoundException('채팅방', roomId);
    const endedReason = room.endedReasonFor(currentUserId);

    return {
      roomId: detail.roomId,
      expiresAt: detail.expiresAt,
      partner: {
        userId: detail.partner.userId,
        nickname: detail.partner.nickname,
        profileImageUrl: detail.partner.profileImageUrl,
        matchScore: detail.partner.matchScore,
      },
      status: room.effectiveStatus,
      canSendMessage: room.canSendMessage,
      endedAt: room.effectiveEndedAt ? room.effectiveEndedAt.toISOString() : null,
      endedByUserId: room.endedByUserId,
      endedReason,
      isEnded: room.isEnded,
      isPartnerLeft: endedReason === 'PARTNER_LEFT',
      partnerLastReadMessageId:
        detail.readReceipts.find((receipt) => receipt.userId !== currentUserId)?.lastReadMessageId ?? null,
      readReceipts: detail.readReceipts.map((receipt) => ({
        userId: receipt.userId,
        lastReadMessageId: receipt.lastReadMessageId,
        readAt: receipt.readAt.toISOString(),
      })),
    };
  }
}
