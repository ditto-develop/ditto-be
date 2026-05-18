import { Inject, Injectable } from '@nestjs/common';
import {
  IChatRepository,
  CHAT_REPOSITORY_TOKEN,
} from '@module/chat/infrastructure/repository/chat.repository.interface';
import { ForbiddenException } from '@common/exceptions/application.exception';
import { BusinessRuleException, EntityNotFoundException } from '@common/exceptions/domain.exception';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class LeaveChatRoomUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY_TOKEN) private readonly chatRepo: IChatRepository,
    @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
  ) {}

  async execute(currentUserId: string, roomId: string, reason?: string): Promise<void> {
    this.logger.log('채팅방 나가기', 'LeaveChatRoomUseCase', { currentUserId, roomId, reason });

    const room = await this.chatRepo.findRoomById(roomId);
    if (!room) throw new EntityNotFoundException('채팅방', roomId);

    const isParticipant = await this.chatRepo.isParticipant(roomId, currentUserId);
    if (!isParticipant) {
      throw new ForbiddenException('채팅방 참여자만 나갈 수 있습니다.');
    }

    if (room.isEnded) {
      throw new BusinessRuleException('이미 종료된 채팅방입니다.');
    }

    await this.chatRepo.closeRoom(roomId, currentUserId, new Date());
  }
}
