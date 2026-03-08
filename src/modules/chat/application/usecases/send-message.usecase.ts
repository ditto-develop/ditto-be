import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
    IChatRepository, CHAT_REPOSITORY_TOKEN,
} from '@module/chat/infrastructure/repository/chat.repository.interface';
import { ChatMessage } from '@module/chat/domain/entities/chat-message.entity';
import { ChatMessageDto } from '@module/chat/application/dto/chat-message.dto';
import { EntityNotFoundException, BusinessRuleException } from '@common/exceptions/domain.exception';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class SendMessageUseCase {
    constructor(
        @Inject(CHAT_REPOSITORY_TOKEN) private readonly chatRepo: IChatRepository,
        @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
    ) { }

    async execute(userId: string, roomId: string, content: string): Promise<ChatMessageDto> {
        this.logger.log('메시지 전송', 'SendMessageUseCase', { userId, roomId });

        // 1. 방 존재 확인
        const room = await this.chatRepo.findRoomById(roomId);
        if (!room) throw new EntityNotFoundException('채팅방', roomId);

        // 2. 참여자 확인
        const isParticipant = await this.chatRepo.isParticipant(roomId, userId);
        if (!isParticipant) {
            throw new BusinessRuleException('채팅방 참여자만 메시지를 전송할 수 있습니다.');
        }

        // 3. 도메인 엔티티 생성 (validation 포함)
        const message = ChatMessage.create(uuidv4(), roomId, userId, content);

        // 4. 저장
        const saved = await this.chatRepo.createMessage(message);

        return ChatMessageDto.fromDomain(saved);
    }
}
