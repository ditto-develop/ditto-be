import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  IChatRepository,
  CHAT_REPOSITORY_TOKEN,
} from '@module/chat/infrastructure/repository/chat.repository.interface';
import {
  IMatchRequestRepository,
  MATCH_REQUEST_REPOSITORY_TOKEN,
} from '@module/matching/infrastructure/repository/match-request.repository.interface';
import { ChatRoom } from '@module/chat/domain/entities/chat-room.entity';
import { ChatRoomItemDto } from '@module/chat/application/dto/chat-room.dto';
import { EntityNotFoundException, BusinessRuleException } from '@common/exceptions/domain.exception';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class CreateChatRoomUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY_TOKEN) private readonly chatRepo: IChatRepository,
    @Inject(MATCH_REQUEST_REPOSITORY_TOKEN) private readonly matchRequestRepo: IMatchRequestRepository,
    @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
  ) {}

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
    const isParticipant = matchRequest.fromUserId === currentUserId || matchRequest.toUserId === currentUserId;
    if (!isParticipant) {
      throw new BusinessRuleException('해당 매칭의 당사자만 채팅방을 생성할 수 있습니다.');
    }

    // 4. 이미 존재하는 방 재사용
    const existing = await this.chatRepo.findRoomByMatchRequestId(matchRequestId);
    if (existing) {
      const rooms = await this.chatRepo.findRoomsByUserId(currentUserId);
      const found = rooms.find((r) => r.room.id === existing.id);
      if (found) return this.toDto(found, currentUserId);
    }

    // 5. 동일 두 사용자 조합 중복 방지
    const participantIds = [matchRequest.fromUserId, matchRequest.toUserId];
    const existingByUsers = await this.chatRepo.findRoomByParticipants(participantIds[0], participantIds[1]);
    if (existingByUsers) {
      const rooms = await this.chatRepo.findRoomsByUserId(currentUserId);
      const found = rooms.find((r) => r.room.id === existingByUsers.id);
      if (found) return this.toDto(found, currentUserId);
    }

    // 6. 새 방 생성 후 목록 재조회하여 partner 정보 포함한 DTO 반환
    const room = ChatRoom.create(uuidv4(), matchRequestId);
    await this.chatRepo.createRoom(room, participantIds);

    const rooms = await this.chatRepo.findRoomsByUserId(currentUserId);
    const found = rooms.find((r) => r.room.id === room.id);
    if (found) return this.toDto(found, currentUserId);

    return {
      roomId: room.id,
      partnerNickname: '',
      partnerAvatarUrl: null,
      lastMessageContent: null,
      lastMessageAt: null,
      unreadCount: 0,
      expiresAt: room.expiresAt ? room.expiresAt.toISOString() : null,
      isGroup: false,
      coParticipantAvatarUrl: null,
      status: room.effectiveStatus,
      canSendMessage: room.canSendMessage,
      endedAt: room.effectiveEndedAt ? room.effectiveEndedAt.toISOString() : null,
      endedByUserId: room.endedByUserId,
      endedReason: room.endedReasonFor(currentUserId),
      isEnded: room.isEnded,
      isPartnerLeft: room.endedReasonFor(currentUserId) === 'PARTNER_LEFT',
      partnerLastReadMessageId: null,
    };
  }

  private toDto(
    meta: {
      room: ChatRoom;
      isGroup: boolean;
      partnerUsers: { userId: string; nickname: string; profileImageUrl: string | null }[];
      lastMessage: any;
      unreadCount: number;
      readReceipts: { userId: string; lastReadMessageId: string | null }[];
    },
    currentUserId?: string,
  ): ChatRoomItemDto {
    const endedReason = currentUserId ? meta.room.endedReasonFor(currentUserId) : null;
    return {
      roomId: meta.room.id,
      partnerNickname: meta.partnerUsers[0]?.nickname ?? '',
      partnerAvatarUrl: meta.partnerUsers[0]?.profileImageUrl ?? null,
      lastMessageContent: meta.lastMessage ? (meta.lastMessage.isDeleted ? '' : meta.lastMessage.content) : null,
      lastMessageAt: meta.lastMessage ? meta.lastMessage.createdAt.toISOString() : null,
      unreadCount: meta.unreadCount,
      expiresAt: meta.room.expiresAt ? meta.room.expiresAt.toISOString() : null,
      isGroup: meta.isGroup,
      coParticipantAvatarUrl: meta.partnerUsers[1]?.profileImageUrl ?? null,
      status: meta.room.effectiveStatus,
      canSendMessage: meta.room.canSendMessage,
      endedAt: meta.room.effectiveEndedAt ? meta.room.effectiveEndedAt.toISOString() : null,
      endedByUserId: meta.room.endedByUserId,
      endedReason,
      isEnded: meta.room.isEnded,
      isPartnerLeft: endedReason === 'PARTNER_LEFT',
      partnerLastReadMessageId: currentUserId
        ? (meta.readReceipts.find((receipt) => receipt.userId !== currentUserId)?.lastReadMessageId ?? null)
        : null,
    };
  }
}
