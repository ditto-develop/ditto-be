import { Inject, Injectable } from '@nestjs/common';
import { IChatRepository, CHAT_REPOSITORY_TOKEN } from '@module/chat/infrastructure/repository/chat.repository.interface';
import { GroupMessageListDto } from '@module/chat/application/dto/group-chat.dto';
import { EntityNotFoundException, BusinessRuleException } from '@common/exceptions/domain.exception';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class GetGroupMessagesUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY_TOKEN) private readonly chatRepo: IChatRepository,
    @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
  ) {}

  async execute(userId: string, roomId: string, cursor?: string, limit?: number): Promise<GroupMessageListDto> {
    this.logger.log('그룹 채팅 메시지 조회', 'GetGroupMessagesUseCase', { userId, roomId, cursor });

    const room = await this.chatRepo.findRoomById(roomId);
    if (!room) throw new EntityNotFoundException('채팅방', roomId);

    const isParticipant = await this.chatRepo.isParticipant(roomId, userId);
    if (!isParticipant) {
      throw new BusinessRuleException('채팅방 참여자만 메시지를 조회할 수 있습니다.');
    }

    const result = await this.chatRepo.findGroupMessagesByRoomId(roomId, cursor, limit);

    return {
      messages: result.messages.map((m) => ({
        id: m.id,
        type: m.type,
        senderId: m.senderId,
        senderNickname: m.senderNickname,
        senderAvatarUrl: m.senderAvatarUrl,
        content: m.content,
        createdAt: m.createdAt,
        unreadCount: m.unreadCount,
        ...(m.voteMeta ? { voteMeta: m.voteMeta } : {}),
      })),
      nextCursor: result.nextCursor,
    };
  }
}
