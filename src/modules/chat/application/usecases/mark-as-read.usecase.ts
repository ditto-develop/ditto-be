import { Inject, Injectable } from '@nestjs/common';
import {
    IChatRepository, CHAT_REPOSITORY_TOKEN,
} from '@module/chat/infrastructure/repository/chat.repository.interface';
import { EntityNotFoundException, BusinessRuleException } from '@common/exceptions/domain.exception';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class MarkAsReadUseCase {
    constructor(
        @Inject(CHAT_REPOSITORY_TOKEN) private readonly chatRepo: IChatRepository,
        @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
    ) { }

    async execute(userId: string, roomId: string): Promise<void> {
        this.logger.log('읽음 처리', 'MarkAsReadUseCase', { userId, roomId });

        // 1. 방 존재 확인
        const room = await this.chatRepo.findRoomById(roomId);
        if (!room) throw new EntityNotFoundException('채팅방', roomId);

        // 2. 참여자 확인
        const isParticipant = await this.chatRepo.isParticipant(roomId, userId);
        if (!isParticipant) {
            throw new BusinessRuleException('채팅방 참여자만 읽음 처리를 할 수 있습니다.');
        }

        // 3. lastReadAt 갱신
        await this.chatRepo.updateLastReadAt(roomId, userId, new Date());
    }
}
